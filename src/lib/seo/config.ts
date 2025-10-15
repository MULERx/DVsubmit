export const seoConfig = {
  title: 'DVSubmit - Professional DV Lottery Assistance Service',
  description: 'Get expert help with your Diversity Visa lottery application. Professional DV lottery assistance service for Ethiopia with secure submission, photo validation, and form completion support.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com',
  siteName: 'DVSubmit',
  locale: 'en_US',
  type: 'website',
  
  // Social media handles (add when available)
  social: {
    twitter: '@dvsubmit',
    facebook: 'dvsubmit',
    instagram: 'dvsubmit',
  },
  
  // Default images
  images: {
    default: '/og-image.jpg',
    logo: '/logo.png',
    favicon: '/favicon.ico',
  },
  
  // Business information
  business: {
    name: 'DVSubmit',
    description: 'Professional DV Lottery assistance service',
    address: {
      country: 'Ethiopia',
      region: 'Addis Ababa',
    },
    contact: {
      email: 'support@dvsubmit.com',
      phone: '+251-XXX-XXXX', // Add actual phone when available
    },
  },
  
  // Service information
  service: {
    name: 'DV Lottery Assistance Service',
    price: '399',
    currency: 'ETB',
    description: 'Complete DV lottery application assistance including form completion, photo validation, and secure submission',
  },
};

export const jsonLdData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.business.name,
    description: seoConfig.business.description,
    url: seoConfig.url,
    logo: `${seoConfig.url}${seoConfig.images.logo}`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: seoConfig.business.contact.email,
      availableLanguage: ['English', 'Amharic'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: seoConfig.business.address.country,
      addressRegion: seoConfig.business.address.region,
    },
  },
  
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    description: seoConfig.description,
    url: seoConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  
  service: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: seoConfig.service.name,
    description: seoConfig.service.description,
    provider: {
      '@type': 'Organization',
      name: seoConfig.business.name,
    },
    serviceType: 'Immigration Assistance',
    areaServed: {
      '@type': 'Country',
      name: 'Ethiopia',
    },
    offers: {
      '@type': 'Offer',
      price: seoConfig.service.price,
      priceCurrency: seoConfig.service.currency,
      description: seoConfig.service.description,
    },
  },
};