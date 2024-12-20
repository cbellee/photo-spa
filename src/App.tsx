import React from 'react';
import { RouterProvider } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react';
import { ThemeProvider } from './context/ThemeContext';
import Collections from './components/Collections.tsx';
import Albums from './components/AlbumCollections.tsx';
import Photos from './components/Photos.tsx';
import UploadImages from './components/Upload.tsx';
import ErrorPage from "./components/ErrorPage.tsx";
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import About from './components/About.tsx';
import './app.css'

function App({ msalInstance}) {

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
            },
            {
              path: "/about",
              element: <About />,
              errorElement: <ErrorPage />,
          }
        ]
    },
]);

  return (
    <MsalProvider instance={msalInstance}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </MsalProvider>
  );
}

export default App;
