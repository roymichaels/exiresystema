/**
 * Picture — lightweight <picture> wrapper.
 * AVIF + WebP sources with a final <img> fallback. Always async/lazy unless eager.
 */
import { CSSProperties } from 'react';

interface Props {
  avif: string;
  webp: string;
  fallback: string;
  alt: string;
  /** styles/classes applied to the wrapping <picture> */
  className?: string;
  /** styles/classes applied to the inner <img> */
  imgClassName?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  width: number;
  height: number;
  eager?: boolean;
  sizes?: string;
  lqip?: string;
  /** mark as the LCP image */
  priority?: boolean;
}

export default function Picture({
  avif, webp, fallback, alt, className, imgClassName, style, imgStyle,
  width, height, eager, sizes, lqip, priority,
}: Props) {
  const mergedImgStyle: CSSProperties = {
    ...(lqip
      ? {
          backgroundImage: `url(${lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : null),
    ...imgStyle,
  };
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
        style={Object.keys(mergedImgStyle).length ? mergedImgStyle : undefined}
      />
    </picture>
  );
}
