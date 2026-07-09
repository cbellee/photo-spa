import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { msalConfig } from './config/msalConfig.ts';
import { PublicClientApplication, EventType, AccountInfo, EventMessage } from '@azure/msal-browser';

function renderAuthBootstrapError(message: string): void {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <div style={{ fontFamily: 'sans-serif', margin: '2rem', lineHeight: 1.5 }}>
            <h1>Authentication unavailable</h1>
            <p>{message}</p>
            <p>
                Open this app over HTTPS (or localhost) and try again.
            </p>
        </div>
    );
}

function hasRequiredBrowserCrypto(): boolean {
    return typeof window !== 'undefined'
        && window.isSecureContext
        && typeof window.crypto !== 'undefined'
        && typeof window.crypto.getRandomValues === 'function';
}

async function initializeMsal(): Promise<void> {
    if (!hasRequiredBrowserCrypto()) {
        renderAuthBootstrapError(
            `MSAL requires browser crypto APIs, but this page is running on ${window.location.origin} which is not a secure context.`
        );
        return;
    }

    const pca = new PublicClientApplication(msalConfig);
    await pca.initialize();

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
        <App msalInstance={pca}/>
    );
}

initializeMsal().catch((error) => {
    console.error('Failed to initialize MSAL', error);
    renderAuthBootstrapError(
        'The browser crypto APIs required by authentication are unavailable.'
    );
});

if (!document.getElementById('root')?.hasChildNodes()) {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <div style={{ fontFamily: 'sans-serif', margin: '2rem' }}>Loading...</div>
    );
}