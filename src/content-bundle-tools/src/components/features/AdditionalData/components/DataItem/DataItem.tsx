import { type FC, type MouseEventHandler, useCallback, useMemo, useState } from 'react'
import { type DataListItem } from '~/models/AdditionalDataSection.ts'
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
import If from '~/components/general/If'
import IconButton from '~/components/general/IconButton'
import type { RemoveBundleDataParams } from '~/types/bundleDataTypes.ts'

interface DataItemProps {
  item: AdditionalDataSection
  bundle: Bundle
  editable?: boolean
  onRemoveClick: (prams: Omit<RemoveBundleDataParams, 'group'>) => void
}

const DataItem: FC<DataItemProps> = ({ item, bundle, editable, onRemoveClick }) => {
  const [open, setOpen] = useState(false)

  const category = useMemo(() => (item.category === 'AudioGuide' ? 'Audio Guide' : item.category), [item.category])

  const handleRemoveCategoryClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    event => {
      event.stopPropagation()
      item.category && onRemoveClick({ category: item.category })
    },
    [item.category, onRemoveClick],
  )

  const handleRemoveItemClick = useCallback(
    (resourceId: DataListItem['id']) => {
      item.category && onRemoveClick({ category: item.category, resourceId })
    },
    [item.category, onRemoveClick],
  )

  const renderItem = useCallback(
    ({ category, dataList, dataPathUrl }: AdditionalDataSection) => {
      switch (category) {
        case 'Gallery':
          return <DataItemGallery list={dataList} editable={editable} onRemoveClick={handleRemoveItemClick} />
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
    [bundle.about, bundle.locations, handleRemoveItemClick, editable],
  )

  return (
    <div>
      <div className={clsx(styles.header, open && styles.opened)} onClick={() => setOpen(prevState => !prevState)}>
        <span>{category}</span>
        <If condition={editable}>
          <IconButton iconName="trash.svg" size={25} className={styles.trash} onClick={handleRemoveCategoryClick} />
        </If>
        <img src="/images/arrow-down.svg" alt="arrow" className={styles.arrow} />
      </div>
      <Collapse open={open}>
        <div className={styles.body}>{renderItem(item)}</div>
      </Collapse>
    </div>
  )
}

export default DataItem
