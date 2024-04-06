import { type FC, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import WidgetCarousel from '~/components/features/WidgetCarousel'
import BundleView from '~/components/features/BundleView'
import type Widget from '~/models/Widget.ts'
import { Loader } from '~/components/general/Loaders'

const WidgetPage: FC = () => {
  const { widgetId } = useParams()
  const { widgetService } = useServices()

  const [widget, setWidget] = useState<Widget | null>(null)
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      if (widgetId) {
        const widgetData = await widgetService.getWidget(widgetId)
        const widgetItems = await widgetService.getWidgetItems(widgetId)

        setWidget(widgetData)
        setBundles(widgetItems)
      }
    } catch (e) {
      console.info('ERROR:', e)
      setError(true)
    }
  }, [widgetId, widgetService])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  if (error) {
    return <div style={{ textAlign: 'center' }}>Oops, widget with such ID unavailable or does not exist : (</div>
  }

  if (!widget)
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Loader />
      </div>
    )

  return (
    <WidgetCarousel>
      {bundles.map(item => (
        <BundleView key={item.id} bundle={item} widget={widget} />
      ))}
    </WidgetCarousel>
  )
}

export default WidgetPage
