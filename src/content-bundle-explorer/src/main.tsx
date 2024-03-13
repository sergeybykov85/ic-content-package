import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from '~/router'
import { SnackbarProvider } from 'notistack'
import './styles/main.scss'
import ServicesProvider from '~/context/ServicesContext'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider preventDuplicate style={{ whiteSpace: 'pre-line' }}>
      <ServicesProvider>
        <RouterProvider router={router} />
      </ServicesProvider>
    </SnackbarProvider>
  </React.StrictMode>,
)
