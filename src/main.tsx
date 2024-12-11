import React from 'react';
import ReactDOM from 'react-dom/client';
import Collections from './components/Collections.tsx';
import Albums from './components/AlbumCollections.tsx';
import Photos from './components/Photos.tsx';
import UploadImages from './components/UploadImages.tsx';
import ErrorPage from "./components/ErrorPage.tsx";
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import './index.css';
import "./styles/tailwind.output.css";
import App from './App.tsx';
import { msalConfig } from './config/msalConfig.ts';
import { PublicClientApplication, EventType, AccountInfo, EventMessage } from '@azure/msal-browser';
import { ThemeProvider } from './context/ThemeContext.tsx';

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
/* 
const router = createBrowserRouter([
    {
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Collections collection="" album="" />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/:collection",
                element: <Albums collection="" album="" />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/:collection/:album",
                element: <Photos collection="" album="" />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/upload",
                element: <UploadImages />,
                errorElement: <ErrorPage />,
            }
        ]
    },
]); */

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
            <App msalInstance={pca} /> 
    </React.StrictMode>
);