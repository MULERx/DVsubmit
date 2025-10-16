import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  backLink?: {
    href: string;
    label: string;
  };
}

export function AuthHeader({ backLink }: AuthHeaderProps) {
  const defaultBackLink = {
    href: '/',
    label: 'Back to Home'
  };

  const linkToUse = backLink || defaultBackLink;

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="https://rqneahjmfgavjopmosda.supabase.co/storage/v1/object/public/dv-photos/dvsubmit-logo.webp"
              alt="DVSubmit Logo"
              width={48}
              height={48}
              className="sm:h-12 h-10 w-10 sm:w-12"
            />
            <span className="text-xl font-bold text-gray-900">DVSubmit</span>
          </Link>
          <Link
            href={linkToUse.href}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">{linkToUse.label}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}