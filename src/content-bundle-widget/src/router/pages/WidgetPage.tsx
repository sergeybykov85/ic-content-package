import { type FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import WidgetCarousel from '~/components/general/WidgetCarousel'

const WidgetPage: FC = () => {
  const { widgetId } = useParams()
  const { widgetService } = useServices()

  const [bundles, setBundles] = useState<Bundle[]>([])

  useEffect(() => {
    if (widgetId) {
      widgetService.getWidgetItems(widgetId).then(response => setBundles(response))
    }
  }, [widgetId, widgetService])

  return (
    <WidgetCarousel>
      {bundles.map(item => (
        <div key={item.id}>
          <h2>{item.name}</h2>
        </div>
      ))}
    </WidgetCarousel>
  )
}

export default WidgetPage
