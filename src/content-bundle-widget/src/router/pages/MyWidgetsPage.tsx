import { type FC, useCallback, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import SectionLayout from '~/components/layouts/SectionLayout'
import WidgetList from '~/components/features/WidgetList'
import type Widget from '~/models/Widget.ts'
import NewWidgetBtn from '~/components/features/NewWidgetBtn'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import parseErrorMsg from '~/utils/parseErrorMsg.ts'

const MyWidgetsPage: FC = () => {
  const { widgetService } = useServices()
  const { principal } = useAuth()
  const { setLoading } = useFullScreenLoading()

  const [widgetsList, setWidgetsList] = useState<Widget[]>([])

  const fetchWidgets = useCallback(async () => {
    try {
      if (!principal) return
      setLoading(true)
      const { items } = await widgetService.getWidgetsByCreator(0, 12, principal)
      setWidgetsList(items)
    } catch (e) {
      enqueueSnackbar(`Failed to fetch widgets list with error: ${parseErrorMsg(e)}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [principal, setLoading, widgetService])

  useEffect(() => {
    if (principal) {
      void fetchWidgets()
    }
  }, [fetchWidgets, principal, widgetService])

  return (
    <SectionLayout title="My widgets" rightElement={<NewWidgetBtn />}>
      <WidgetList list={widgetsList} refreshList={fetchWidgets} />
    </SectionLayout>
  )
}

export default MyWidgetsPage
