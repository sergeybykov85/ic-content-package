import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import If from '~/components/general/If'
import { DATA_GROUPS } from '~/types/bundleTypes.ts'
import Poi from '~/components/features/Poi'

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

  const [bundleData, setBundleData] = useState<Bundle | null>(null)
  const [dataGroups, setDataGroups] = useState<DATA_GROUPS[]>([])

  useEffect(() => {
    setLoading(true)
    bundlePackageService
      ?.getBundle(bundleId)
      .then(response => {
        setBundleData(response)
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

  if (bundleData) {
    return (
      <>
        <DetailsBlock data={{ ...bundleData, description: bundleData.description || '' }} />
        <If condition={dataGroups.includes(DATA_GROUPS.POI)}>
          <br />
          <Poi {...{ bundleId, packageId }} />
        </If>
      </>
    )
  }
}

export default BundleDetailsBlock
