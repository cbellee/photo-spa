import React from 'react';
import { RouterProvider } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react';
import { faMoon } from "@fortawesome/free-regular-svg-icons";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";
import { IconContext } from "react-icons";
import './app.css'

function App({ msalInstance, browserRouter }) {

  return (
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={browserRouter} />
    </MsalProvider>
  );
}

export default App;
