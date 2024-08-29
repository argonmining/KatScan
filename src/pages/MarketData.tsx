import React from 'react'
import { Card, Text, Metric, Grid } from '@tremor/react'

const MarketData: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Market Data</h1>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        <Card>
          <Text>Total Market Cap</Text>
          <Metric>Loading...</Metric>
        </Card>
        {/* Add more cards or charts for market data */}
      </Grid>
    </div>
  )
}

export default MarketData
