import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '~/components/layouts/MainLayout'
import HomePage from '~/router/pages/HomePage.tsx'
import PackageDetailsPage from '~/router/pages/PackageDetailsPage'

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
        element: <PackageDetailsPage />,
      },
      {
        path: 'package/:packageId/bundle/:bundleId',
        element: <h1>Package page</h1>,
      },
    ],
  },
])

export default router
