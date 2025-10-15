interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Service' | 'FAQPage' | 'BreadcrumbList';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Predefined structured data for common pages
export const organizationStructuredData = {
  name: 'DVSubmit',
  description: 'Professional DV Lottery assistance service providing expert help with Diversity Visa applications',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com',
  logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com'}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Amharic']
  },
  sameAs: [
    // Add social media URLs when available
  ]
};

export const websiteStructuredData = {
  name: 'DVSubmit',
  description: 'Professional DV Lottery assistance service',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com'}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
};

export const serviceStructuredData = {
  name: 'DV Lottery Assistance Service',
  description: 'Professional assistance with Diversity Visa lottery applications including form completion, photo validation, and secure submission',
  provider: {
    '@type': 'Organization',
    name: 'DVSubmit'
  },
  serviceType: 'Immigration Assistance',
  areaServed: {
    '@type': 'Country',
    name: 'Ethiopia'
  },
  offers: {
    '@type': 'Offer',
    price: '399',
    priceCurrency: 'ETB',
    description: 'Complete DV lottery application assistance'
  }
};