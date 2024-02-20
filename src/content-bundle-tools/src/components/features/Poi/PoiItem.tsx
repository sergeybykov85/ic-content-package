import PoiSection from '~/models/PoiSection.ts'
import { FC, useState } from 'react'
import Collapse from '~/components/general/Collapse'
import styles from './PoiItem.module.scss'
import clsx from 'clsx'

interface PoiItemProps {
  item: PoiSection
}

const PoiItem: FC<PoiItemProps> = ({ item }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.item}>
      <div className={clsx(styles.header, open && styles.opened)} onClick={() => setOpen(prevState => !prevState)}>
        {item.category}
        <img src="/images/arrow-down.svg" alt="arrow" />
      </div>
      <Collapse open={open}>{item.dataList.map(i => i.url)}</Collapse>
    </div>
  )
}

export default PoiItem
