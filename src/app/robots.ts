import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/profile/',
          '/dv-form/',
          '/test-*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}