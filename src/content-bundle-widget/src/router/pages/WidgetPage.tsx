import type { FC } from 'react'
import { useParams } from 'react-router-dom'

const WidgetPage: FC = () => {
  const { widgetId } = useParams()
  return <h1>Widget with ID: {widgetId}</h1>
}

export default WidgetPage
