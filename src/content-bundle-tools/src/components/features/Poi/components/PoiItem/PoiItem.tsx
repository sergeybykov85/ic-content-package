import { type FC, useCallback, useState } from 'react'
import type PoiSection from '~/models/PoiSection.ts'
import type Bundle from '~/models/Bundle.ts'
import styles from './PoiItem.module.scss'
import clsx from 'clsx'
import Collapse from '~/components/general/Collapse'
import PoiItemGallery from '../PoiItemGallery/PoiItemGallery.tsx'
import PoiItemDefault from '../PoiItemDefault/PoiItemDefault.tsx'
import PollItemLocation from '../PollItemLocation/PollItemLocation.tsx'
import PoiItemAbout from '../PoiItemAbout/PoiItemAbout.tsx'

interface PoiItemProps {
  item: PoiSection
  bundle: Bundle
}

const PoiItem: FC<PoiItemProps> = ({ item, bundle }) => {
  const [open, setOpen] = useState(false)

  const renderItem = useCallback(
    ({ category, dataList }: PoiSection) => {
      switch (category) {
        case 'Gallery':
          return <PoiItemGallery list={dataList} />
        case 'Location':
          return <PollItemLocation list={dataList} locations={bundle.locations} />
        case 'About':
          return <PoiItemAbout list={dataList} about={bundle.about} />
        default:
          return <PoiItemDefault list={dataList} />
      }
    },
    [bundle.about, bundle.locations],
  )

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
