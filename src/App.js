import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import TokenOverview from './components/TokenOverview';
import TokenDetail from './components/TokenDetail';
import TokenComparison from './components/TokenComparison'; // New import
import './styles/App.css';

// Placeholder components for now
const Home = () => <h2>Home Page</h2>;
const Analytics = () => <h2>Analytics Page</h2>;
const About = () => <h2>About Page</h2>;

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tokens" element={<TokenOverview />} />
              <Route path="/tokens/:tokenId" element={<TokenDetail />} />
              <Route path="/compare" element={<TokenComparison />} /> {/* New Route */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;