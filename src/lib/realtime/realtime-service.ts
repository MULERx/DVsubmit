/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export type RealtimeConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface RealtimeEvent<T = any> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  new?: T;
  old?: T;
  errors?: string[];
  commit_timestamp?: string;
}

export interface RealtimeSubscriptionConfig {
  table: string;
  schema?: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  filter?: string;
}

export class RealtimeService {
  private supabase = createClient();
  private channels = new Map<string, RealtimeChannel>();
  private statusCallbacks = new Map<
    string,
    (status: RealtimeConnectionStatus) => void
  >();

  /**
   * Subscribe to realtime changes for a specific table
   */
  subscribe<T = any>(
    channelName: string,
    config: RealtimeSubscriptionConfig,
    onEvent: (event: RealtimeEvent<T>) => void,
    onStatusChange?: (status: RealtimeConnectionStatus) => void
  ): () => void {
    // Clean up existing channel if it exists
    this.unsubscribe(channelName);

    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        {
          event: config.event || "*",
          schema: config.schema || "public",
          table: config.table,
          ...(config.filter && { filter: config.filter }),
        },
        (payload: any) => {
          const event: RealtimeEvent<T> = {
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            table: payload.table,
            schema: payload.schema,
            new: payload.new,
            old: payload.old,
            errors: payload.errors,
            commit_timestamp: payload.commit_timestamp,
          };
          onEvent(event);
        }
      )
      .subscribe((status) => {
        const connectionStatus = this.mapSupabaseStatus(status);

        if (onStatusChange) {
          onStatusChange(connectionStatus);
        }

        const callback = this.statusCallbacks.get(channelName);
        if (callback) {
          callback(connectionStatus);
        }
      });

    this.channels.set(channelName, channel);

    if (onStatusChange) {
      this.statusCallbacks.set(channelName, onStatusChange);
    }

    // Return cleanup function
    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.statusCallbacks.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((_, channelName) => {
      this.unsubscribe(channelName);
    });
  }

  /**
   * Get connection status for a specific channel
   */
  getChannelStatus(channelName: string): RealtimeConnectionStatus {
    const channel = this.channels.get(channelName);
    if (!channel) return "disconnected";

    // This is a simplified status check - in practice, you might want to track this more precisely
    return "connected";
  }

  /**
   * Map Supabase status to our internal status
   */
  private mapSupabaseStatus(status: string): RealtimeConnectionStatus {
    switch (status) {
      case "SUBSCRIBED":
        return "connected";
      case "CHANNEL_ERROR":
        return "error";
      case "TIMED_OUT":
        return "disconnected";
      case "CLOSED":
        return "disconnected";
      default:
        return "connecting";
    }
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();
