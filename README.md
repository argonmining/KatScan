# KatScan: KRC-20 Explorer & Insights Webapp for Kaspa Ecosystem

KatScan is a comprehensive KRC-20 token explorer and analysis tool for the Kaspa blockchain ecosystem. This web application allows users to view, track, and analyze KRC-20 tokens and transactions in the Kaspa network, providing valuable insights into token markets, holders, and token comparisons. The project was developed by volunteers from the Nacho the Kat community and is part of the open-source initiative to enhance Kaspa's ecosystem.

### Features
- **Token Explorer**: View detailed information on KRC-20 tokens.
- **Transaction Tracking**: Lookup transactions and wallet balances in real-time.
- **Market Analysis**: Compare tokens by market cap and other metrics.
- **Cross-Token Holder Lookup**: Analyze holders of multiple tokens across the network.
- **Mint Heatmap**: Visualize token minting activity over time.

### Recent Changes
At the request of the Community, KatScan has been updated to filter tickers that are specifically named in an overtly offensive manner. All data for the tokens remain, but those ticker's will be "bleeped" with asterisks to provide a more welcoming experience for everyone. If you are a project owner that has been bleeped and would like to discuss alternative solutions please log an issue here and we will respond.

### Built By
KatScan is built by volunteers from the Nacho the Kat community to support the Kaspa ecosystem, leveraging modern web development technologies such as React and various API services.

### Dependencies
KatScan relies partially on the database and endpoints provided by the [KRC-20 Backend](https://github.com/argonmining/krc20-backend) repository. This backend project provides the necessary APIs for KRC-20 token information, transaction lookups, and wallet balances that are essential to the functionality of the KatScan platform.

### Getting Started

To set up the KatScan web app for development or deployment, follow the steps below.

#### Installation

Clone the repository:
```bash
git clone https://github.com/argonmining/KatScan.git
cd KatScan
```

Install dependencies:
```
npm install
```
#### Available Scripts
In the project directory, you can run:

npm start
Runs the app in development mode. Open http://localhost:3000 to view it in your browser. The page will reload as you make changes, and any lint errors will be displayed in the console.

npm test
Launches the test runner in interactive watch mode.

npm run build
Builds the app for production in the build folder. It bundles the React app for production and optimizes the build for the best performance.

#### Learn More
This project was bootstrapped with Create React App. For more detailed documentation on how to use Create React App, visit its official documentation.

#### Contribution
We welcome contributions from the community! If you'd like to report bugs, suggest features, or contribute code, feel free to submit issues or pull requests to the repository.
If you would like to donate to the KatScan project, we accept Kaspa and KRC20 Tokens here: kaspa:qrtsw8lkquppuurmy9zrjdgpgdthfall90ve06yw88vc9dzmr26wqvz3vlqt9

#### License
This project is open-source and licensed under the MIT License.

#### Related Repositories
KRC-20 Backend: https://github.com/argonmining/krc20-backend
Backend repository providing the APIs for token and transaction data. 
