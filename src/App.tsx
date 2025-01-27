import React, {FC, lazy, Suspense, useRef} from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './styles/App.css'
import './styles/globals.css'
import './styles/darkMode.css'
import {LoadingSpinner, ThemeToggle, usePageResize} from 'nacho-component-library'
import {Alerts} from "./components/alerts/Alerts";
import {Announcements} from "./components/announcements/Announcements";

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
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'))
const WhitelistPage = lazy(() => import('./pages/WhitelistPage'))

const App: FC = () => {
    const elementRef = useRef<HTMLDivElement | null>(null)
    const styling = usePageResize(elementRef, 'mainContent')

    return (
        <Router>
            <div className="App">
                <div id={'portal-container'}/>
                <ThemeToggle />
                <Alerts/>
                <Announcements/>
                <Sidebar ref={elementRef} />
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
                                path="/announcements"
                                element={<AnnouncementsPage/>}
                            />
                            <Route
                                path="/whitelist"
                                element={<WhitelistPage/>}
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
