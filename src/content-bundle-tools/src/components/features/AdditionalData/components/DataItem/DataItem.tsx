import { type FC, useCallback, useMemo, useState } from 'react'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import type Bundle from '~/models/Bundle.ts'
import styles from './DataItem.module.scss'
import clsx from 'clsx'
import Collapse from '~/components/general/Collapse'
import DataItemGallery from '../DataItemGallery/DataItemGallery.tsx'
import DataItemDefault from '../DataItemDefault/DataItemDefault.tsx'
import DataItemLocation from '../DataItemLocation/DataItemLocation.tsx'
import DataItemAbout from '../DataItemAbout/DataItemAbout.tsx'
import DataItemAudio from '../DataItemAudio/DataItemAudio.tsx'
import DataItemArticle from '~/components/features/AdditionalData/components/DataItemArticle/DataItemArticle.tsx'

interface DataItemProps {
  item: AdditionalDataSection
  bundle: Bundle
}

const DataItem: FC<DataItemProps> = ({ item, bundle }) => {
  const [open, setOpen] = useState(false)

  const renderItem = useCallback(
    ({ category, dataList, dataPathUrl }: AdditionalDataSection) => {
      switch (category) {
        case 'Gallery':
          return <DataItemGallery list={dataList} />
        case 'Location':
          return <DataItemLocation list={dataList} locations={bundle.locations} />
        case 'About':
          return <DataItemAbout list={dataList} about={bundle.about} />
        case 'Audio':
        case 'AudioGuide':
          return <DataItemAudio list={dataList} />
        case 'Article':
          return <DataItemArticle list={dataList} dataPathUrl={dataPathUrl} />
        default:
          return <DataItemDefault list={dataList} />
      }
    },
    [bundle.about, bundle.locations],
  )

  const category = useMemo(() => (item.category === 'AudioGuide' ? 'Audio Guide' : item.category), [item.category])

  return (
    <div>
      <div className={clsx(styles.header, open && styles.opened)} onClick={() => setOpen(prevState => !prevState)}>
        {category}
        <img src="/images/arrow-down.svg" alt="arrow" />
      </div>
      <Collapse open={open}>
        <div className={styles.body}>{renderItem(item)}</div>
      </Collapse>
    </div>
  )
}

export default DataItem
