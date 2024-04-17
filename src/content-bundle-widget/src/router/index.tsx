import { createBrowserRouter, Navigate } from 'react-router-dom'
import WidgetPage from '~/router/pages/WidgetPage.tsx'
import WidgetLayout from '~/components/layouts/WidgetLayout'
import WidgetPreviewPage from '~/router/pages/WidgetPreviewPage.tsx'
import MainLayout from '~/components/layouts/MainLayout'
import ProtectedRoute from '~/components/layouts/ProtectedRoute.tsx'
import WelcomePage from '~/router/pages/WelcomePage.tsx'
import MyWidgetsPage from '~/router/pages/MyWidgetsPage.tsx'
import NewWidgetPage from '~/router/pages/NewWidgetPage.tsx'
import ErrorPage from '~/router/pages/ErrorPage'
import WidgetEditorPage from '~/router/pages/WidgetEditorPage.tsx'

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
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <Navigate to="my-widgets" replace />,
      },
      {
        path: 'my-widgets',
        element: <MyWidgetsPage />,
      },
      {
        path: 'new-widget',
        element: <NewWidgetPage />,
      },
      {
        path: 'widget-editor/:widgetId',
        element: <WidgetEditorPage />,
      },
    ],
  },
])

export default router
