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
    ],
  },
])

export default router
