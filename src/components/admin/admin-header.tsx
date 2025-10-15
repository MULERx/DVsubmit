"use client";

import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import Image from "next/image";
import { Home, LogOut } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function AdminHeader({
  title = "Admin Panel",
  breadcrumbs = [],
}: AdminHeaderProps) {
  const { userWithRole, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect will be handled by the auth context
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity mr-6"
            >
              <Image
                src="https://rqneahjmfgavjopmosda.supabase.co/storage/v1/object/public/dv-photos/dvsubmit-logo.webp"
                alt="DVSubmit Logo"
                width={48}
                height={48}
                priority
                className="sm:h-12 h-10 w-10 sm:w-12"
              />
              <span className="text-lg font-semibold text-gray-900">
                DVSubmit
              </span>
            </Link>

            {/* Breadcrumbs or Title */}
            {breadcrumbs.length > 0 ? (
              <div className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {crumb.label}
                      </span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="text-gray-400">/</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {userWithRole?.role}
              </span>
            </span>
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            <button
              onClick={handleSignOut}
              className="text-sm cursor-pointer text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
