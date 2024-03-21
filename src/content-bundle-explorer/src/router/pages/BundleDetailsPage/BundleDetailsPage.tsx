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
import { ADDITIONAL_DATA_GROUPS } from '~/types/bundleDataTypes.ts'
import { enqueueSnackbar } from 'notistack'
import If from '~/components/general/If.tsx'
import AdditionalData from '~/components/features/AdditionalData'

const BundleDetailsPage: FC = () => {
  const { packageId = '', bundleId = '' } = useParams()
  const { initBundlePackageService } = useServices()
  const throwError = useError()

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [supportedDataGroups, setSupportedDataGroups] = useState<ADDITIONAL_DATA_GROUPS[]>([])

  const service = useMemo(() => initBundlePackageService?.(packageId), [initBundlePackageService, packageId])

  const getSupportedDataGroups = useCallback(() => {
    service
      ?.getBundleSupportedDataGroups()
      .then(response => {
        setSupportedDataGroups(response)
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
  }, [service])

  useEffect(() => {
    service
      ?.getBundle(bundleId)
      .then(response => {
        setBundle(response)
      })
      .catch(error => {
        throwError(error, 'Bundle with such ID unavailable or does not exist')
      })
  }, [service, bundleId, throwError])

  useEffect(() => {
    if (!supportedDataGroups.length) {
      getSupportedDataGroups()
    }
  }, [getSupportedDataGroups, supportedDataGroups.length])

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
      <If condition={supportedDataGroups.includes(ADDITIONAL_DATA_GROUPS.POI)}>
        <br />
        <AdditionalData
          title="Point of interest"
          group={ADDITIONAL_DATA_GROUPS.POI}
          {...{ bundleId, service, bundle }}
        />
      </If>
      <If condition={supportedDataGroups.includes(ADDITIONAL_DATA_GROUPS.Additions)}>
        <br />
        <AdditionalData
          title="Additional informartion"
          group={ADDITIONAL_DATA_GROUPS.Additions}
          {...{ bundleId, service, bundle }}
        />
      </If>
    </section>
  )
}

export default BundleDetailsPage
