import { createBrowserRouter } from 'react-router-dom'
import WidgetPage from '~/router/pages/WidgetPage.tsx'
import WidgetLayout from '~/components/layouts/WidgetLayout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>Go to /widget/:widgetId</h1>,
  },
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
])

export default router
