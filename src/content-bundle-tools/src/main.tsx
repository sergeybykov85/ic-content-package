import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/main.scss'
import router from './router'
import { RouterProvider } from 'react-router-dom'
// import AuthContextProvider from '~/context/AuthContext/AuthContextProvider'
import { SnackbarProvider } from 'notistack'
import { RecoilRoot } from 'recoil'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider preventDuplicate>
      <RecoilRoot>
        <RouterProvider router={router} />
      </RecoilRoot>
    </SnackbarProvider>
  </React.StrictMode>,
)
