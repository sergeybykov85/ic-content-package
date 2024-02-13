import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type { Package } from '~/models/Package.ts'
import { enqueueSnackbar } from 'notistack'
import styles from './PackageDetailsBlock.module.scss'

interface PackageDetailsBlockProps {
  packageId: string
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ packageId }) => {
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bundlePackageService
      ?.getPackageDetails(packageId)
      .then(data => setPackageData(data))
      .catch(error => {
        // console.log(JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))))
        console.log(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
      .finally(() => setLoading(false))
  }, [bundlePackageService, packageId])

  if (loading) {
    return <p>Skeleton</p>
  }

  if (packageData) {
    return (
      <div className={styles.container}>
        <div>
          <h3 className={styles.name}>{packageData.name}</h3>
          <p>{packageData.description}</p>
          <ul className={styles.details}>
            <li>
              <span>Type:</span>
              {packageData.submission}
            </li>
            <li>
              <span>Max. supply:</span>
              {packageData.maxSupply}
            </li>
            <li>
              <span>Created:</span>
              {packageData.created}
            </li>
          </ul>
        </div>
        <img className={styles.img} src={packageData.logoUrl || '/images/empty-image.svg'} alt="package image" />
      </div>
    )
  }
}

export default PackageDetailsBlock
