import { type FC } from 'react'
import PackageCard from '~/components/general/PackagesGrid/PackageCard.tsx'
import styles from '~/components/general/PackagesGrid/PackagesGrid.module.scss'
import type { Package } from '~/types/packagesTypes.ts'

interface PackagesProps {
  packages: Package[]
}

const PackagesGrid: FC<PackagesProps> = ({ packages }) => {
  // TODO: Skeleton while loading
  // TODO: Empty list
  return (
    <div className={styles.grid}>
      {packages.map(item => (
        <PackageCard data={item} key={item.id} />
      ))}
    </div>
  )
}

export default PackagesGrid
