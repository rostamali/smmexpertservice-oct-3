import Image from 'next/image';
import type { CSSProperties } from 'react';

type Props = {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    sizes?: string;
    width?: number;
    height?: number;
    style?: CSSProperties;
};

export default function StoreImage({
    src,
    alt,
    className,
    priority = false,
    sizes = '100vw',
    width = 1200,
    height = 900,
    style,
}: Props) {
    const imageStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
    };
    if (/^https?:\/\//i.test(src) || src.startsWith('/uploads/')) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                style={imageStyle}
            />
        );
    }
    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            priority={priority}
            sizes={sizes}
            width={width}
            height={height}
            style={imageStyle}
        />
    );
}
