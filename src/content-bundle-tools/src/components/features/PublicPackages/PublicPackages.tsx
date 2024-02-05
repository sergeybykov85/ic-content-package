import { useEffect, useState, type FC } from 'react'
import { getPackageByType, type Package } from '~/services/packageRegistry.ts'
import PackageCard from './PackageCard.tsx'
import styles from './PublicPackages.module.scss'

const PublicPackages: FC = () => {
  const [packages, setPackages] = useState<Package[]>([])
  useEffect(() => {
    getPackageByType('public').then(res => {
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

export default PublicPackages
