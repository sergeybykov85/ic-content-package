import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import BundlesGrid from '~/components/general/BundlesGrid'
import styles from './BundlesList.module.scss'

interface BundlesListProps {
  packageId: string
}
const BundlesList: FC<BundlesListProps> = ({ packageId }) => {
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [bundlesList, setBundlesList] = useState<Bundle[]>([])

  useEffect(() => {
    bundlePackageService?.getBundlesPaginatedList(0, 10).then(({ pagination, items }) => {
      setBundlesList(items)
      console.log(pagination)
    })
  }, [bundlePackageService])

  return (
    <>
      <h2 className={styles.title}>Bundles</h2>
      <BundlesGrid bundles={bundlesList} />
    </>
  )
}

export default BundlesList
