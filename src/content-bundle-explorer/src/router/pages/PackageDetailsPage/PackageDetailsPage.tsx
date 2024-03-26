import styles from './PackageDetailsPage.module.scss'
import { type FC, useMemo } from 'react'
import CopyBtn from '~/components/general/CopyBtn'
import { Link, useParams } from 'react-router-dom'
import Button from '~/components/general/Button'
import { useServices } from '~/context/ServicesContext'
import { FullScreenLoader } from '~/components/general/Loaders'
import PackageDetailsBlock from '~/components/features/PackageDetailsBlock.tsx'
import BundlesList from '~/components/features/BundlesList'
import useError from '~/hooks/useError.ts'

const PackageDetailsPage: FC = () => {
  const { packageId = '' } = useParams()
  const { initBundlePackageService } = useServices()
  const throwError = useError()

  const service = useMemo(() => {
    try {
      return initBundlePackageService && initBundlePackageService(packageId)
    } catch (e) {
      throwError(e, 'Wrong package ID')
    }
  }, [initBundlePackageService, packageId, throwError])

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
      <BundlesList service={service} />
    </section>
  )
}

export default PackageDetailsPage
