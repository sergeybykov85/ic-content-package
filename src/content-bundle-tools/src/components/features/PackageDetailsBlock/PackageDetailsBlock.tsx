import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import type PackageDetails from '~/models/PackageDetails.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import If from '~/components/general/If'
import { useAuth } from '~/context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import Button from '~/components/general/Button'
import { PACKAGE_TYPES } from '~/types/packagesTypes.ts'
import { enqueueSnackbar } from 'notistack'
import parseErrorMsg from '~/utils/parseErrorMsg.ts'

interface PackageDetailsBlockProps {
  bundlePackageService: BundlePackageService
}

const PackageDetailsBlock: FC<PackageDetailsBlockProps> = ({ bundlePackageService }) => {
  const { setLoading } = useFullScreenLoading()
  const { state } = useLocation()
  const { principal } = useAuth()

  const [packageData, setPackageData] = useState<PackageDetails | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [contributors, setContributors] = useState<string[] | undefined>()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const data = await bundlePackageService.getPackageDetails()
      setPackageData(data)

      const { tags: fetchedTags } = await bundlePackageService.getDataSegmentation()
      setTags(fetchedTags)

      if (data.submission === PACKAGE_TYPES.Shared) {
        const fetchedContributors = await bundlePackageService.getContributors()
        setContributors(fetchedContributors)
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar(`Failed to fetch data with error: ${parseErrorMsg(error)}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [setLoading, bundlePackageService])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

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
        contributors={contributors}
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
