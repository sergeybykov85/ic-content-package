import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '~/components/general/Button'
import SectionLayout from '~/components/layouts/SectionLayout'
import { useServices } from '~/context/ServicesContext'
import type Widget from '~/models/Widget.ts'
import WidgetForm from '~/components/features/WidgetForm'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'

const WidgetEditorPage: FC = () => {
  const { widgetId } = useParams()
  const { widgetService } = useServices()
  const { setLoading } = useFullScreenLoading()

  const [widget, setWidget] = useState<Widget | undefined>()

  useEffect(() => {
    if (widgetId) {
      setLoading(true)
      widgetService
        .getWidget(widgetId)
        .then(res => setWidget(res))
        .finally(() => setLoading(false))
    }
  }, [setLoading, widgetId, widgetService])

  return (
    <SectionLayout
      title="Edit widget"
      rightElement={
        <Link to={'/my-widgets'}>
          <Button text="Back to list" variant="text" />
        </Link>
      }
    >
      {widget && <WidgetForm widget={widget} />}
    </SectionLayout>
  )
}

export default WidgetEditorPage
