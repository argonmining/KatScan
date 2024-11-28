import React, {FC, lazy, Suspense, useRef} from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './styles/App.css'
import './styles/globals.css'
import './styles/darkMode.css'
import {LoadingSpinner, useDarkMode, useMobile, usePageResize} from 'nacho-component-library'

/**
 * Lazy loading the pages to improve initial loading time in prod
 */
const Home = lazy(() => import('./pages/Home'))
const TokenOverview = lazy(() => import('./pages/TokenOverview'))
const TokenDetail = lazy(() => import('./pages/TokenDetail'))
const TokenComparison = lazy(() => import('./pages/TokenComparison'))
const WalletLookup = lazy(() => import('./pages/WalletLookup'))
const TransactionLookup = lazy(() => import('./pages/TransactionLookup'))
const MintHeatmap = lazy(() => import('./pages/MintHeatmap'))
const MarketCapCalculator = lazy(() =>import('./pages/MarketCapCalculator'))
const TopKRC20Holders = lazy(() => import('./pages/TopKRC20Holders'))
const StructuredData = lazy(() => import('./pages/StructuredData'))

const App: FC = () => {
    const elementRef = useRef<HTMLDivElement | null>(null)
    const {isMobile} = useMobile()
    const {isDarkMode, toggleDarkMode} = useDarkMode()
    const styling = usePageResize(elementRef, 'mainContent')

    return (
        <Router>
            <div className="App">
                <div id={'portal-container'}/>
                <Sidebar ref={elementRef}
                    darkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    isMobile={isMobile}
                />
                <div className="main-content" style={styling}>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/tokens" element={<TokenOverview/>}/>
                            <Route
                                path="/tokens/:tokenId"
                                element={<TokenDetail/>}
                            />
                            <Route
                                path="/compare"
                                element={<TokenComparison/>}
                            />
                            <Route path="/wallet" element={<WalletLookup/>}/>
                            <Route
                                path="/wallet/:walletAddress"
                                element={<WalletLookup/>}
                            />
                            <Route
                                path="/transaction-lookup/:hashRev?"
                                element={<TransactionLookup/>}
                            />
                            <Route
                                path="/mint-heatmap"
                                element={<MintHeatmap/>}
                            />
                            <Route
                                path="/marketcap-calc"
                                element={<MarketCapCalculator/>}
                            />
                            <Route
                                path="/top-holders"
                                element={<TopKRC20Holders/>}
                            />
                            <Route
                                path="*"
                                element={<div>Page not found</div>}
                            />
                        </Routes>
                    </Suspense>
                </div>
                <StructuredData/>
            </div>
        </Router>
    )
}

export default App
