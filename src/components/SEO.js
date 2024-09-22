import React from 'react';
import {Helmet} from 'react-helmet-async';

const SEO = ({title, description, keywords, canonicalUrl}) => {
    const fullTitle = `${title} | KatScan - KRC-20 Explorer for Kaspa`;
    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description}/>
            <meta name="keywords" content={keywords}/>
            {canonicalUrl && <link rel="canonical" href={canonicalUrl}/>}
        </Helmet>
    );
};

export default SEO;
