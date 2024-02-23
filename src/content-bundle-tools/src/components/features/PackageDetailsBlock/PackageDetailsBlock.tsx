import { type FC, useEffect, useState } from 'react'
import type PackageDetails from '~/models/PackageDetails.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import type BundlePackageService from '~/services/BundlePackageService.ts'

interface PackageDetailsBlockProps {
  bundlePackageService: BundlePackageService
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ bundlePackageService }) => {
  const { setLoading } = useFullScreenLoading()

  const [packageData, setPackageData] = useState<PackageDetails | null>(null)
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    bundlePackageService
      .getPackageDetails()
      .then(data => setPackageData(data))
      .finally(() => setLoading(false))
  }, [bundlePackageService, setLoading])

  useEffect(() => {
    bundlePackageService.getDataSegmentation().then(response => {
      setTags(response.tags)
    })
  }, [bundlePackageService])

  if (packageData) {
    return <DetailsBlock data={{ ...packageData, tags }} />
  }
}

export default PackageDetailsBlock
