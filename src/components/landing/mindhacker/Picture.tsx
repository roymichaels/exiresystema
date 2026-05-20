/**
 * Picture — lightweight <picture> wrapper.
 * Accepts AVIF + WebP sources (built-in modern fallback chain) plus a final <img>.
 * Always sets decoding=async and width/height to avoid CLS.
 */
import { CSSProperties } from 'react';

interface Props {
  avif: string;
  webp: string;
  fallback: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  eager?: boolean;
  sizes?: string;
  lqip?: string;
  /** mark as the LCP image */
  priority?: boolean;
}

export default function Picture({
  avif, webp, fallback, alt, className, imgClassName, style,
  width, height, eager, sizes, lqip, priority,
}: Props) {
  return (
    <picture className={className} style={style}>
      <source srcSet={avif} type="image/avif" sizes={sizes} />
      <source srcSet={webp} type="image/webp" sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        loading={eager || priority ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-expect-error - fetchpriority is valid HTML but not in older React types
        fetchpriority={priority ? 'high' : undefined}
        className={imgClassName}
        style={
          lqip
            ? {
                backgroundImage: `url(${lqip})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />
    </picture>
  );
}
