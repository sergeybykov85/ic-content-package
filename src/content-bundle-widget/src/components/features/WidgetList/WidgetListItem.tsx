import styles from './WidgetList.module.scss'
import { type FC, useCallback, useState } from 'react'
import type Widget from '~/models/Widget.ts'
import shortenPrincipal from '~/utils/shortenPrincipal.ts'
import clsx from 'clsx'
import { WIDGET_STATUSES } from '~/types/widgetTypes.ts'
import If from '~/components/general/If.tsx'
import Button from '~/components/general/Button'
import { Link } from 'react-router-dom'
import { useServices } from '~/context/ServicesContext'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import getWidgetEmbedCode from '~/utils/getWidgetEmbedCode.ts'
import copyToClipboard from '~/utils/copyToClipboard.ts'

interface WidgetListProps {
  widget: Widget
}

const WidgetListItem: FC<WidgetListProps> = ({ widget }) => {
  const { widgetService } = useServices()
  const { setLoading } = useFullScreenLoading()
  const [isActive, setIsActive] = useState(widget.status === WIDGET_STATUSES.Active)

  const activateWidget = useCallback(async () => {
    try {
      setLoading(true)
      await widgetService.updateWidget(widget.id, { status: WIDGET_STATUSES.Active })
      setIsActive(true)
      enqueueSnackbar('Widget successfully activated', { variant: 'success' })
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Widget activation failed', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [setLoading, widget.id, widgetService])

  const copyWidgetCode = useCallback(() => {
    const embedCode = getWidgetEmbedCode(widget.id)
    copyToClipboard(embedCode, () => {
      enqueueSnackbar('Copied to clipboard', { variant: 'success' })
    })
  }, [widget.id])

  return (
    <div className={styles.item}>
      <h2 className={styles.title}>{widget.name}</h2>
      <p className={styles.description}>{widget.description}</p>
      <p className={clsx(styles.detail, isActive && styles.active)}>
        <span>Status:</span>
        {widget.status}
      </p>
      <p className={styles.detail}>
        <span>Type:</span>
        {widget.type}
      </p>
      <p className={styles.detail}>
        <span>Creator:</span>
        {shortenPrincipal(widget.creator)}
      </p>
      <p className={styles.detail}>
        <span>Created:</span>
        {widget.created}
      </p>
      <div className={styles['btn-group']}>
        <If condition={!isActive}>
          <Button text="Activate" onClick={activateWidget} />
        </If>
        <If condition={isActive}>
          <Button text="Copy embed code" variant="outlined" onClick={copyWidgetCode} />
          <Link to={`/widget-preview/${widget.id}`} target="_blank">
            <Button text="Open preview" variant="text" />
          </Link>
        </If>
      </div>
    </div>
  )
}

export default WidgetListItem
