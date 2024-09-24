import React, {FC} from 'react';

const StructuredData:FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KatScan",
    "description": "KRC-20 Explorer & Insights Platform for Kaspa Ecosystem",
    "url": "https://katscan.xyz",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0"
    },
    "author": {
      "@type": "Organization",
      "name": "Nacho the Kat Community"
    },
    "keywords": "KRC-20, KRC20, KatScan, Kaspa, blockdag, kaspa explorer, krc20 explorer, kasplex explorer, kaspa blockchain, krc20 blockchain, kaspa tokens, krc20 tokens, kaspa transactions, krc20 transactions, kaspa statistics, krc20 statistics, kaspa network, krc20 network, kaspa development, krc20 development, kaspa statistics, krc20 statistics, kaspa network, krc20 network, kaspa development, krc20 development",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  );
};

export default StructuredData;