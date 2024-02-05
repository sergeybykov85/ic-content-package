import { useEffect, useState, type FC } from 'react'
import { getPackageByType, type Package, type PackageType } from '~/services/packageRegistry.ts'
import PackageCard from './PackageCard.tsx'
import styles from './Packages.module.scss'

interface PackagesProps {
  type: PackageType
}

const Packages: FC<PackagesProps> = ({ type }) => {
  const [packages, setPackages] = useState<Package[]>([])
  useEffect(() => {
    getPackageByType(type).then(res => {
      setPackages(res)
    })
  }, [])

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
