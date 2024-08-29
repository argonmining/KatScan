import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Overview from './pages/Overview'
import TokenList from './pages/TokenList'
import TokenDetails from './pages/TokenDetails'
import HolderAnalytics from './pages/HolderAnalytics'
import TransactionAnalytics from './pages/TransactionAnalytics'
import CrossTokenAnalysis from './pages/CrossTokenAnalysis'
import HistoricalData from './pages/HistoricalData'
import MarketData from './pages/MarketData'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/tokens" element={<TokenList />} />
          <Route path="/token/:tokenId" element={<TokenDetails />} />
          <Route path="/holder-analytics" element={<HolderAnalytics />} />
          <Route path="/transaction-analytics" element={<TransactionAnalytics />} />
          <Route path="/cross-token-analysis" element={<CrossTokenAnalysis />} />
          <Route path="/historical-data" element={<HistoricalData />} />
          <Route path="/market-data" element={<MarketData />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
