import { type FC, type MouseEvent, useCallback } from 'react'
import styles from './DataItemGallery.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import CardsGrid from '~/components/general/CardsGrid/CardsGrid.tsx'
import type { DataListItem } from '~/models/AdditionalDataSection.ts'
import If from '~/components/general/If'
import IconButton from '~/components/general/IconButton'
import clsx from 'clsx'

interface DataItemGalleryProps {
  list: DataListItem[]
  editable?: boolean
  onRemoveClick: (id: DataListItem['id']) => void
}

const DataItemGallery: FC<DataItemGalleryProps> = ({ list, editable, onRemoveClick }) => {
  const handleRemoveClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>, id: DataListItem['id']) => {
      event.stopPropagation()
      event.preventDefault()
      onRemoveClick(id)
    },
    [onRemoveClick],
  )
  return (
    <CardsGrid className={styles.gallery}>
      {list.map(item => (
        <ExternalLink href={item.url} key={item.id}>
          <img src={item.url} alt="gallery image" />
          <If condition={Boolean(item.name)}>
            <div className={clsx(styles.shadow, styles['shadow--bottom'])}>
              <span className={styles.name}>{item.name}</span>
            </div>
          </If>
          <If condition={editable}>
            <div className={clsx(styles.shadow, styles['shadow--top'])}>
              <IconButton
                iconName="cross.svg"
                size={25}
                onClick={e => handleRemoveClick(e, item.id)}
                className={styles.cross}
              />
            </div>
          </If>
        </ExternalLink>
      ))}
    </CardsGrid>
  )
}

export default DataItemGallery
