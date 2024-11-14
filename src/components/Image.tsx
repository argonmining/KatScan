import React, {FC, useState} from 'react'
import 'styles/components/Image.css'

type Props = Record<string, unknown> & {
    src: string
    alt: string
}

export const Image: FC<Props> = ({src, alt, ...props}) => {
    const [finished, setFinished] = useState(false)
    const [returnNull, setReturnNull] = useState(false)
    if (!alt) {
        console.warn('Image is missing an alt attribute:', src);
    }

    if (returnNull) {
        return null
    }

    return <img style={{visibility: finished ? 'visible' : 'hidden', ...(props.style ?? {})}}
                src={src}
                alt={alt}
                onError={() => setReturnNull(true)}
                onLoad={() => setFinished(true)}
                {...props} />;
};

export const Thumbnail: FC<Props> = ({src, alt, ...props}) => {
    if (!alt) {
        console.warn('Image is missing an alt attribute:', src);
    }
    return <Image src={src} alt={alt} {...props} className={'thumbnail-image'}/>;
};

export const SmallThumbnail: FC<Props> = ({src, alt, ...props}) => {
    if (!alt) {
        console.warn('Image is missing an alt attribute:', src);
    }
    return <Image src={src} alt={alt} {...props} className={'small-thumbnail-image'}/>;
};