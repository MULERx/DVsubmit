/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NotificationData {
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: Date;
  read: boolean;
}

export class NotificationService {
  private static readonly STORAGE_KEY = "dv_notifications";

  /**
   * Add a new notification
   */
  static addNotification(
    notification: Omit<NotificationData, "timestamp" | "read">
  ): void {
    const notifications = this.getNotifications();
    const newNotification: NotificationData = {
      ...notification,
      timestamp: new Date(),
      read: false,
    };

    notifications.unshift(newNotification);

    // Keep only the last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }

    this.saveNotifications(notifications);
  }

  /**
   * Get all notifications
   */
  static getNotifications(): NotificationData[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.error("Error loading notifications:", error);
      return [];
    }
  }

  /**
   * Get unread notifications
   */
  static getUnreadNotifications(): NotificationData[] {
    return this.getNotifications().filter((n) => !n.read);
  }

  /**
   * Mark notification as read
   */
  static markAsRead(index: number): void {
    const notifications = this.getNotifications();
    if (notifications[index]) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
    }
  }

  /**
   * Mark all notifications as read
   */
  static markAllAsRead(): void {
    const notifications = this.getNotifications();
    notifications.forEach((n) => (n.read = true));
    this.saveNotifications(notifications);
  }

  /**
   * Clear all notifications
   */
  static clearAll(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Save notifications to localStorage
   */
  private static saveNotifications(notifications: NotificationData[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    }
  }

  /**
   * Create payment status notification
   */
  static createPaymentStatusNotification(
    status: "VERIFIED" | "REJECTED" | "REFUNDED",
    paymentReference: string
  ): void {
    switch (status) {
      case "VERIFIED":
        this.addNotification({
          title: "Payment Verified",
          message: `Your payment (${paymentReference}) has been verified. You can now proceed to review and submit your application.`,
          type: "success",
        });
        break;
      case "REJECTED":
        this.addNotification({
          title: "Payment Rejected",
          message: `Your payment (${paymentReference}) could not be verified. Please submit a new payment reference.`,
          type: "error",
        });
        break;
      case "REFUNDED":
        this.addNotification({
          title: "Payment Refunded",
          message: `Your payment (${paymentReference}) has been refunded. You can submit a new payment to continue.`,
          type: "info",
        });
        break;
    }
  }

  /**
   * Create application status notification
   */
  static createApplicationStatusNotification(
    status: "SUBMITTED" | "CONFIRMED" | "EXPIRED",
    details?: string
  ): void {
    switch (status) {
      case "SUBMITTED":
        this.addNotification({
          title: "Application Submitted",
          message:
            "Your DV lottery application has been submitted to the U.S. State Department.",
          type: "success",
        });
        break;
      case "CONFIRMED":
        this.addNotification({
          title: "Submission Confirmed",
          message: `Your DV lottery application has been confirmed. ${
            details || ""
          }`,
          type: "success",
        });
        break;
      case "EXPIRED":
        this.addNotification({
          title: "Application Expired",
          message:
            "Your application has expired due to inactivity or deadline passage.",
          type: "warning",
        });
        break;
    }
  }
}
