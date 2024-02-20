import { FC } from 'react'
import styles from './PoiItemGallery.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import CardsGrid from '~/components/general/CardsGrid/CardsGrid.tsx'

const PoiItemGallery: FC<{ list: DataListItem[] }> = ({ list }) => (
  <CardsGrid className={styles.gallery}>
    {list.map(item => (
      <ExternalLink href={item.url}>
        <img src={item.url} alt="gallery image" key={item.id} />
      </ExternalLink>
    ))}
  </CardsGrid>
)

export default PoiItemGallery
