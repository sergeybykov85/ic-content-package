import { type FC, useCallback, useEffect, useState } from 'react'
import copyToClipboard from '~/utils/copyToClipboard.ts'
import clsx from 'clsx'
import styles from './CopyBtn.module.scss'

interface CopyBtnProps {
  text: string
  className?: string
}

const CopyBtn: FC<CopyBtnProps> = ({ text, className }) => {
  const [copied, setCopied] = useState(false)

  const handleCLick = useCallback((): void => {
    copyToClipboard(text, () => {
      setCopied(true)
    })
  }, [text])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (copied) {
      timeoutId = setTimeout(() => {
        setCopied(false)
      }, 3000)
    }
    return () => {
      clearTimeout(timeoutId)
    }
  }, [copied])
  return (
    <button className={clsx(styles.btn, className)} onClick={handleCLick}>
      <img src={!copied ? '/images/copy.svg' : '/images/green-mark.svg'} alt="copy icon" />
    </button>
  )
}

export default CopyBtn
