import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface Applicant {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  blocked: boolean;
  blockedAt: string | null;
  blockedBy: string | null;
  _count: {
    applications: number;
  };
  applications: Array<{
    id: string;
    status: string;
    familyName: string;
    givenName: string;
    createdAt: string;
    submittedAt: string | null;
    confirmationNumber: string | null;
  }>;
}

export interface ApplicantsResponse {
  success: boolean;
  data: {
    applicants: Applicant[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApplicantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "blocked" | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function fetchApplicants(
  params: ApplicantsParams = {}
): Promise<ApplicantsResponse["data"]> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(
    `/api/admin/applicants?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applicants");
  }

  const result: ApplicantsResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Failed to fetch applicants");
  }

  return result.data;
}

async function blockApplicant(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/applicants/${userId}/block`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to block applicant");
  }
}

async function unblockApplicant(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/applicants/${userId}/unblock`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to unblock applicant");
  }
}

export function useApplicants(params: ApplicantsParams = {}) {
  return useQuery({
    queryKey: ["admin", "applicants", params],
    queryFn: () => fetchApplicants(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useBlockApplicant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: blockApplicant,
    onSuccess: () => {
      // Invalidate and refetch applicants data
      queryClient.invalidateQueries({ queryKey: ["admin", "applicants"] });

      toast({
        title: "Success",
        description: "Applicant has been blocked successfully",
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

export function useUnblockApplicant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: unblockApplicant,
    onSuccess: () => {
      // Invalidate and refetch applicants data
      queryClient.invalidateQueries({ queryKey: ["admin", "applicants"] });

      toast({
        title: "Success",
        description: "Applicant has been unblocked successfully",
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
