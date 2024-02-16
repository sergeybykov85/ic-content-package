import type Bundle from '~/models/Bundle.ts'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import CardsGrid from '~/components/general/CardsGrid/CardsGrid.tsx'
import BundleCard from '~/components/general/BundlesGrid/BundleCard.tsx'

interface BundlesGridProps {
  bundles: Bundle[]
}

const BundlesGrid: FC<BundlesGridProps> = ({ bundles }) => {
  // TODO: Skeleton while loading
  // TODO: Empty list
  return (
    <CardsGrid>
      {bundles.map(item => (
        <Link to={`bundle/${item.id}`} key={item.id} state={{ backToList: true }}>
          <BundleCard data={item} />
        </Link>
      ))}
    </CardsGrid>
  )
}

export default BundlesGrid
