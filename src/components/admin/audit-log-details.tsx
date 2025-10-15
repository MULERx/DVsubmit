"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  User,
  FileText,
  Clock,
  Globe,
  Monitor,
  Shield,
  Activity,
  Copy,
  ExternalLink,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

interface AuditLogDetailsProps {
  auditLog: AuditLog;
  onClose: () => void;
}

const formatUserAgent = (userAgent: string | null) => {
  if (!userAgent) return { browser: "Unknown", os: "Unknown", full: "Unknown" };

  // Extract browser info
  const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
  const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
  const safariMatch = userAgent.match(/Safari\/([\d.]+)/);
  const edgeMatch = userAgent.match(/Edge\/([\d.]+)/);

  let browser = "Unknown";
  if (chromeMatch) browser = `Chrome ${chromeMatch[1]}`;
  else if (firefoxMatch) browser = `Firefox ${firefoxMatch[1]}`;
  else if (safariMatch) browser = `Safari ${safariMatch[1]}`;
  else if (edgeMatch) browser = `Edge ${edgeMatch[1]}`;

  // Extract OS info
  let os = "Unknown";
  if (userAgent.includes("Windows NT 10.0")) os = "Windows 10";
  else if (userAgent.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (userAgent.includes("Windows NT 6.1")) os = "Windows 7";
  else if (userAgent.includes("Mac OS X")) {
    const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
    os = macMatch ? `macOS ${macMatch[1].replace(/_/g, ".")}` : "macOS";
  } else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) {
    const androidMatch = userAgent.match(/Android ([\d.]+)/);
    os = androidMatch ? `Android ${androidMatch[1]}` : "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    const iosMatch = userAgent.match(/OS ([\d_]+)/);
    os = iosMatch ? `iOS ${iosMatch[1].replace(/_/g, ".")}` : "iOS";
  }

  return { browser, os, full: userAgent };
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
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

export function AuditLogDetails({ auditLog, onClose }: AuditLogDetailsProps) {
  const userAgentInfo = formatUserAgent(auditLog.userAgent);

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              Audit Log Details
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <X className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Basic Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Log ID:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono text-gray-900">
                          {auditLog.id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(auditLog.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Action:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                          auditLog.action
                        )}`}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        {auditLog.action}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Timestamp:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(auditLog.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(auditLog.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    User Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {auditLog.user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {auditLog.user.email}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(
                                  auditLog.user.role
                                )}`}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {auditLog.user.role}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(auditLog.user!.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-2">
                        System Action (No user associated)
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Information */}
                {auditLog.application && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Application Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {auditLog.application.familyName},{" "}
                            {auditLog.application.givenName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {auditLog.application.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            Status: {auditLog.application.status}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(auditLog.application!.id)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Information */}
              <div className="space-y-4">
                {/* Network Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Network Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">IP Address:</span>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <code className="text-sm font-mono text-gray-900">
                          {auditLog.ipAddress || "Unknown"}
                        </code>
                        {auditLog.ipAddress && (
                          <button
                            onClick={() => copyToClipboard(auditLog.ipAddress!)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Browser Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Browser Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Browser:</span>
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {userAgentInfo.browser}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Operating System:
                      </span>
                      <span className="text-sm text-gray-900">
                        {userAgentInfo.os}
                      </span>
                    </div>

                    {auditLog.userAgent && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">
                            Full User Agent:
                          </span>
                          <button
                            onClick={() => copyToClipboard(auditLog.userAgent!)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border">
                          {auditLog.userAgent}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Action Details
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Details:</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(auditLog.details, null, 2)
                          )
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto max-h-40">
                      {JSON.stringify(auditLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Created {new Date(auditLog.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {auditLog.application && (
                <a
                  href={`/admin/applications/${auditLog.application.id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Application
                </a>
              )}
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
