import { createBrowserRouter, Navigate } from 'react-router-dom'
import WidgetPage from '~/router/pages/WidgetPage.tsx'
import WidgetLayout from '~/components/layouts/WidgetLayout'
import WidgetPreviewPage from '~/router/pages/WidgetPreviewPage.tsx'
import MainLayout from '~/components/layouts/MainLayout'
import ProtectedRoute from '~/components/layouts/ProtectedRoute.tsx'
import WelcomePage from '~/router/pages/WelcomePage.tsx'
import MyWidgetsPage from '~/router/pages/MyWidgetsPage.tsx'

const router = createBrowserRouter([
  {
    path: 'widget/',
    element: <WidgetLayout />,
    children: [
      {
        path: ':widgetId',
        element: <WidgetPage />,
      },
    ],
  },
  {
    path: 'widget-preview/:widgetId',
    element: <WidgetPreviewPage />,
  },
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/',
    element: (
      <MainLayout>
        <ProtectedRoute />
      </MainLayout>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="my-widgets" replace />,
      },
      {
        path: 'my-widgets',
        element: <MyWidgetsPage />,
      },
    ],
  },
])

export default router
