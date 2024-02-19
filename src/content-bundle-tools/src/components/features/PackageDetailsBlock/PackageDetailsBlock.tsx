import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { enqueueSnackbar } from 'notistack'
import styles from './PackageDetailsBlock.module.scss'
import type PackageDetails from '~/models/PackageDetails.ts'
import copyToClipboard from '~/utils/copyToClipboard.ts'
import Chip from '~/components/general/Chip'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'

interface PackageDetailsBlockProps {
  packageId: string
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ packageId }) => {
  const { setLoading } = useFullScreenLoading()
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [packageData, setPackageData] = useState<PackageDetails | null>(null)
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
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
  }, [bundlePackageService, setLoading])

  useEffect(() => {
    bundlePackageService?.getDataSegmentation().then(response => {
      setTags(response.tags)
    })
  }, [bundlePackageService])

  const handleCopyId = useCallback((value: string) => {
    copyToClipboard(value, () => {
      enqueueSnackbar('Copied to clipboard', {
        variant: 'success',
        preventDuplicate: false,
      })
    })
  }, [])

  if (packageData) {
    return (
      <DetailsBlock title={packageData.name} description={packageData.description} imgSrc={packageData.logoUrl}>
        <ul className={styles.details}>
          <li>
            Type:
            <Chip className={styles.submission} text={packageData.submission} />
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
        <div className={styles.tags}>
          {tags.map(tag => (
            <Chip key={tag} text={tag} color="blue" />
          ))}
        </div>
      </DetailsBlock>
    )
  }
}

export default PackageDetailsBlock
