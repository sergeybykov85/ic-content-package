import { createBrowserRouter } from 'react-router-dom'
import WidgetPage from '~/router/pages/WidgetPage.tsx'

const router = createBrowserRouter([
  {
    path: 'widget/:widgetId',
    element: <WidgetPage />,
  },
])

export default router
