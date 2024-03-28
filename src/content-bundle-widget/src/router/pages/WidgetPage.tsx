import { type FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import WidgetCarousel from '~/components/features/WidgetCarousel'
import BundleView from '~/components/features/BundleView'

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
        <BundleView key={item.id} bundle={item} />
      ))}
    </WidgetCarousel>
  )
}

export default WidgetPage
