import type { ChangeEvent, EventHandler, ComponentPropsWithoutRef, FC } from 'react'
import React, { type ReactNode, useCallback } from 'react'
import clsx from 'clsx'
import styles from './FileInput.module.scss'

export interface FileInputProps {
  children?: ReactNode
  className?: string
  accept?: ComponentPropsWithoutRef<'input'>['accept']
  onLoaded: (readerResult: FileReader['result'], file: File) => void
  getAs: 'base64' | 'string'
}

const FileInput: FC<FileInputProps> = ({ children, className, accept, onLoaded, getAs }) => {
  const onChange = useCallback<EventHandler<ChangeEvent<HTMLInputElement>>>(
    ({ target }) => {
      if (!target.files?.length) {
        return
      }
      const file = target.files[0]
      const reader = new FileReader()
      reader.onloadend = (): void => {
        onLoaded(reader.result, file)
      }
      switch (getAs) {
        case 'base64':
          reader.readAsDataURL(file)
          break
        case 'string':
          reader.readAsText(file)
          break
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
