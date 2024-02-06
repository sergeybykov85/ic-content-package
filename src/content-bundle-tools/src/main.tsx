import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/main.scss'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import AuthProvider from '~/context/AuthContext'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider preventDuplicate>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </SnackbarProvider>
  </React.StrictMode>,
)
