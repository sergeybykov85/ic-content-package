import { createBrowserRouter, Navigate } from 'react-router-dom'
import WelcomePage from '~/router/pages/WelcomePage.tsx'
import ProtectedRoute from '~/router/pages/ProtectedRoute.tsx'
import MyPackagesPage from '~/router/pages/MyPackagesPage.tsx'
import WarehousePage from '~/router/pages/WarehousePage.tsx'

const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
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
        path: 'warehouse',
        element: <WarehousePage />,
      },
    ],
  },
])

export default router
