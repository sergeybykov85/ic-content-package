import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from '~/router'
import { SnackbarProvider } from 'notistack'
import './styles/main.scss'
import ServicesProvider from '~/context/ServicesContext'
import AuthProvider from '~/context/AuthContext';
// import FullScreenLoadingProvider from '~/context/FullScreenLoadingContext'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider preventDuplicate style={{ whiteSpace: 'pre-line' }}>
      {/*<FullScreenLoadingProvider>*/}
      <AuthProvider>
        <ServicesProvider>
          <RouterProvider router={router} />
        </ServicesProvider>
      </AuthProvider>
      {/*</FullScreenLoadingProvider>*/}
    </SnackbarProvider>
  </React.StrictMode>,
)
