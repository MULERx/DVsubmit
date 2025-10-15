import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = genMeta({
  title: 'Help Center - DV Lottery Application Support',
  description: 'Get help with your DV lottery application. Find answers to common questions about photo requirements, payment process, application status, and more.',
  keywords: ['DV lottery help', 'application support', 'photo requirements', 'payment help', 'FAQ'],
  canonical: '/help'
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}