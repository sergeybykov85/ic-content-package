import { type FC, useEffect } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import SectionLayout from '~/components/layouts/SectionLayout'

const MyWidgetsPage: FC = () => {
  const { widgetService } = useServices()
  const { principal } = useAuth()

  useEffect(() => {
    if (principal) {
      void widgetService.getWidgetsByCreator(0, 12, principal)
    }
  }, [principal, widgetService])

  return <SectionLayout title="My widgets">here will be a list of widgets</SectionLayout>
}

export default MyWidgetsPage
