/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { withAuth } from "@/lib/auth/auth-context";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  useAdminUsers,
  useUpdateUserRole,
  useBlockAdminUser,
  useUnblockAdminUser,
} from "@/hooks/use-admin-users";
import { SuperAdminOnly } from "@/lib/auth/role-guard";
import { UserX, UserCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function UserManagementPage() {
  const {
    data: users = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminUsers();
  const updateUserRoleMutation = useUpdateUserRole();
  const blockMutation = useBlockAdminUser();
  const unblockMutation = useUnblockAdminUser();

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<any>(null);

  const handleUpdateUserRole = (userId: string, newRole: string) => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  const handleBlockClick = (user: any) => {
    setUserToBlock(user);
    setBlockDialogOpen(true);
  };

  const handleConfirmBlock = () => {
    if (userToBlock) {
      blockMutation.mutate(userToBlock.id);
      setBlockDialogOpen(false);
      setUserToBlock(null);
    }
  };

  const handleUnblock = (userId: string) => {
    unblockMutation.mutate(userId);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "USER":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.blocked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
          Blocked
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader
          breadcrumbs={[
            { label: "Admin Panel", href: "/admin" },
            { label: "Admin Management" },
          ]}
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Admin Management
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage admin and super admin accounts across the system.
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  disabled={isLoading || isFetching}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <svg
                    className={`h-4 w-4 mr-2 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading admin users
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error.message}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => refetch()}
                        className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {user.email}
                              </p>
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                  user.role
                                )}`}
                              >
                                {user.role}
                              </span>
                              {getStatusBadge(user)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <p>
                                {user._count?.applications || 0} application
                                {user._count?.applications !== 1 ? "s" : ""}
                              </p>
                              <span className="mx-2">•</span>
                              <p>
                                Joined{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                              {user.blocked && user.blockedAt && (
                                <>
                                  <span className="mx-2">•</span>
                                  <p>
                                    Blocked{" "}
                                    {new Date(
                                      user.blockedAt
                                    ).toLocaleDateString()}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateUserRole(user.id, e.target.value)
                            }
                            disabled={
                              updateUserRoleMutation.isPending || user.blocked
                            }
                            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>

                          {user.blocked ? (
                            <button
                              onClick={() => handleUnblock(user.id)}
                              disabled={unblockMutation.isPending}
                              className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 disabled:opacity-50"
                              title="Unblock admin user"
                            >
                              {unblockMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockClick(user)}
                              disabled={blockMutation.isPending}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                              title="Block admin user"
                            >
                              {blockMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {updateUserRoleMutation.isPending && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {users.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No admin users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No admin or super admin accounts have been created yet.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Block Confirmation Dialog */}
        <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Block Admin User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to block {userToBlock?.email}? This will
                prevent them from accessing their admin account and performing
                admin actions.
                {userToBlock?.role === "SUPER_ADMIN" && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> You are about to block a Super
                      Admin user. This action should be used with extreme
                      caution.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmBlock}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Block Admin User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SuperAdminOnly>
  );
}

export default withAuth(UserManagementPage, { requireSuperAdmin: true });
