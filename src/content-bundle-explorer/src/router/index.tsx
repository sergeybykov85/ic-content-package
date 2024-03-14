import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '~/components/layouts/MainLayout'
import HomePage from '~/router/pages/HomePage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'package/:packageId',
        element: <h1>Package page</h1>,
      },
      {
        path: 'package/:packageId/bundle/:bundleId',
        element: <h1>Package page</h1>,
      },
    ],
  },
])

export default router
