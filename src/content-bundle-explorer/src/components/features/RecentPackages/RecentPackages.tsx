import { type FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type { Package } from '~/models/Package.ts'
import styles from './RecentPackages.module.scss'
import PackageGrid from '~/components/general/PackageGrid'

const RecentPackages: FC = () => {
  const { packageRegistryService } = useServices()

  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    packageRegistryService.getRecentPackages(4).then(packages => setPackages(packages))
  }, [packageRegistryService])

  return (
    <section>
      <h2 className={styles.title}>Recent Packages</h2>
      <PackageGrid packages={packages} />
    </section>
  )
}

export default RecentPackages
