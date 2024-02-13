import { type FC, useCallback, useState } from 'react'
import FileInput, { type FileInputProps } from '~/components/general/FileInput'
import styles from './ImageInput.module.scss'
import { enqueueSnackbar } from 'notistack'
import bytesToMb from '~/utils/bytesToMb.ts'
import clsx from 'clsx'

export type OnLoaded = (result: { src?: string; file: File }) => void

export interface ImageInputProps {
  src?: string
  onLoaded?: OnLoaded
  maxSize?: number // in bytes
  className?: string
}

const ImageInput: FC<ImageInputProps> = ({ src, onLoaded, maxSize, className }) => {
  const [imgSrc, setImgSrc] = useState(src)

  const onFileLoaded = useCallback<FileInputProps['onLoaded']>(
    (readerResult, file) => {
      if (maxSize && maxSize < file.size) {
        enqueueSnackbar(`Max file size is ${bytesToMb(maxSize)}`, { variant: 'warning' })
        return
      }
      if (typeof readerResult === 'string') {
        setImgSrc(readerResult)
        onLoaded && onLoaded({ src: readerResult, file })
      }
    },
    [maxSize, onLoaded],
  )

  return (
    <FileInput accept="image/*" getAs="base64" onLoaded={onFileLoaded} className={clsx(styles.container, className)}>
      <img src={imgSrc} alt="" />
      <div className={styles.overlay}>
        <p>Upload image</p>
      </div>
    </FileInput>
  )
}

export default ImageInput
