import { type FC } from 'react'
import styles from './PoiItemGallery.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import CardsGrid from '~/components/general/CardsGrid/CardsGrid.tsx'
import type { DataListItem } from '~/models/PoiSection.ts'

const PoiItemGallery: FC<{ list: DataListItem[] }> = ({ list }) => (
  <CardsGrid className={styles.gallery}>
    {list.map(item => (
      <ExternalLink href={item.url} key={item.id}>
        <img src={item.url} alt="gallery image" />
      </ExternalLink>
    ))}
  </CardsGrid>
)

export default PoiItemGallery
