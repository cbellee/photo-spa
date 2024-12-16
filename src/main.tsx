import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "./styles/tailwind.output.css";
import App from './App.tsx';
import { msalConfig } from './config/msalConfig.ts';
import { PublicClientApplication, EventType, AccountInfo, EventMessage } from '@azure/msal-browser';

const pca = new PublicClientApplication(msalConfig);

async function initializeMsal(): Promise<void> {
    await pca.initialize();
}

initializeMsal();

// Required before attempting any other MSAL api call:
const accounts: AccountInfo[] = pca.getAllAccounts();

if (accounts.length > 0) {
    pca.setActiveAccount(accounts[0]);
}

pca.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const account = (event.payload as AccountInfo);
        pca.setActiveAccount(account);
    }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App msalInstance={pca} />
);