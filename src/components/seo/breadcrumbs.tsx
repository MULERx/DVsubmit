import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { StructuredData } from './structured-data';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...items
  ];

  // Generate structured data for breadcrumbs
  const breadcrumbStructuredData = {
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dvsubmit.com'}${item.href}` })
    }))
  };

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbStructuredData} />
      <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
            
            {index === 0 && (
              <Home className="h-4 w-4 mr-1" />
            )}
            
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link 
                href={item.href}
                className="hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={index === breadcrumbItems.length - 1 ? 'text-gray-900 font-medium' : ''}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}