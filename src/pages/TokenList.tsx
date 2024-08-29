import React from 'react'
import { Card, Text, Metric, Grid } from '@tremor/react'

const TokenList: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">KRC20 Token List</h1>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        <Card>
          <Text>Total Tokens Listed</Text>
          <Metric>Loading...</Metric>
        </Card>
        {/* Add more cards or a table for token list */}
      </Grid>
    </div>
  )
}

export default TokenList
