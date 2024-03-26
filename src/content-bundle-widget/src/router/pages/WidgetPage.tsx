import { type FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useServices } from '~/context/ServicesContext'
import type Widget from '~/models/Widget.ts'

const WidgetPage: FC = () => {
  const { widgetId } = useParams()
  const { widgetService } = useServices()

  const [widget, setWidget] = useState<Widget | null>(null)

  useEffect(() => {
    if (widgetId) {
      widgetService.getWidget(widgetId).then(response => setWidget(response))
    }
  }, [widgetId, widgetService])
  return (
    <div>
      <h1>Widget with ID: {widgetId}</h1>
      {widget ? (
        <>
          <h2>{widget.name}</h2>
          <p>{widget.description}</p>
        </>
      ) : (
        <h2>
          <br />
          <i style={{ color: 'red' }}>NOT FOUND</i>
        </h2>
      )}
    </div>
  )
}

export default WidgetPage
