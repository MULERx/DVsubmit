import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  blocked: boolean;
  blockedAt: string | null;
  blockedBy: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUser[];
}

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch("/api/admin/users");

  if (!response.ok) {
    throw new Error("Failed to fetch admin users");
  }

  const data: AdminUsersResponse = await response.json();

  if (!data.success) {
    throw new Error("Failed to fetch admin users");
  }

  return data.users;
}

async function updateUserRole(userId: string, role: string): Promise<void> {
  const response = await fetch("/api/admin/users/update-role", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user role");
  }
}

async function blockAdminUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}/block`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to block user");
  }
}

async function unblockAdminUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}/unblock`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to unblock user");
  }
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchAdminUsers,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: (_, { userId, role }) => {
      // Update the cache optimistically
      queryClient.setQueryData(
        ["admin", "users"],
        (oldData: AdminUser[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((user) =>
            user.id === userId ? { ...user, role } : user
          );
        }
      );

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBlockAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: blockAdminUser,
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

      toast({
        title: "Success",
        description: "Admin user has been blocked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUnblockAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: unblockAdminUser,
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

      toast({
        title: "Success",
        description: "Admin user has been unblocked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
