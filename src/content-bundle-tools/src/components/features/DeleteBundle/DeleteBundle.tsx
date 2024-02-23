import { type FC, type MouseEventHandler, useCallback, useState } from 'react'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import Button from '~/components/general/Button'
import ModalDialog from '~/components/general/ModalDialog'
import styles from './DeleteBundle.module.scss'
import { enqueueSnackbar } from 'notistack'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'

interface DeleteBundleProps {
  service: BundlePackageService
  bundleId: string
  btnClassName?: string
  onSuccess?: () => void
}

const DeleteBundle: FC<DeleteBundleProps> = ({ service, bundleId, btnClassName, onSuccess }) => {
  const { loading, setLoading } = useFullScreenLoading()

  const [open, setOpen] = useState(false)

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
        onSuccess && onSuccess()
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
      .finally(() => setLoading(false))
  }, [bundleId, onClose, onSuccess, service, setLoading])

  return (
    <>
      <Button text="Remove empty bundle" variant="text" color="red" onClick={onOpen} className={btnClassName} />
      <ModalDialog {...{ open, onClose }} className={styles.dialog}>
        <h3 className={styles.title}>Please, confirm deletion of bundle with ID:</h3>
        <p className={styles.id}>{bundleId}</p>
        <div className={styles['btn-group']}>
          <Button text="Delete" onClick={onSubmit} />
          <Button text="Cancel" variant="text" onClick={onClose} />
        </div>
      </ModalDialog>
    </>
  )
}

export default DeleteBundle
