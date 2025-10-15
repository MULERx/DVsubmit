import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mt-2">
            How we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Privacy Policy Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                1. Information We Collect
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  We collect information necessary for DV lottery application
                  processing:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    Personal information (name, date of birth, country of birth)
                  </li>
                  <li>Contact information (email, phone, address)</li>
                  <li>Education and occupation details</li>
                  <li>Passport-style photographs</li>
                  <li>Payment information (Telebirr transaction references)</li>
                  <li>Account information (email, password hash)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                2. How We Use Your Information
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>Your information is used solely for:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Processing your DV lottery application</li>
                  <li>Verifying payment transactions</li>
                  <li>Communicating about your application status</li>
                  <li>Providing customer support</li>
                  <li>Complying with legal requirements</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                3. Data Security
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>We protect your information through:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Row Level Security (RLS) policies in our database</li>
                  <li>Secure file storage with private access controls</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Limited access to authorized personnel only</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                4. Data Sharing
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>We share your information only:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    With the U.S. Department of State for DV lottery submission
                  </li>
                  <li>When required by law or legal process</li>
                  <li>
                    With service providers under strict confidentiality
                    agreements
                  </li>
                </ul>
                <p className="font-medium">
                  We never sell or rent your personal information to third
                  parties.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                5. Data Retention
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  Your personal information is automatically deleted according
                  to our retention policies after the DV lottery cycle ends,
                  typically within 12 months of application submission.
                </p>
                <p>
                  Audit logs and transaction records may be retained longer for
                  legal compliance but will not contain personally identifiable
                  information.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                6. Your Rights
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>
                    Request deletion of your data (subject to legal
                    requirements)
                  </li>
                  <li>Withdraw consent where applicable</li>
                  <li>File complaints with data protection authorities</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                7. Cookies and Tracking
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  We use essential cookies for authentication and session
                  management. We do not use tracking cookies or analytics that
                  identify individual users.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                8. International Transfers
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  Your information may be transferred to and processed in
                  countries outside Ethiopia, including the United States for DV
                  lottery submission. We ensure appropriate safeguards are in
                  place for such transfers.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                9. Children&apos;s Privacy
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  Our service is not intended for individuals under 18 years of
                  age. We do not knowingly collect personal information from
                  children.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                10. Changes to This Policy
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  We may update this privacy policy periodically. Users will be
                  notified of significant changes and may be required to
                  re-acknowledge updated policies.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-3">
                11. Contact Us
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  For questions about this privacy policy or your personal
                  information, please contact our support team through the help
                  section of our website.
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Last Updated:</strong>{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-8 mt-8">
          <p>
            For additional information, please review our{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
