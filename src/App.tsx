import React, {FC, lazy, Suspense} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import Sidebar from "./components/Sidebar";
import './styles/App.css';
import './styles/globals.css';
import './styles/darkMode.css';
import {LoadingSpinner} from "./components/LoadingSpinner";
import {useDarkMode} from "./hooks/darkMode";

/**
 * Lazy loading the pages to improve initial loading time in prod
 */
const Home = lazy(() => import('./pages/Home'))
const TokenOverview = lazy(() => import('./pages/TokenOverview'))
const TokenDetail = lazy(() => import('./pages/TokenDetail'))
const TokenComparison = lazy(() => import('./pages/TokenComparison'))
const WalletLookup = lazy(() => import('./pages/WalletLookup'))
const TransactionLookup = lazy(() => import('./pages/UnderMaintenance').then(module => ({default: module.UnderMaintenance})))
const MintHeatmap = lazy(() => import('./pages/MintHeatmap'))
const MarketCapCalculator = lazy(() => import('./pages/UnderMaintenance').then(module => ({default: module.UnderMaintenance})))
const TopKRC20Holders = lazy(() => import('./pages/TopKRC20Holders'))
const StructuredData = lazy(() => import('./pages/StructuredData'))

const App: FC = () => {
    const isMobile = useMediaQuery({maxWidth: 991});
    const {isDarkMode, toggleDarkMode} = useDarkMode()

    return (
        <Router>
            <div className="App">
                <Sidebar darkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isMobile={isMobile}/>
                <div className="main-content">
                    <Suspense fallback={<LoadingSpinner/>}>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/tokens" element={<TokenOverview/>}/>
                            <Route path="/tokens/:tokenId" element={<TokenDetail/>}/>
                            <Route path="/compare" element={<TokenComparison/>}/>
                            <Route path="/wallet" element={<WalletLookup/>}/>
                            <Route path="/wallet/:walletAddress" element={<WalletLookup/>}/>
                            <Route path="/transaction-lookup/:hashRev?" element={<TransactionLookup/>}/>
                            <Route path="/mint-heatmap" element={<MintHeatmap/>}/>
                            <Route path="/marketcap-calc" element={<MarketCapCalculator/>}/>
                            <Route path="/top-holders" element={<TopKRC20Holders/>}/>
                            <Route path="*" element={<div>Page not found</div>}/>
                        </Routes>
                    </Suspense>
                </div>
                <StructuredData/>
            </div>
        </Router>
    )
}

export default App;
