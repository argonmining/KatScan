import React, {FC} from 'react';
import { Helmet } from 'react-helmet-async';

export type Props = {
    data: Record<string, string>
}

const JsonLd:FC<Props> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  </Helmet>
);

export default JsonLd;
