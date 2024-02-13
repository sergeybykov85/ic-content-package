import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/main.scss'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import AuthProvider from '~/context/AuthContext'
import ServicesProvider from '~/context/ServicesContext'
import FullScreenLoadingProvider from '~/context/FullScreenLoadingContext'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider preventDuplicate style={{ whiteSpace: 'pre-line' }}>
      <FullScreenLoadingProvider>
        <AuthProvider>
          <ServicesProvider>
            <RouterProvider router={router} />
          </ServicesProvider>
        </AuthProvider>
      </FullScreenLoadingProvider>
    </SnackbarProvider>
  </React.StrictMode>,
)
