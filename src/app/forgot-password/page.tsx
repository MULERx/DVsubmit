"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, ArrowLeft, Mail } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { useForgotPasswordMutation } from "@/hooks/use-auth-mutations";
import { PasswordResetInfo } from "@/components/auth/password-reset-info";

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useForgotPasswordMutation();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: (result) => {
        setSuccess(true);
        setSentEmail(result.email);
      },
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="https://ntzsbuboifpexxmkaifi.supabase.co/storage/v1/object/public/dv/dvsubmit-logo.webp"
                  alt="DVSubmit Logo"
                  width={48}
                  height={48}
                  className="sm:h-12 h-10 w-10 sm:w-12"
                />
                <span className="text-xl font-bold text-gray-900">
                  DVSubmit
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Check your email
              </h1>
              <p className="text-gray-600 mb-2 text-sm">
                We've sent a password reset link to
              </p>
              <p className="font-semibold text-gray-900 mb-6">{sentEmail}</p>
              <div className="text-gray-600 mb-8 space-y-2">
                <p>
                  Please check your email and click the link to reset your
                  password. The link will expire in 1 hour.
                </p>
                <p className="text-sm text-gray-500">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-block"
                >
                  Back to Sign In
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setSentEmail("");
                  }}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
                >
                  Send another email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="https://ntzsbuboifpexxmkaifi.supabase.co/storage/v1/object/public/dv/dvsubmit-logo.webp"
                alt="DVSubmit Logo"
                width={48}
                height={48}
                className="h-5 w-5"
              />
              <span className="text-xl font-bold text-gray-900">DVSubmit</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Forgot your password?
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            <PasswordResetInfo />

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {forgotPasswordMutation.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="text-sm text-red-700">
                    {forgotPasswordMutation.error.message}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email-address"
                    type="email"
                    autoComplete="email"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {forgotPasswordMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending reset link...
                  </div>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
