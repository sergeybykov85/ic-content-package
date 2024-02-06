import { type FC } from 'react'
import PackageCard from './PackageCard.tsx'
import styles from './Packages.module.scss'
import { Package, PackageType } from '~/types/packagesTypes.ts'

interface PackagesProps {
  type: PackageType
}

const Packages: FC<PackagesProps> = () => {
  const packages: Package[] = []
  // TODO: Skeleton while loading
  // TODO: Empty list
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {packages.map(item => (
          <PackageCard data={item} key={item.id} />
        ))}
      </div>
    </section>
  )
}

export default Packages
