import styles from './PackageDetailsPage.module.scss'
import { type FC, useMemo } from 'react'
import CopyBtn from '~/components/general/CopyBtn'
import { Link, useParams } from 'react-router-dom'
import Button from '~/components/general/Button'
import { useServices } from '~/context/ServicesContext'
import { FullScreenLoader } from '~/components/general/Loaders'
import PackageDetailsBlock from '~/components/features/PackageDetailsBlock.tsx'

const PackageDetailsPage: FC = () => {
  const { packageId = '' } = useParams()
  const { initBundlePackageService } = useServices()

  const service = useMemo(() => {
    try {
      return initBundlePackageService && initBundlePackageService(packageId)
    } catch (e) {
      console.info('ERROR: ', e)
      throw Error('Wrong package ID')
    }
  }, [initBundlePackageService, packageId])

  if (!service) {
    return <FullScreenLoader />
  }

  return (
    <section>
      <h1 className={styles.title}>
        Package ID: {packageId} <CopyBtn text={packageId} />
        <Link to="/">
          <Button variant="text" text="Back to home" />
        </Link>
      </h1>
      <PackageDetailsBlock service={service} />
    </section>
  )
}

export default PackageDetailsPage
