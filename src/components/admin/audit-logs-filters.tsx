"use client";

import { useState, useEffect } from "react";
import { Search, X, Calendar, User, FileText, Activity } from "lucide-react";

interface Filters {
  action: string;
  userId: string;
  applicationId: string;
  startDate: string;
  endDate: string;
  search: string;
}

interface AuditLogsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  loading: boolean;
}

const commonActions = [
  "user_login",
  "user_logout",
  "user_register",
  "application_create",
  "application_update",
  "application_submit",
  "application_reject",
  "payment_verify",
  "payment_reject",
  "admin_action",
];

export function AuditLogsFilters({
  filters,
  onFiltersChange,
}: AuditLogsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [applications, setApplications] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilters, onFiltersChange]);

  // Fetch users and applications for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch("/api/admin/users");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users || []);
        }

        // Fetch applications
        const appsResponse = await fetch("/api/admin/applications");
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData.applications || []);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const emptyFilters: Filters = {
      action: "",
      userId: "",
      applicationId: "",
      startDate: "",
      endDate: "",
      search: "",
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value !== ""
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={localFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search actions, IPs, emails..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Action */}
        <div>
          <label
            htmlFor="action"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Action
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="action"
              value={localFilters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All actions</option>
              {commonActions.map((action) => (
                <option key={action} value={action}>
                  {action
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User */}
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            User
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="userId"
              value={localFilters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none  focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Application */}
        <div>
          <label
            htmlFor="applicationId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Application
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="applicationId"
              value={localFilters.applicationId}
              onChange={(e) =>
                handleFilterChange("applicationId", e.target.value)
              }
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              id="startDate"
              value={localFilters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              id="endDate"
              value={localFilters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value) return null;

              let displayValue = value;
              if (key === "userId") {
                const user = users.find((u) => u.id === value);
                displayValue = user ? user.email : value;
              } else if (key === "applicationId") {
                const app = applications.find((a) => a.id === value);
                displayValue = app ? app.name : value;
              } else if (key === "action") {
                displayValue = value
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase());
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key as keyof Filters, "")}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
