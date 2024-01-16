import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/main.scss'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { AuthContextProvider } from 'context/AuthContext'
import { SnackbarProvider } from 'notistack'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider preventDuplicate>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </SnackbarProvider>
  </React.StrictMode>,
)
