"use client";

import { useState } from "react";
import { 
  Eye, 
  User, 
  FileText, 
  Shield, 
  Activity,
  Clock,
  Globe,
  Monitor
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  application: {
    id: string;
    familyName: string;
    givenName: string;
    email: string;
    status: string;
  } | null;
}

interface AuditLogsTableProps {
  auditLogs: AuditLog[];
  loading: boolean;
  onSelectLog: (log: AuditLog) => void;
}

const getActionIcon = (action: string) => {
  if (action.includes("login") || action.includes("auth")) {
    return <Shield className="h-4 w-4 text-blue-500" />;
  }
  if (action.includes("user") || action.includes("profile")) {
    return <User className="h-4 w-4 text-green-500" />;
  }
  if (action.includes("application") || action.includes("form")) {
    return <FileText className="h-4 w-4 text-purple-500" />;
  }
  return <Activity className="h-4 w-4 text-gray-500" />;
};

const getActionColor = (action: string) => {
  if (action.includes("delete") || action.includes("reject")) {
    return "bg-red-100 text-red-800";
  }
  if (action.includes("create") || action.includes("submit")) {
    return "bg-green-100 text-green-800";
  }
  if (action.includes("update") || action.includes("edit")) {
    return "bg-yellow-100 text-yellow-800";
  }
  if (action.includes("login") || action.includes("auth")) {
    return "bg-blue-100 text-blue-800";
  }
  return "bg-gray-100 text-gray-800";
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-red-100 text-red-800";
    case "ADMIN":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatUserAgent = (userAgent: string | null) => {
  if (!userAgent) return "Unknown";
  
  // Extract browser and OS info
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
  const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);
  
  const browser = browserMatch ? browserMatch[1] : "Unknown";
  const os = osMatch ? osMatch[1] : "Unknown";
  
  return `${browser} on ${os}`;
};

export function AuditLogsTable({ auditLogs, loading, onSelectLog }: AuditLogsTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No logs match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Application
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {auditLogs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getActionIcon(log.action)}
                  <div className="ml-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {log.user ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {log.user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(log.user.role)}`}>
                          {log.user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">System</span>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {log.application ? (
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {log.application.familyName}, {log.application.givenName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.application.email}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </td>
              
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {log.ipAddress && (
                      <div className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        <span className="truncate">{log.ipAddress}</span>
                      </div>
                    )}
                  </div>
                  {log.userAgent && (
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <Monitor className="h-3 w-3 mr-1" />
                      <span className="truncate">{formatUserAgent(log.userAgent)}</span>
                    </div>
                  )}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <div>
                    <div className="text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onSelectLog(log)}
                  className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}