import styles from './WidgetList.module.scss'
import { type FC } from 'react'
import Widget from '~/models/Widget.ts'
import WidgetListItem from './WidgetListItem.tsx'

interface WidgetListProps {
  list: Widget[]
}

const WidgetList: FC<WidgetListProps> = ({ list }) => (
  <div className={styles.list}>
    {list.map(item => (
      <WidgetListItem widget={item} key={item.id} />
    ))}
  </div>
)

export default WidgetList
