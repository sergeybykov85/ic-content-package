import { type FC } from 'react'
import PackageCard from '~/components/general/PackagesGrid/PackageCard.tsx'
import { type Package } from '~/models/Package.ts'
import { Link } from 'react-router-dom'
import CardsGrid from '~/components/general/CardsGrid/CardsGrid.tsx'

interface PackagesProps {
  packages: Package[]
}

const PackagesGrid: FC<PackagesProps> = ({ packages }) => {
  // TODO: Skeleton while loading
  // TODO: Empty list
  return (
    <CardsGrid>
      {packages.map(item => (
        <Link to={`/package/${item.id}`} key={item.id} state={{ backToList: true }}>
          <PackageCard data={item} />
        </Link>
      ))}
    </CardsGrid>
  )
}

export default PackagesGrid
