import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import copyToClipboard from '~/utils/copyToClipboard'
import styles from './Login.module.scss'
import Button from '~/components/general/Button'
import shortenPrincipal from '~/utils/shortenPrincipal.ts'

interface PrincipalBtnProps {
  principal: string
}

const PrincipalBtn: FC<PrincipalBtnProps> = ({ principal }) => {
  const [copied, setCopied] = useState(false)

  const shortPrincipal = useMemo(() => shortenPrincipal(principal), [principal])

  const handleCLick = useCallback((): void => {
    copyToClipboard(principal, () => {
      setCopied(true)
    })
  }, [principal])

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
    <Button className={styles.principal} onClick={handleCLick} variant="text">
      {shortPrincipal}
      <img src={!copied ? '/images/copy.svg' : '/images/green-mark.svg'} alt="copy icon" />
    </Button>
  )
}

export default PrincipalBtn
