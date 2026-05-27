import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  const hasImage = typeof src === 'string' && src.trim().length > 0;

  if (!hasImage || didError) {
    return (
      <div
        className={`flex items-center justify-center bg-purple-50 text-purple-500 ${className ?? ''}`}
        style={style}
        role="img"
        aria-label={alt ? `${alt}: imagen no disponible` : 'Imagen no disponible'}
        data-original-url={src || ''}
      >
        <ImageOff className="h-1/2 w-1/2 max-h-8 max-w-8" aria-hidden="true" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setDidError(true)} />;
}
