import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import '../styles/TokenOverview.css';

const TokenOverview = () => {
  // Placeholder data, in a real application this would come from an API
  const tokens = [
    { id: 1, name: 'Token 1', holders: 100, supply: 1000000, transactions: 250 },
    { id: 2, name: 'Token 2', holders: 200, supply: 2000000, transactions: 500 },
    { id: 3, name: 'Token 3', holders: 150, supply: 1500000, transactions: 300 },
  ];

  return (
    <div className="token-overview">
      <h2>Token Overview</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Token Name</th>
            <th>Holders</th>
            <th>Total Supply</th>
            <th>Recent Transactions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.id}>
              <td>
                <Link to={`/tokens/${token.id}`}>{token.name}</Link>
              </td>
              <td>{token.holders}</td>
              <td>{token.supply}</td>
              <td>{token.transactions}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TokenOverview;
