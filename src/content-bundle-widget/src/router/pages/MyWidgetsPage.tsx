import { type FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import SectionLayout from '~/components/layouts/SectionLayout'
import { Link } from 'react-router-dom'
import Button from '~/components/general/Button'
import WidgetList from '~/components/features/WidgetList'
import Widget from '~/models/Widget.ts'

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
    <SectionLayout
      title="My widgets"
      rightElement={
        <Link to="/new-widget">
          <Button text="Create new widget" />
        </Link>
      }
    >
      <WidgetList list={widgetsList} />
    </SectionLayout>
  )
}

export default MyWidgetsPage
