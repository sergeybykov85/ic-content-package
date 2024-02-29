import { type FC, type MouseEventHandler, useCallback, useState } from 'react'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import { enqueueSnackbar } from 'notistack'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import Button from '~/components/general/Button'
import ModalDialog from '~/components/general/ModalDialog'
import styles from './BundleControls.module.scss'
import If from '~/components/general/If'

interface BundleControlsProps {
  service: BundlePackageService
  bundleId: string
  btnClassName?: string
  onDeleteSuccess?: () => void
  isEmptyBundle: boolean
}

const BundleControls: FC<BundleControlsProps> = ({
  service,
  bundleId,
  btnClassName,
  onDeleteSuccess,
  isEmptyBundle,
}) => {
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

  return (
    <div>
      <If condition={isEmptyBundle}>
        <Button text="Remove empty bundle" variant="text" color="red" onClick={onOpen} className={btnClassName} />
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
