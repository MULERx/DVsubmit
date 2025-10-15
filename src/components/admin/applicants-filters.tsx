"use client";

import { useState, useEffect } from "react";
import { Search, X, Users, UserCheck, UserX } from "lucide-react";

interface ApplicantsFiltersProps {
  search: string;
  status: "active" | "blocked" | "all";
  onSearchChange: (search: string) => void;
  onStatusChange: (status: "active" | "blocked" | "all") => void;
  loading: boolean;
}

export function ApplicantsFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ApplicantsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const clearFilters = () => {
    setLocalSearch("");
    onSearchChange("");
    onStatusChange("all");
  };

  const hasActiveFilters = search || status !== "all";

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
            Search by Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by email address..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {status === "active" ? (
                <UserCheck className="h-4 w-4 text-green-400" />
              ) : status === "blocked" ? (
                <UserX className="h-4 w-4 text-red-400" />
              ) : (
                <Users className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <select
              id="status"
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as "active" | "blocked" | "all")
              }
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Applicants</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Email: {search}
                <button
                  onClick={() => {
                    setLocalSearch("");
                    onSearchChange("");
                  }}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <X className="w-2 h-2" />
                </button>
              </span>
            )}

            {status !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Status: {status === "active" ? "Active" : "Blocked"}
                <button
                  onClick={() => onStatusChange("all")}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <X className="w-2 h-2" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
