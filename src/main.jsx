import React from 'react'
import ReactDOM from 'react-dom/client'
import Collections from './components/Collections'
import Albums from './components/Albums'
import AlbumPhotos from './components/AlbumPhotos'
import About from './components/About'
import ErrorPage from "./error-page"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import './index.css'
import './App.css'
import "./styles/tailwind.output.css";

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
        element: <AlbumPhotos />,
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
