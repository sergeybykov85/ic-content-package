import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'

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

  if (bundleData) {
    return <DetailsBlock data={{ ...bundleData, description: bundleData.description || '' }} />
  }
}

export default BundleDetailsBlock
