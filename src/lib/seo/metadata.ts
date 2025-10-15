import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  canonical,
  noIndex = false,
  ogImage = '/og-image.jpg'
}: SEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com';
  
  return {
    title,
    description,
    keywords: [
      'DV lottery',
      'Diversity Visa',
      'DV lottery Ethiopia',
      'DV lottery assistance',
      'US visa lottery',
      'Green card lottery',
      ...keywords
    ],
    alternates: {
      canonical: canonical ? `${baseUrl}${canonical}` : undefined,
    },
    openGraph: {
      title: title || 'DVSubmit - Professional DV Lottery Assistance Service',
      description: description || 'Get expert help with your Diversity Visa lottery application.',
      url: canonical ? `${baseUrl}${canonical}` : baseUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || 'DVSubmit - DV Lottery Assistance Service',
        },
      ],
    },
    twitter: {
      title: title || 'DVSubmit - Professional DV Lottery Assistance Service',
      description: description || 'Get expert help with your Diversity Visa lottery application.',
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

export const defaultKeywords = [
  'DV lottery',
  'Diversity Visa',
  'DV lottery Ethiopia',
  'DV lottery assistance',
  'DV lottery application',
  'US visa lottery',
  'Green card lottery',
  'DV lottery form',
  'DV lottery photo',
  'DV lottery submission',
  'visa lottery help',
  'DV lottery service',
  'Ethiopia DV lottery',
  'professional DV assistance'
];