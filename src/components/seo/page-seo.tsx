import Head from 'next/head';

interface PageSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  children?: React.ReactNode;
}

export function PageSEO({ 
  title, 
  description, 
  canonical, 
  noIndex = false,
  children 
}: PageSEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : undefined;

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      
      {/* Twitter */}
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      
      {children}
    </Head>
  );
}