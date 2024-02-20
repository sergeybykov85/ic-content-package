import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { enqueueSnackbar } from 'notistack'
import type PackageDetails from '~/models/PackageDetails.ts'
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

  if (packageData) {
    return <DetailsBlock data={{ ...packageData, tags }} />
  }
}

export default PackageDetailsBlock
