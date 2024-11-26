import React from 'react'
import ReactDOM from 'react-dom/client'
import Collections from '../components/Collections.tsx'
import Albums from '../components/AlbumCollections.tsx'
import Photos from '../components/Photos.tsx'
import UploadImages from '../components/UploadImages.tsx'
import ErrorPage from "../components/ErrorPage.tsx"
import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout.tsx'
import './index.css'
import "./styles/tailwind.output.css";
import App from '../App.js'
import { msalConfig } from '../config/msalConfig.js'
import { PublicClientApplication, EventType } from '@azure/msal-browser'

async function initializeMsal() {
  await pca.initialize();
}

const pca = new PublicClientApplication(msalConfig);
initializeMsal();

// Required before attempting any other MSAL api call:
const accounts = pca.getAllAccounts();

if (accounts.length > 0) {
  pca.setActiveAccount(accounts[0]);
}

pca.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload;
    const account = payload.account;
    pca.setActiveAccount(account);
  }
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Collections />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/:collection",
        element: <Albums />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/:collection/:album",
        element: <Photos />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/upload",
        element: <UploadImages />,
        errorElement: <ErrorPage />,
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App msalInstance={pca} browserRouter={router} />
)
