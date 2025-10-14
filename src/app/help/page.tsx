"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  HelpCircle,
  FileText,
  CreditCard,
  Camera,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-2">
            Get help with your DV lottery application process
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {/* Getting Started */}
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
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  How do I start my DV application?
                </h4>
                <p className="text-gray-600 text-sm">
                  After registering and verifying your email, click "Start New
                  Application" from your dashboard. You'll be guided through a
                  multi-step form to complete your DV lottery application.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  What information do I need?
                </h4>
                <p className="text-gray-600 text-sm">
                  You'll need your personal information, contact details,
                  education level, occupation, a compliant DV photo, and payment
                  method (Telebirr) for the 399 ETB service fee.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Photo Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  What are the photo requirements?
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Your photo must meet these DV lottery requirements:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• Recent photo taken within the last 6 months</li>
                  <li>• Color photo with white or off-white background</li>
                  <li>• Head should be between 50-69% of image height</li>
                  <li>• Face directly toward camera with neutral expression</li>
                  <li>
                    • No glasses, hats, or head coverings (except religious)
                  </li>
                  <li>• JPEG format, minimum 600x600 pixels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  What if my photo is rejected?
                </h4>
                <p className="text-gray-600 text-sm">
                  Our system will provide specific feedback on what needs to be
                  corrected. You can upload a new photo that meets the
                  requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment & Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  How much does the service cost?
                </h4>
                <p className="text-gray-600 text-sm">
                  Our service fee is 399 ETB, payable via Telebirr. This covers
                  application assistance, photo validation, and official
                  submission to the DV lottery system.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  How do I pay with Telebirr?
                </h4>
                <p className="text-gray-600 text-sm">
                  After completing your application, you'll receive Telebirr
                  payment instructions. Make the payment and enter your
                  transaction reference number for verification.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  When will my payment be verified?
                </h4>
                <p className="text-gray-600 text-sm">
                  Our admin team typically verifies Telebirr payments within 24
                  hours. You'll receive an email notification once verified.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  How can I track my application?
                </h4>
                <p className="text-gray-600 text-sm">
                  Your dashboard shows real-time status updates. You'll see
                  progress through each stage: Draft → Payment Pending → Payment
                  Verified → Submitted → Confirmed.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  When will I get my confirmation number?
                </h4>
                <p className="text-gray-600 text-sm">
                  After payment verification, our team submits your application
                  to the official DV system. You'll receive your confirmation
                  number within 2-3 business days.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Can I download proof of submission?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes! Once you receive your confirmation number, you can
                  download an official proof of submission document from your
                  dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important Notices */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">
                  This is not a government service
                </h4>
                <p className="text-yellow-700 text-sm">
                  DVSubmit is a private service that assists with DV lottery
                  applications. We are not affiliated with the U.S. government
                  or Department of State.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">
                  Selection is not guaranteed
                </h4>
                <p className="text-yellow-700 text-sm">
                  Our service helps you submit a compliant application, but
                  selection in the DV lottery is random and not guaranteed.
                  Results are determined by the U.S. Department of State.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">
                  Check official results
                </h4>
                <p className="text-yellow-700 text-sm">
                  When results are announced, check your status on the official
                  U.S. Department of State DV lottery website using your
                  confirmation number.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                If you can't find the answer to your question, our support team
                is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> support@dvsubmit.com
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Response Time:</strong> Within 24 hours
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Available:</strong> Monday - Friday, 9 AM - 6 PM
                  (Ethiopian Time)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
