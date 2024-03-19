import { type FC, useEffect, useState } from 'react'
import type PackageWithOwner from '~/models/PackageWithOwner.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import type BundlePackageService from '~/services/BundlePackageService.ts'

interface PackageDetailsBlockProps {
  service: BundlePackageService
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ service }) => {
  const { setLoading } = useFullScreenLoading()

  const [packageData, setPackageData] = useState<PackageWithOwner | null>(null)
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    service
      .getPackageDetails()
      .then(data => setPackageData(data)) /* TODO: Add error boundary */
      .finally(() => setLoading(false))
  }, [service, setLoading])

  useEffect(() => {
    service.getDataSegmentation().then(response => {
      setTags(response.tags)
    })
  }, [service])

  if (packageData) {
    return <DetailsBlock data={{ ...packageData, tags }} />
  }
}

export default PackageDetailsBlock
