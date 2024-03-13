import { type FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type { Package } from '~/models/Package.ts'
import CardsGrid from '~/components/general/CardsGrid'
import Card from '~/components/general/Card'
import styles from './RecentPackages.module.scss'

const RecentPackages: FC = () => {
  const { packageRegistryService } = useServices()

  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    packageRegistryService.getRecentPackages(4).then(packages => setPackages(packages))
  }, [packageRegistryService])

  return (
    <section>
      <h2 className={styles.title}>Recent Packages</h2>
      <CardsGrid>
        {packages.map(item => (
          <Card
            key={item.id}
            data={{
              title: item.name,
              logoUrl: item.logoUrl,
              label: item.submission,
              created: item.created,
              creator: item.creator,
            }}
          />
        ))}
      </CardsGrid>
    </section>
  )
}

export default RecentPackages
