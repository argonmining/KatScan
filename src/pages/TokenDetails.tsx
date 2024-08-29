import React from 'react'
import { Card, Text, Metric, Grid } from '@tremor/react'
import { useParams } from 'react-router-dom'

const TokenDetails: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Token Details: {tokenId}</h1>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        <Card>
          <Text>Token Name</Text>
          <Metric>Loading...</Metric>
        </Card>
        <Card>
          <Text>Total Supply</Text>
          <Metric>Loading...</Metric>
        </Card>
        <Card>
          <Text>Holders</Text>
          <Metric>Loading...</Metric>
        </Card>
      </Grid>
    </div>
  )
}

export default TokenDetails
