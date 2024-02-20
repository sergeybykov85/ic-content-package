import type PoiSection from '~/models/PoiSection.ts'
import { type FC, useCallback, useState } from 'react'
import Collapse from '~/components/general/Collapse'
import styles from './PoiItem.module.scss'
import clsx from 'clsx'
import PoiItemGallery from '../PoiItemGallery/PoiItemGallery.tsx'

interface PoiItemProps {
  item: PoiSection
}

/*
 * [+] Gallery
 * [ ] About
 * [ ] Location
 * */

const PoiItem: FC<PoiItemProps> = ({ item }) => {
  const [open, setOpen] = useState(false)

  const renderItem = useCallback((item: PoiSection) => {
    switch (item.category) {
      case 'Gallery':
        return <PoiItemGallery list={item.dataList} />
      default:
        return item.dataList.map(i => i.url)
    }
  }, [])

  return (
    <div>
      <div className={clsx(styles.header, open && styles.opened)} onClick={() => setOpen(prevState => !prevState)}>
        {item.category}
        <img src="/images/arrow-down.svg" alt="arrow" />
      </div>
      <Collapse open={open}>
        <div className={styles.body}>{renderItem(item)}</div>
      </Collapse>
    </div>
  )
}

export default PoiItem
