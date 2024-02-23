import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import If from '~/components/general/If'
import { ADDITIONAL_DATA_TYPES } from '~/types/bundleTypes.ts'
import { Additions, Poi } from '~/components/features/AdditionalData'
import CopyBtn from '~/components/general/CopyBtn'
import styles from './BundleDetailsBlock.module.scss'

interface BundleDetailsBlockProps {
  packageId: string
  bundleId: string
}

const BundleDetailsBlock: FC<BundleDetailsBlockProps> = ({ bundleId, packageId }) => {
  const { setLoading } = useFullScreenLoading()
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [dataGroups, setDataGroups] = useState<ADDITIONAL_DATA_TYPES[]>([])

  useEffect(() => {
    setLoading(true)
    bundlePackageService
      ?.getBundle(bundleId)
      .then(response => {
        setBundle(response)
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
      .finally(() => setLoading(false))
  }, [bundleId, bundlePackageService, setLoading])

  useEffect(() => {
    if (!dataGroups.length) {
      bundlePackageService
        ?.getBundleDataGroups(bundleId)
        .then(response => setDataGroups(response))
        .catch(error => {
          console.error(error)
          enqueueSnackbar(error.message, {
            variant: 'error',
          })
        })
    }
  }, [bundlePackageService, dataGroups.length, bundleId])

  if (bundle) {
    return (
      <>
        <h3 className={styles['sub-title']}>
          Package ID: {packageId} <CopyBtn text={packageId} />
        </h3>
        <DetailsBlock data={{ ...bundle, description: bundle.description || '' }} />
        <If condition={dataGroups.includes(ADDITIONAL_DATA_TYPES.POI)}>
          <br />
          <Poi {...{ bundleId, packageId, bundle }} />
        </If>
        <If condition={dataGroups.includes(ADDITIONAL_DATA_TYPES.Additions)}>
          <br />
          <Additions {...{ bundleId, packageId, bundle }} />
        </If>
      </>
    )
  }
}

export default BundleDetailsBlock
