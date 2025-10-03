'use client';

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface CompanyLogoProps {
  logoUrl?: string | null;
  symbol: string;
  companyName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CompanyLogo({ 
  logoUrl, 
  symbol, 
  companyName, 
  size = 'md', 
  className = '' 
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Show fallback if no logo URL, image failed to load, or still loading and failed
  const showFallback = !logoUrl || imageError;

  if (showFallback) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-700 rounded-lg border border-gray-600`}>
        <div className="flex flex-col items-center justify-center text-gray-300">
          <Building2 size={iconSizes[size]} className="text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg border border-gray-600`}>
      <Image
        src={logoUrl}
        alt={`${companyName || symbol} logo`}
        fill
        className="object-contain bg-white p-1"
        onError={() => setImageError(true)}
        onLoad={() => setImageLoading(false)}
        sizes="(max-width: 48px) 48px, 48px"
      />
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 animate-pulse">
          <Building2 size={iconSizes[size]} className="text-gray-400" />
        </div>
      )}
    </div>
  );
}