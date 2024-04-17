import styles from './WidgetList.module.scss'
import { type FC, useCallback } from 'react'
import type Widget from '~/models/Widget.ts'
import WidgetListItem from './WidgetListItem.tsx'
import { useServices } from '~/context/ServicesContext'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { WIDGET_STATUSES } from '~/types/widgetTypes.ts'
import { enqueueSnackbar } from 'notistack'
import parseErrorMsg from '~/utils/parseErrorMsg.ts'

interface WidgetListProps {
  list: Widget[]
  refreshList: () => void
}

const WidgetList: FC<WidgetListProps> = ({ list, refreshList }) => {
  const { widgetService } = useServices()
  const { setLoading } = useFullScreenLoading()

  const activateWidget = useCallback(
    async (widgetId: string) => {
      try {
        setLoading(true)
        await widgetService.updateWidgetStatus(widgetId, WIDGET_STATUSES.Active)
        enqueueSnackbar('Widget was successfully activated', { variant: 'success' })
        refreshList()
      } catch (error) {
        setLoading(false)
        console.error(error)
        enqueueSnackbar(`Failed to activate widget with error: ${parseErrorMsg(error)}`, { variant: 'error' })
      }
    },
    [refreshList, setLoading, widgetService],
  )

  const deleteWidget = useCallback(
    async (widgetId: string) => {
      try {
        setLoading(true)
        await widgetService.removeWidget(widgetId)
        enqueueSnackbar('Widget was successfully deleted', { variant: 'success' })
        refreshList()
      } catch (error) {
        setLoading(false)
        console.error(error)
        enqueueSnackbar(`Failed to delete widget with error: ${parseErrorMsg(error)}`, { variant: 'error' })
      }
    },
    [refreshList, setLoading, widgetService],
  )

  return (
    <div className={styles.list}>
      {list.map(item => (
        <WidgetListItem widget={item} key={item.id} onClickActivate={activateWidget} onClickDelete={deleteWidget} />
      ))}
    </div>
  )
}

export default WidgetList
