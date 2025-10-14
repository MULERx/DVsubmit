"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Image from "next/image";

export function TermsOfService() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image
            src="https://ntzsbuboifpexxmkaifi.supabase.co/storage/v1/object/public/dv/dvsubmit-logo.webp"
            alt="DVSubmit Logo"
            width={48}
            height={48}
            className="sm:h-12 h-10 w-10 sm:w-12"
          />
          Terms of Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            1. Service Agreement
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              By using DVSubmit, you agree to these Terms of Service. DVSubmit
              is a private service that assists with DV (Diversity Visa) lottery
              applications. We are not affiliated with any government agency.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            2. Service Description
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>Our services include:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Assistance with completing DV lottery application forms</li>
              <li>Photo validation and compliance checking</li>
              <li>Secure data handling and storage</li>
              <li>
                Submission of completed applications to the official DV lottery
                system
              </li>
              <li>Confirmation number tracking and proof of submission</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            3. Fees and Payment
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              The service fee is 399 Ethiopian Birr (ETB), payable via Telebirr
              before application submission. This fee covers our assistance
              services only.
            </p>
            <p>
              <strong>Refund Policy:</strong> Service fees are non-refundable
              once your application has been submitted to the official DV
              lottery system.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            4. User Responsibilities
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>You are responsible for:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Providing accurate and truthful information</li>
              <li>Meeting all DV lottery eligibility requirements</li>
              <li>Uploading compliant photos that meet DV requirements</li>
              <li>Keeping your account credentials secure</li>
              <li>Checking your email for important updates</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            5. Data Privacy and Security
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              We collect and process your personal information solely for DV
              lottery application purposes. Your data is protected with
              industry-standard security measures and Row Level Security
              policies.
            </p>
            <p>
              <strong>Data Retention:</strong> Personal data will be
              automatically deleted according to our retention policies after
              the DV lottery cycle ends, unless legal holds require
              preservation.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            6. Government Non-Affiliation
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>IMPORTANT:</strong> DVSubmit is NOT affiliated with,
              endorsed by, or connected to the U.S. Department of State, U.S.
              Government, or any government agency. We are a private company
              providing assistance services.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            7. No Guarantee of Selection
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              We do NOT guarantee selection in the DV lottery. Selection is
              determined by the U.S. Department of State through a random
              selection process. We cannot influence or predict lottery
              outcomes.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            8. Limitation of Liability
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              Our liability is limited to the service fee paid. We are not
              responsible for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>DV lottery selection outcomes</li>
              <li>Application processing delays by government agencies</li>
              <li>Technical issues beyond our control</li>
              <li>Consequences of inaccurate information provided by users</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            9. Service Availability
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              Our service is available during official DV lottery registration
              periods. We reserve the right to suspend service for maintenance
              or technical issues.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            10. Changes to Terms
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              We may update these terms periodically. Users will be notified of
              significant changes and may be required to re-acknowledge updated
              terms.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3">
            11. Contact Information
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              For questions about these terms or our services, please contact
              our support team through the help section of our website.
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
  );
}
