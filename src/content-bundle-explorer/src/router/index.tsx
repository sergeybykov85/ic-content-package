import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '~/components/layouts/MainLayout'
import HomePage from '~/router/pages/HomePage.tsx'
import PackageDetailsPage from '~/router/pages/PackageDetailsPage'
import ErrorPage from '~/router/pages/ErrorPage'
import BundleDetailsPage from '~/router/pages/BundleDetailsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'package/:packageId',
        element: <PackageDetailsPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'package/:packageId/bundle/:bundleId',
        element: <BundleDetailsPage />,
        errorElement: <ErrorPage />,
      },
    ],
  },
])

export default router
