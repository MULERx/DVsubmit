import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@/components/seo/analytics";
import { SEOAudit } from "@/components/seo/seo-audit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DVSubmit - Professional DV Lottery Assistance Service",
    template: "%s | DVSubmit",
  },
  description:
    "Get expert help with your Diversity Visa lottery application. Professional DV lottery assistance service for Ethiopia with secure submission, photo validation, and form completion support.",
  keywords: [
    "DV lottery",
    "Diversity Visa",
    "DV lottery Ethiopia",
    "DV lottery assistance",
    "DV lottery application",
    "US visa lottery",
    "Green card lottery",
    "DV lottery form",
    "DV lottery photo",
    "DV lottery submission",
  ],
  authors: [{ name: "DVSubmit Team" }],
  creator: "DVSubmit",
  publisher: "DVSubmit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://dvsubmit.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "DVSubmit - Professional DV Lottery Assistance Service",
    description:
      "Get expert help with your Diversity Visa lottery application. Professional assistance with secure submission, photo validation, and form completion.",
    siteName: "DVSubmit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DVSubmit - DV Lottery Assistance Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DVSubmit - Professional DV Lottery Assistance Service",
    description:
      "Get expert help with your Diversity Visa lottery application. Professional assistance with secure submission and form completion.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // verification: {
  //   google: process.env.GOOGLE_SITE_VERIFICATION,
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
        <Analytics googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID} />
        <SEOAudit />
      </body>
    </html>
  );
}
