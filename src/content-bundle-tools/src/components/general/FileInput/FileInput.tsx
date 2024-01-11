import React, {
  ChangeEvent,
  type ComponentPropsWithoutRef,
  EventHandler,
  type FC,
  type ReactNode,
  useCallback,
} from 'react'
import clsx from 'clsx'
import styles from './FileInput.module.scss'

interface FileInputProps {
  children?: ReactNode
  className?: string
  accept?: ComponentPropsWithoutRef<'input'>['accept']
  onLoaded: (readerResult: FileReader['result']) => void
}

const FileInput: FC<FileInputProps> = ({ children, className, accept, onLoaded }) => {
  const onChange = useCallback<EventHandler<ChangeEvent<HTMLInputElement>>>(({ target }) => {
    if (!target.files?.length) {
      return
    }
    const file = target.files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      onLoaded(reader.result)
    }
  }, [])
  return (
    <label htmlFor="file" className={clsx(className, styles.label)}>
      <input type="file" id="file" {...{ accept, onChange }} />
      {children}
    </label>
  )
}

export default FileInput
