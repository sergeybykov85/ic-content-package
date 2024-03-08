import type { ChangeEvent, EventHandler, ComponentPropsWithoutRef, FC } from 'react'
import { type ReactNode, useCallback } from 'react'
import clsx from 'clsx'
import styles from './FileInput.module.scss'

export interface FileInputProps {
  children?: ReactNode
  className?: string
  accept?: ComponentPropsWithoutRef<'input'>['accept']
  onLoaded: (response: { file: File; readerResult?: FileReader['result'] }) => void
  getAs?: 'base64' | 'string'
}

const FileInput: FC<FileInputProps> = ({ children, className, accept, onLoaded, getAs }) => {
  const onChange = useCallback<EventHandler<ChangeEvent<HTMLInputElement>>>(
    ({ target }) => {
      if (!target.files?.length) {
        return
      }
      const file = target.files[0]
      if (getAs) {
        const reader = new FileReader()
        reader.onloadend = (): void => {
          onLoaded({ file, readerResult: reader.result })
        }
        switch (getAs) {
          case 'base64':
            reader.readAsDataURL(file)
            break
          case 'string':
            reader.readAsText(file)
            break
        }
      } else {
        onLoaded({ file })
      }
      target.value = '' // Clean input
    },
    [getAs, onLoaded],
  )
  return (
    <label htmlFor="file" className={clsx(className, styles.label)}>
      <input type="file" id="file" {...{ accept, onChange }} />
      {children}
    </label>
  )
}

export default FileInput
