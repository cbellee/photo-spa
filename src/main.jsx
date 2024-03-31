import React from 'react'
import ReactDOM from 'react-dom/client'
import Collections from './components/Collections'
import Albums from './components/Albums'
import Photos from './components/Photos'
import About from './components/About'
import ErrorPage from "./error-page"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import './index.css'
import './App.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/collections",
        element: <Collections />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/collections/:collection/albums",
        element: <Albums />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/collections/:collection/albums/:album",
        element: <Photos />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/about",
        element: <About />,
        errorElement: <ErrorPage />,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
