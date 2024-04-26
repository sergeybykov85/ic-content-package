import styles from './PackageControls.module.scss'
import { type FC, useCallback, useMemo } from 'react'
import Button from '~/components/general/Button'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import type PackageDetails from '~/models/PackageDetails.ts'
import If from '~/components/general/If'
import { enqueueSnackbar } from 'notistack'
import parseErrorMsg from '~/utils/parseErrorMsg.ts'
import { useServices } from '~/context/ServicesContext'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'

interface PackageControlsProps {
  packageData: PackageDetails
}

const PackageControls: FC<PackageControlsProps> = ({ packageData }) => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { setLoading } = useFullScreenLoading()
  const { packageService } = useServices()
  const { packageId = '' } = useParams()

  const dataToEdit = useMemo(() => {
    if (packageData) {
      const { name, description, logoUrl, submission } = packageData
      return { name, description, logoUrl, submission }
    }
    return null
  }, [packageData])

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true)
      await packageService?.removeEmptyPackage(packageData.id || packageId)
      setLoading(false)
      navigate(state?.backToListPath)
      enqueueSnackbar('Package successfully deleted', { variant: 'success' })
    } catch (error) {
      setLoading(false)
      console.error(error)
      enqueueSnackbar(`Failed to fetch data with error: ${parseErrorMsg(error)}`, { variant: 'error' })
    }
  }, [navigate, packageData.id, packageId, packageService, setLoading, state?.backToListPath])

  return (
    <div className={styles.container}>
      <Link to={`edit`} state={{ ...state, dataToEdit }}>
        <Button text="Edit package" variant="outlined" />
      </Link>
      <If condition={packageData.totalBundles === 0}>
        <Button
          text="Delete empty package"
          variant="outlined"
          color="red"
          className={styles.delete}
          onClick={handleDelete}
        />
      </If>
    </div>
  )
}

export default PackageControls
