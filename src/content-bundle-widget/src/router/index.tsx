import { createBrowserRouter } from 'react-router-dom'
import WidgetPage from '~/router/pages/WidgetPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>Go to /widget/:widgetId</h1>,
  },
  {
    path: 'widget/:widgetId',
    element: <WidgetPage />,
  },
])

export default router
