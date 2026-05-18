import React from 'react';

export function BrandLogo({ className = 'w-8 h-8', withSurface = false }) {
  const logo = (
    <img
      src="/logo-talentbridge.png"
      alt="TalentBridge"
      className={`${className} object-contain`}
      loading="eager"
    />
  );

  if (withSurface) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center shadow-sm"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        {logo}
      </span>
    );
  }

  return (
    logo
  );
}
