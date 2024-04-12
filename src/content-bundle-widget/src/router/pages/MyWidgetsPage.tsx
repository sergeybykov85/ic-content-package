import { type FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import SectionLayout from '~/components/layouts/SectionLayout'
import WidgetList from '~/components/features/WidgetList'
import type Widget from '~/models/Widget.ts'
import NewWidgetBtn from '~/components/features/NewWidgetBtn'

const MyWidgetsPage: FC = () => {
  const { widgetService } = useServices()
  const { principal } = useAuth()

  const [widgetsList, setWidgetsList] = useState<Widget[]>([])

  useEffect(() => {
    if (principal) {
      widgetService.getWidgetsByCreator(0, 12, principal).then(({ items }) => {
        setWidgetsList(items)
      })
    }
  }, [principal, widgetService])

  return (
    <SectionLayout title="My widgets" rightElement={<NewWidgetBtn />}>
      <WidgetList list={widgetsList} />
    </SectionLayout>
  )
}

export default MyWidgetsPage
