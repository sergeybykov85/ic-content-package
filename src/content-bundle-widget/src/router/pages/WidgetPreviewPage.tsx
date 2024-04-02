import type { FC } from 'react'
import WidgetLayout from '~/components/layouts/WidgetLayout'
import WidgetPage from '~/router/pages/WidgetPage.tsx'
import WidgetEmbedCode from '~/components/features/WidgetEmbedCode/WidgetEmbedCode.tsx'
import { useParams } from 'react-router-dom'

const WidgetPreviewPage: FC = () => {
  const { widgetId = '' } = useParams()
  return (
    <>
      <WidgetLayout>
        <WidgetPage />
      </WidgetLayout>
      <WidgetEmbedCode widgetId={widgetId} />
    </>
  )
}

export default WidgetPreviewPage
