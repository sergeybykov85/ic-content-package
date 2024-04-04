import { createBrowserRouter } from 'react-router-dom'
import WidgetPage from '~/router/pages/WidgetPage.tsx'
import WidgetLayout from '~/components/layouts/WidgetLayout'
import WidgetPreviewPage from '~/router/pages/WidgetPreviewPage.tsx'
import MainLayout from '~/components/layouts/MainLayout';

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
    path: '',
    element: <MainLayout>Hello</MainLayout>
  }
])

export default router
