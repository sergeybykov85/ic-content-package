import type { RemoveBundleDataParams } from '~/types/bundleDataTypes.ts'
import { type FC, type ReactNode, useMemo } from 'react'
import ModalDialog from '~/components/general/ModalDialog'
import Button from '~/components/general/Button'
import styles from './RemoveBundleDataModal.module.scss'

interface RemoveBundleDataModalProps {
  data: RemoveBundleDataParams | null
  onCancel: () => void
  onSubmit: () => void
}

const RemoveBundleDataModal: FC<RemoveBundleDataModalProps> = ({ data, onCancel, onSubmit }) => {
  const message = useMemo<ReactNode>(() => {
    if (data?.resourceId && data?.category) {
      return (
        <>
          remove this item from <span>{data.category}</span>
        </>
      )
    }
    if (!data?.resourceId && data?.category) {
      return (
        <>
          remove <span>all</span> items from <span>{data.category}</span>
        </>
      )
    }
    if (data?.group) {
      return (
        <>
          remove all items from <span>{data.group}</span>
        </>
      )
    }
  }, [data?.resourceId, data?.category, data?.group])
  return (
    <ModalDialog open={Boolean(data)} onClose={onCancel}>
      <h3 className={styles.title}>Are you sure you want to {message}?</h3>
      <div className={styles['btn-group']}>
        <Button text="Delete" onClick={onSubmit} />
        <Button text="Cancel" variant="outlined" onClick={onCancel} />
      </div>
    </ModalDialog>
  )
}

export default RemoveBundleDataModal
