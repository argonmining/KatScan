import React from 'react';

const Image = ({ src, alt, ...props }) => {
  if (!alt) {
    console.warn('Image is missing an alt attribute:', src);
  }
  return <img src={src} alt={alt} {...props} />;
};

export default Image;
