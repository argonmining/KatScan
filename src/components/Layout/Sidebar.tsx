import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <Link to="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
        Overview
      </Link>
      <Link
        to="/tokens"
        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
      >
        Token List
      </Link>
      <Link
        to="/holder-analytics"
        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
      >
        Holder Analytics
      </Link>
      <Link
        to="/transaction-analytics"
        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
      >
        Transaction Analytics
      </Link>
      <Link
        to="/cross-token-analysis"
        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
      >
        Cross-Token Analysis
      </Link>
      <Link
        to="/historical-data"
        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
      >
        Historical Data
      </Link>
      <Link
        to="/market-data"
        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
      >
        Market Data
      </Link>
    </nav>
  )
}

export default Sidebar
