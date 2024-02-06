import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/main.scss'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import AuthProvider from '~/context/AuthContext'
import ServicesProvider from '~/context/ServicesContext'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider preventDuplicate>
      <AuthProvider>
        <ServicesProvider>
          <RouterProvider router={router} />
        </ServicesProvider>
      </AuthProvider>
    </SnackbarProvider>
  </React.StrictMode>,
)
