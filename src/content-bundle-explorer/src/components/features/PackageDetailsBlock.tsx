import { type FC, useEffect, useState } from 'react'
import type PackageWithOwner from '~/models/PackageWithOwner.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import useError from '~/hooks/useError.ts'

interface PackageDetailsBlockProps {
  service: BundlePackageService
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ service }) => {
  const { setLoading } = useFullScreenLoading()
  const throwError = useError()

  const [packageData, setPackageData] = useState<PackageWithOwner | null>(null)
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    service
      .getPackageDetails()
      .then(data => setPackageData(data))
      .catch(error => {
        throwError(error, 'Package with such ID unavailable or does not exist')
      })
      .finally(() => setLoading(false))
  }, [service, setLoading, throwError])

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
