import { type FC, useEffect, useMemo, useState } from 'react'
import type PackageDetails from '~/models/PackageDetails.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import If from '~/components/general/If'
import { useAuth } from '~/context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import Button from '~/components/general/Button'

interface PackageDetailsBlockProps {
  bundlePackageService: BundlePackageService
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ bundlePackageService }) => {
  const { setLoading } = useFullScreenLoading()
  const { state } = useLocation()
  const { principal } = useAuth()

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

  const bundleEditable = useMemo(() => packageData?.owner === principal, [packageData?.owner, principal])

  const dataToEdit = useMemo(() => {
    if (packageData) {
      const { name, description, logoUrl, submission } = packageData
      return { name, description, logoUrl, submission }
    }
    return null
  }, [packageData])

  if (packageData) {
    return (
      <DetailsBlock
        data={{ ...packageData, tags }}
        footer={
          <If condition={bundleEditable}>
            <Link to={`edit`} state={{ ...state, dataToEdit }}>
              <Button text="Edit package" variant="outlined" />
            </Link>
          </If>
        }
      />
    )
  }
}

export default PackageDetailsBlock
