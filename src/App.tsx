import React from 'react';
import { RouterProvider } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react';
import './app.css'

function App({ msalInstance, browserRouter }) {

  return (
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={browserRouter} />
    </MsalProvider>
  );
}

export default App;
