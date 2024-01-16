import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import copyToClipboard from 'utils/copyToClipboard'
import styles from './Login.module.scss'
import Button from 'components/general/Button'

interface PrincipalProps {
  principal: string
}

const Principal: FC<PrincipalProps> = ({ principal }) => {
  const [copied, setCopied] = useState(false)

  const shortPrincipal = useMemo(() => {
    return `${principal.slice(0, 5)}...${principal.slice(principal.length - 3)}`
  }, [principal])

  const handleCLick = useCallback((): void => {
    copyToClipboard(shortPrincipal, () => {
      setCopied(true)
    })
  }, [shortPrincipal])

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

export default Principal
