import { createBrowserRouter, Navigate } from 'react-router-dom'
import WelcomePage from '~/router/pages/WelcomePage.tsx'
import PublicPackagesPage from './pages/PublicPackagesPage.tsx'
import ProtectedRoute from '~/router/pages/ProtectedRoute.tsx'
import MyPackagesPage from '~/router/pages/MyPackagesPage.tsx'

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
        path: 'public-packages',
        element: <PublicPackagesPage />,
      },
    ],
  },
])

export default router
