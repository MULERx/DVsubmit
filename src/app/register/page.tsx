"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import {
  useRegisterMutation,
  useGoogleSignInMutation,
  useResendConfirmationMutation,
} from "@/hooks/use-auth-mutations";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegisterMutation();
  const googleSignInMutation = useGoogleSignInMutation();
  const resendConfirmationMutation = useResendConfirmationMutation();

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setSuccess(true);
        setRegisteredEmail(data.email);
      },
    });
  };

  const handleGoogleSignIn = () => {
    googleSignInMutation.mutate();
  };

  const handleResendConfirmation = () => {
    if (registeredEmail) {
      resendConfirmationMutation.mutate(registeredEmail);
    }
  };

  const isLoading =
    registerMutation.isPending || googleSignInMutation.isPending;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="text-xl font-bold text-gray-900">DVSubmit</span>
            </Link>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Check your email
              </h1>
              <p className="text-gray-600 mb-2 text-sm">
                We've sent you a confirmation link at
              </p>
              <p className="font-semibold text-gray-900 mb-6">
                {registeredEmail}
              </p>
              <div className="text-gray-600 mb-8 space-y-2">
                <p>
                  Please check your email and click the confirmation link to
                  activate your account.
                </p>
                <p className="text-sm text-gray-500">
                  Don't see the email? Check your spam folder or try resending.
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl  transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] inline-block text-center"
                >
                  Back to Sign In
                </Link>
                {/* <button
                  onClick={handleResendConfirmation}
                  disabled={resendConfirmationMutation.isPending}
                  className="w-full cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendConfirmationMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      Sending...
                    </div>
                  ) : (
                    'Resend confirmation email'
                  )}
                </button> */}
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
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Home</span>
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
                Create your account
              </h1>
              <p className="text-gray-600 text-sm">
                Join DVSubmit to get started
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {registerMutation.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="text-sm text-red-700">
                    {registerMutation.error.message}
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
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Password (min. 6 characters)"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>

              <div className="text-xs text-gray-500 space-y-3">
                <p className="text-center">
                  By creating an account, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-medium text-amber-800 mb-2">
                    Important Notice:
                  </p>
                  <ul className="space-y-1 text-amber-700">
                    <li>• This is not a government service</li>
                    <li>• Selection in the DV lottery is not guaranteed</li>
                    <li>
                      • Service fee is 399 ETB, non-refundable after submission
                    </li>
                  </ul>
                </div>
              </div>
            </form>

            <div className="mt-3 sm:mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
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
