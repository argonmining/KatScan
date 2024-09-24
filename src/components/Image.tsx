import React, {FC} from 'react';

type Props = Record<string, unknown> & {
    src: string
    alt: string
}

export const Image: FC<Props> = ({src, alt, ...props}) => {
    if (!alt) {
        console.warn('Image is missing an alt attribute:', src);
    }
    return <img src={src} alt={alt} {...props} />;
};
