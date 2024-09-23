import React, {Suspense, useState, useEffect, lazy, FC} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import Sidebar from "./components/Sidebar";
import './styles/App.css';
import './styles/globals.css';
import './styles/darkMode.css';
import {LoadingSpinner} from "./components/LoadingSpinner";
import {getLocalStorageItem, setLocalStorageItem} from "./services/LocalStorageHelper";

/**
 * Lazy loading the pages to improve initial loading time
 */
const Home = lazy(() => import('./components/Home'))
const TokenOverview = lazy(() => import('./components/TokenOverview'))
const TokenDetail = lazy(() => import('./components/TokenDetail'))
const TokenComparison = lazy(() => import('./components/TokenComparison'))
const WalletLookup = lazy(() => import('./components/WalletLookup'))
const TransactionLookup = lazy(() => import('./components/TransactionLookup'))
const MintHeatmap = lazy(() => import('./components/MintHeatmap'))
const MarketCapCalculator = lazy(() => import('./components/MarketCapCalculator'))
const TopKRC20Holders = lazy(() => import('./components/TopKRC20Holders'))
const StructuredData = lazy(() => import('./components/StructuredData'))

const App:FC = () => {
    const [darkMode, setDarkMode] = useState<boolean>(getLocalStorageItem('darkMode') ?? false)
    const isMobile = useMediaQuery({maxWidth: 991});

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(current => {
            setLocalStorageItem('darkMode', !current)
            return !current
        });
    };

    return (
        <Router>
            <div className="App">
                {isMobile ? (
                    <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} isMobile={true}/>
                ) : (
                    <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} isMobile={false}/>
                )}
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
    );
}

export default App;
