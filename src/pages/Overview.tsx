import React from 'react'
import { Card, Text, Metric, Grid, AreaChart, Title, Tab, TabList, TabGroup } from '@tremor/react'

const chartdata = [
  {
    date: '2023-01-01',
    'Total Tokens': 100,
    'Active Tokens': 80,
  },
  {
    date: '2023-02-01',
    'Total Tokens': 120,
    'Active Tokens': 90,
  },
  // Add more data points as needed
]

const Overview: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">KRC20 Token Explorer Overview</h1>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mb-6">
        <Card>
          <Text>Total KRC20 Tokens</Text>
          <Metric>120</Metric>
        </Card>
        <Card>
          <Text>Total Unique Holders</Text>
          <Metric>5,234</Metric>
        </Card>
        <Card>
          <Text>24h Transaction Volume</Text>
          <Metric>1,234,567 KAS</Metric>
        </Card>
      </Grid>
      
      <Card className="mb-6">
        <Title>Token Growth Over Time</Title>
        <TabGroup>
          <TabList className="mt-4">
            <Tab>6 Months</Tab>
            <Tab>1 Year</Tab>
            <Tab>All Time</Tab>
          </TabList>
        </TabGroup>
        <AreaChart
          className="mt-4 h-72"
          data={chartdata}
          index="date"
          categories={['Total Tokens', 'Active Tokens']}
          colors={['indigo', 'cyan']}
        />
      </Card>
      
      <Grid numItems={1} numItemsSm={2} className="gap-4">
        <Card>
          <Title>Top Tokens by Market Cap</Title>
          {/* Add a list or table component here */}
        </Card>
        <Card>
          <Title>Recent Transactions</Title>
          {/* Add a list component here */}
        </Card>
      </Grid>
    </div>
  )
}

export default Overview
