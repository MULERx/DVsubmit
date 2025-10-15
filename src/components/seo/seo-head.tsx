import Head from 'next/head';
import { seoConfig } from '@/lib/seo/config';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
}

export function SEOHead({
  title,
  description = seoConfig.description,
  canonical,
  noIndex = false,
  ogImage = seoConfig.images.default,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords = [],
}: SEOHeadProps) {
  const pageTitle = title ? `${title} | ${seoConfig.siteName}` : seoConfig.title;
  const pageUrl = canonical ? `${seoConfig.url}${canonical}` : seoConfig.url;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${seoConfig.url}${ogImage}`;
  
  const allKeywords = [
    'DV lottery',
    'Diversity Visa',
    'DV lottery Ethiopia',
    'DV lottery assistance',
    'US visa lottery',
    'Green card lottery',
    ...keywords
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={pageUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title || seoConfig.title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={seoConfig.locale} />
      
      {/* Article specific */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || seoConfig.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {seoConfig.social.twitter && (
        <meta name="twitter:site" content={seoConfig.social.twitter} />
      )}
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="address=no" />
      <meta name="format-detection" content="email=no" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
}