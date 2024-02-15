import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { enqueueSnackbar } from 'notistack'
import styles from './PackageDetailsBlock.module.scss'
import type PackageDetails from '~/models/PackageDetails.ts'
import copyToClipboard from '~/utils/copyToClipboard.ts'

interface PackageDetailsBlockProps {
  packageId: string
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ packageId }) => {
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  useEffect(() => {
    void bundlePackageService?.getBundlesList()
  }, [bundlePackageService])

  const [packageData, setPackageData] = useState<PackageDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bundlePackageService
      ?.getPackageDetails()
      .then(data => setPackageData(data))
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
      .finally(() => setLoading(false))
  }, [bundlePackageService])

  const handleCopyId = useCallback((value: string) => {
    copyToClipboard(value, () => {
      enqueueSnackbar('Copied to clipboard', {
        variant: 'success',
        preventDuplicate: false,
      })
    })
  }, [])

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
              Type:
              <span className={styles.submission}>{packageData.submission}</span>
            </li>
            <li>
              Created:
              <span>{packageData.created}</span>
            </li>
            <li>
              Creator:
              <span className={styles['clickable-id']} onClick={() => handleCopyId(packageData.creator)}>
                {packageData.creator}
              </span>
            </li>
            <li>
              Owner:
              <span className={styles['clickable-id']} onClick={() => handleCopyId(packageData.owner)}>
                {packageData.owner}
              </span>
            </li>
            <li>
              Supply:
              <span>
                {packageData.totalBundles} / {packageData.maxSupply}
              </span>
            </li>
          </ul>
        </div>
        <img className={styles.img} src={packageData.logoUrl || '/images/empty-image.svg'} alt="package image" />
      </div>
    )
  }
}

export default PackageDetailsBlock
