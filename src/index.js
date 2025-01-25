import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import {HelmetProvider} from "react-helmet-async";
import {DarkModeProvider, MobileProvider} from 'nacho-component-library'
import {SubscriptionProvider} from "./services/subscription/SubscriptionProvider";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HelmetProvider>
            <DarkModeProvider>
                <MobileProvider>
                    <SubscriptionProvider>
                        <App/>
                    </SubscriptionProvider>
                </MobileProvider>
            </DarkModeProvider>
        </HelmetProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
 