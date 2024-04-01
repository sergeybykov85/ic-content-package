import { type FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import WidgetCarousel from '~/components/features/WidgetCarousel'
import BundleView from '~/components/features/BundleView'
import type Widget from '~/models/Widget.ts'

const WidgetPage: FC = () => {
  const { widgetId } = useParams()
  const { widgetService } = useServices()

  const [widget, setWidget] = useState<Widget | null>(null)
  const [bundles, setBundles] = useState<Bundle[]>([])

  useEffect(() => {
    if (widgetId) {
      widgetService.getWidget(widgetId).then(res => setWidget(res))
      widgetService.getWidgetItems(widgetId).then(res => setBundles(res))
    }
  }, [widgetId, widgetService])

  if (!widget) return null

  return (
    <WidgetCarousel>
      {bundles.map(item => (
        <BundleView key={item.id} bundle={item} widget={widget} />
      ))}
    </WidgetCarousel>
  )
}

export default WidgetPage
