import { type FC, type MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import { enqueueSnackbar } from 'notistack'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import Button from '~/components/general/Button'
import ModalDialog from '~/components/general/ModalDialog'
import styles from './BundleControls.module.scss'
import If from '~/components/general/If'
import { Link, useLocation } from 'react-router-dom'
import type Bundle from '~/models/Bundle.ts'

interface BundleControlsProps {
  service: BundlePackageService
  bundleId: string
  bundle: Bundle
  onDeleteSuccess?: () => void
}

const BundleControls: FC<BundleControlsProps> = ({ service, bundleId, onDeleteSuccess, bundle }) => {
  const { loading, setLoading } = useFullScreenLoading()
  const { state } = useLocation()

  const [open, setOpen] = useState(false)
  const [isEmptyBundle, setIsEmptyBundle] = useState(false)

  useEffect(() => {
    service
      .getBundleDataGroups(bundleId)
      .then(response => {
        setIsEmptyBundle(!response.length)
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
  }, [service, bundleId])

  const onOpen = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
    event.stopPropagation()
    setOpen(true)
  }, [])

  const onClose = useCallback(() => {
    !loading && setOpen(false)
  }, [loading])

  const onSubmit = useCallback(() => {
    setLoading(true)
    service
      .deleteEmptyBundle(bundleId)
      .then(() => {
        onClose()
        onDeleteSuccess && onDeleteSuccess()
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
      .finally(() => setLoading(false))
  }, [bundleId, onClose, onDeleteSuccess, service, setLoading])

  const dataToEdit = useMemo(() => {
    const { name, description, logoUrl, classification, tags } = bundle
    return { name, description, logoUrl, classification, tags }
  }, [bundle])

  return (
    <div className={styles.controls}>
      <Link to="edit" state={{ ...state, dataToEdit }}>
        <Button text="Edit bundle" variant="outlined" />
      </Link>
      <If condition={isEmptyBundle}>
        <Button
          text="Remove empty bundle"
          variant="text"
          color="red"
          onClick={onOpen}
          className={styles['delete-btn']}
        />
        <ModalDialog {...{ open, onClose }} className={styles.dialog}>
          <h3 className={styles.title}>Please, confirm deletion of bundle with ID:</h3>
          <p className={styles.id}>{bundleId}</p>
          <div className={styles['btn-group']}>
            <Button text="Delete" onClick={onSubmit} />
            <Button text="Cancel" variant="text" onClick={onClose} />
          </div>
        </ModalDialog>
      </If>
    </div>
  )
}

export default BundleControls
