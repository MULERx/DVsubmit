'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SEOCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export function SEOAudit() {
  const [checks, setChecks] = useState<SEOCheck[]>([]);

  useEffect(() => {
    const runAudit = () => {
      const auditChecks: SEOCheck[] = [];

      // Check title
      const title = document.title;
      auditChecks.push({
        name: 'Page Title',
        status: title && title.length > 0 && title.length <= 60 ? 'pass' : 'fail',
        message: title ? `Length: ${title.length}/60 characters` : 'No title found'
      });

      // Check meta description
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
      auditChecks.push({
        name: 'Meta Description',
        status: metaDesc && metaDesc.length > 0 && metaDesc.length <= 160 ? 'pass' : 'fail',
        message: metaDesc ? `Length: ${metaDesc.length}/160 characters` : 'No meta description found'
      });

      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      auditChecks.push({
        name: 'Canonical URL',
        status: canonical ? 'pass' : 'warning',
        message: canonical ? 'Canonical URL present' : 'No canonical URL found'
      });

      // Check Open Graph
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      auditChecks.push({
        name: 'Open Graph',
        status: ogTitle && ogDesc && ogImage ? 'pass' : 'warning',
        message: `Title: ${!!ogTitle}, Description: ${!!ogDesc}, Image: ${!!ogImage}`
      });

      // Check structured data
      const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
      auditChecks.push({
        name: 'Structured Data',
        status: structuredData.length > 0 ? 'pass' : 'warning',
        message: `${structuredData.length} structured data blocks found`
      });

      // Check headings
      const h1s = document.querySelectorAll('h1');
      auditChecks.push({
        name: 'H1 Headings',
        status: h1s.length === 1 ? 'pass' : h1s.length === 0 ? 'fail' : 'warning',
        message: `${h1s.length} H1 heading(s) found (should be exactly 1)`
      });

      // Check images without alt text
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
      auditChecks.push({
        name: 'Image Alt Text',
        status: imagesWithoutAlt.length === 0 ? 'pass' : 'warning',
        message: `${imagesWithoutAlt.length}/${images.length} images missing alt text`
      });

      setChecks(auditChecks);
    };

    // Run audit after a short delay to ensure DOM is ready
    const timer = setTimeout(runAudit, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const passCount = checks.filter(c => c.status === 'pass').length;
  const totalChecks = checks.length;

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          SEO Audit
          <span className="text-xs font-normal">
            {passCount}/{totalChecks} passed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-start gap-2 text-xs">
            {getIcon(check.status)}
            <div className="flex-1">
              <div className="font-medium">{check.name}</div>
              <div className="text-gray-600">{check.message}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}