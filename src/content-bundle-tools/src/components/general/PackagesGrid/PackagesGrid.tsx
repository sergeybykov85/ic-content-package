import { type FC } from 'react'
import PackageCard from '~/components/general/PackagesGrid/PackageCard.tsx'
import styles from '~/components/general/PackagesGrid/PackagesGrid.module.scss'
import { type Package } from '~/models/Package.ts'
import { Link } from 'react-router-dom'

interface PackagesProps {
  packages: Package[]
}

const PackagesGrid: FC<PackagesProps> = ({ packages }) => {
  // TODO: Skeleton while loading
  // TODO: Empty list
  return (
    <div className={styles.grid}>
      {packages.map(item => (
        <Link to={`/package/${item.id}`} key={item.id}>
          <PackageCard data={item} />
        </Link>
      ))}
    </div>
  )
}

export default PackagesGrid
