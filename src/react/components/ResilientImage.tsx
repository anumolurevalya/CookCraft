import { UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export default function ResilientImage({
  src,
  alt,
  title,
  className = '',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#ebe4d4] via-[#e2d8c3] to-[#d4c8ae] text-[#315c43] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <UtensilsCrossed className="w-8 h-8 mb-2 opacity-75" strokeWidth={1.6} />
        <span className="font-display text-base font-semibold text-[#252b25]">
          {title || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
