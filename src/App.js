import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import TokenOverview from './components/TokenOverview';
import TokenDetail from './components/TokenDetail';
import TokenComparison from './components/TokenComparison';
import WalletLookup from './components/WalletLookup';
import TransactionLookup from './components/TransactionLookup';
import MintHeatmap from './components/MintHeatmap';
import MarketCapCalculator from './components/MarketCapCalculator';
import './styles/App.css';
import './styles/globals.css';
import TopKRC20Holders from './components/TopKRC20Holders';
import './styles/darkMode.css';
import { useMediaQuery } from 'react-responsive';
import StructuredData from './components/StructuredData';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 991 });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="App">
        {isMobile ? (
          <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} isMobile={true} />
        ) : (
          <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} isMobile={false} />
        )}
        <div className="main-content">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tokens" element={<TokenOverview />} />
              <Route path="/tokens/:tokenId" element={<TokenDetail />} />
              <Route path="/compare" element={<TokenComparison />} />
              <Route path="/wallet" element={<WalletLookup />} />
              <Route path="/wallet/:walletAddress" element={<WalletLookup />} />
              <Route path="/transaction-lookup/:hashRev?" element={<TransactionLookup />} />
              <Route path="/mint-heatmap" element={<MintHeatmap />} />
              <Route path="/marketcap-calc" element={<MarketCapCalculator />} />
              <Route path="/top-holders" element={<TopKRC20Holders />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </Suspense>
        </div>
        <StructuredData />
      </div>
    </Router>
  );
}

export default App;
