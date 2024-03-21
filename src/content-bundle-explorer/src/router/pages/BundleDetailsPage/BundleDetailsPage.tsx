import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from '~/router/pages/PackageDetailsPage/PackageDetailsPage.module.scss'
import CopyBtn from '~/components/general/CopyBtn'
import Button from '~/components/general/Button'
import { useServices } from '~/context/ServicesContext'
import { FullScreenLoader } from '~/components/general/Loaders'
import type Bundle from '~/models/Bundle.ts'
import useError from '~/hooks/useError.ts'
import DetailsBlock from '~/components/general/DetailsBlock'

const BundleDetailsPage: FC = () => {
  const { packageId = '', bundleId = '' } = useParams()
  const { initBundlePackageService } = useServices()
  const throwError = useError()

  const [bundle, setBundle] = useState<Bundle | null>(null)

  const service = useMemo(() => initBundlePackageService?.(packageId), [initBundlePackageService, packageId])

  const getBundle = useCallback(() => {
    service
      ?.getBundle(bundleId)
      .then(response => {
        setBundle(response)
      })
      .catch(error => {
        throwError(error, 'Bundle with such ID unavailable or does not exist')
      })
  }, [bundleId, service, throwError])

  useEffect(() => {
    getBundle()
  }, [getBundle])

  if (!service || !bundle) {
    return <FullScreenLoader />
  }

  return (
    <section>
      <h1 className={styles.title}>
        Bundle ID: {bundleId} <CopyBtn text={bundleId} />
        <Link to={`/package/${packageId}`}>
          <Button variant="text" text="Back to package" />
        </Link>
      </h1>
      <DetailsBlock data={{ ...bundle, description: bundle.description || '' }} />
    </section>
  )
}

export default BundleDetailsPage
