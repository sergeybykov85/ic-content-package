import { createBrowserRouter } from 'react-router-dom'
import RootPage from './pages/RootPage'
import PublicPackagesPage from './pages/PublicPackagesPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootPage />,
  },
  {
    path: '/public-packages',
    element: <PublicPackagesPage />,
  },
])

export default router
