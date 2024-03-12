import { createBrowserRouter, Navigate } from 'react-router-dom'
import WelcomePage from '~/router/pages/WelcomePage.tsx'
import ProtectedRoute from '~/router/pages/ProtectedRoute.tsx'
import MyPackagesPage from '~/router/pages/MyPackagesPage.tsx'
import WarehousePage from '~/router/pages/WarehousePage.tsx'
import DeployPackagePage from '~/router/pages/DeployPackagePage.tsx'
import PackageDetailsPage from '~/router/pages/PackageDetailsPage.tsx'
import BundleDetailsPage from '~/router/pages/BundleDetailsPage.tsx'
import DeployBundlePage from '~/router/pages/DeployBundlePage.tsx'
import ErrorPage from '~/components/features/ErrorPage'
import PackageEditPage from '~/router/pages/PackageEditPage.tsx'
import BundleEditPage from '~/router/pages/BundleEditPage.tsx'

const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <Navigate to="my-packages" />,
      },
      {
        path: 'my-packages',
        element: <MyPackagesPage />,
      },
      {
        path: 'deploy-package',
        element: <DeployPackagePage />,
      },
      {
        path: 'warehouse',
        element: <WarehousePage />,
      },
      {
        path: 'package/:packageId/',
        element: <PackageDetailsPage />,
      },
      {
        path: 'package/:packageId/edit',
        element: <PackageEditPage />,
      },
      {
        path: 'package/:packageId/bundle/:bundleId',
        element: <BundleDetailsPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'package/:packageId/bundle/:bundleId/edit',
        element: <BundleEditPage />,
      },
      {
        path: 'package/:packageId/create-bundle',
        element: <DeployBundlePage />,
      },
    ],
  },
])

export default router
