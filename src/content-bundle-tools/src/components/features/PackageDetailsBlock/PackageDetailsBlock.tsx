import { FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { Package } from '~/models/Package.ts'
import { enqueueSnackbar } from 'notistack'
import styles from './PackageDetailsBlock.module.scss'

interface PackageDetailsBlockProps {
  packageId: string
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ packageId }) => {
  const { packageRegistry } = useServices()
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    packageRegistry
      ?.getPackageById(packageId)
      .then(data => setPackageData(data))
      .catch(error => {
        enqueueSnackbar(error.message, {
          variant: error,
        })
      })
      .finally(() => setLoading(false))
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
              <span>Type:</span>
              {packageData.submission}
            </li>
            <li>
              <span>Max. supply:</span>
              {packageData.max_supply}
            </li>
            <li>
              <span>Created:</span>
              {packageData.created}
            </li>
            <li>
              <span>Registered:</span>
              {packageData.registered}
            </li>
          </ul>
        </div>
        <img className={styles.img} src={packageData.logo_url || '/images/empty-image.svg'} alt="package image" />
      </div>
    )
  }
}

export default PackageDetailsBlock
