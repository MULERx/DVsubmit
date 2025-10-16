import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The
            page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-1">
          <Button asChild className="w-full">
            <Link href="/">Go Back Home</Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/help">Get Help</Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need assistance? Visit our{" "}
            <Link href="/help" className="text-indigo-600 hover:underline">
              help center
            </Link>{" "}
            or{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              sign in
            </Link>{" "}
            to access your account.
          </p>
        </div>
      </div>
    </div>
  );
}
