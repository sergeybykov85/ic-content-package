import styles from './WidgetList.module.scss'
import { type FC, useMemo } from 'react'
import type Widget from '~/models/Widget.ts'
import clsx from 'clsx'
import { WIDGET_STATUSES } from '~/types/widgetTypes.ts'
import If from '~/components/general/If.tsx'
import Button from '~/components/general/Button'
import { Link } from 'react-router-dom'
// import { enqueueSnackbar } from 'notistack'
// import getWidgetEmbedCode from '~/utils/getWidgetEmbedCode.ts'
// import copyToClipboard from '~/utils/copyToClipboard.ts'
import IconButton from '~/components/general/IconButton'

interface WidgetListProps {
  widget: Widget
  onClickActivate: (widgetId: string) => void
  onClickDelete: (widgetId: string) => void
}

const WidgetListItem: FC<WidgetListProps> = ({ widget, onClickActivate, onClickDelete }) => {
  const isActive = useMemo(() => widget.status === WIDGET_STATUSES.Active, [widget.status])

  // const copyWidgetCode = useCallback(() => {
  //   const embedCode = getWidgetEmbedCode(widget.id)
  //   copyToClipboard(embedCode, () => {
  //     enqueueSnackbar('Copied to clipboard', { variant: 'success' })
  //   })
  // }, [widget.id])

  return (
    <div className={styles.item}>
      <h2 className={styles.title}>
        {widget.name}
        <IconButton iconName="trash.svg" onClick={() => onClickDelete(widget.id)} size={30} className={styles.delete} />
      </h2>
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
        <span>Created:</span>
        {widget.created}
      </p>
      <div className={styles['btn-group']}>
        <Link to={`/widget-editor/${widget.id}`}>
          <Button text="Edit widget" variant="outlined" />
        </Link>
        <If condition={!isActive}>
          <Button text="Activate" onClick={() => onClickActivate(widget.id)} />
        </If>
        <If condition={isActive}>
          {/*<Button text="Copy embed code" variant="outlined" onClick={copyWidgetCode} />*/}
          <Link to={`/widget-preview/${widget.id}`} target="_blank">
            <Button text="Open preview" variant="text" />
          </Link>
        </If>
      </div>
    </div>
  )
}

export default WidgetListItem
