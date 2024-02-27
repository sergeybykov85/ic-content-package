import { type FC } from 'react'
import styles from './DataItemGallery.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import CardsGrid from '~/components/general/CardsGrid/CardsGrid.tsx'
import type { DataListItem } from '~/models/AdditionalDataSection.ts'
import If from '~/components/general/If'

const DataItemGallery: FC<{ list: DataListItem[] }> = ({ list }) => (
  <CardsGrid className={styles.gallery}>
    {list.map(item => (
      <ExternalLink href={item.url} key={item.id}>
        <img src={item.url} alt="gallery image" />
        <If condition={Boolean(item.name)}>
          <div className={styles.name}>{item.name}</div>
        </If>
      </ExternalLink>
    ))}
  </CardsGrid>
)

export default DataItemGallery
