import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { TextArea } from '~/components/general/Inputs'
import styles from './WidgetEmbedCode.module.scss'
import Button from '~/components/general/Button'
import copyToClipboard from '~/utils/copyToClipboard.ts'
import { enqueueSnackbar } from 'notistack'

interface WidgetEmbedCodeProps {
  widgetId: string
}

const WidgetEmbedCode: FC<WidgetEmbedCodeProps> = ({ widgetId }) => {
  const [copied, setCopied] = useState(false)

  const value = useMemo(
    () => `<div
  data-type="content-bundle-widget"
  data-widget-id="${widgetId}"
></div>
<script src="${location.origin}/widget-constructor.js"></script>`,
    [widgetId],
  )

  const handleCopy = useCallback(() => {
    copyToClipboard(value, () => {
      setCopied(true)
      enqueueSnackbar('Copied to clipboard', {
        variant: 'success',
      })
    })
  }, [value])

  useEffect(() => {
    let timeoutId: number
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
    <div className={styles.container}>
      <TextArea value={value} readOnly rows={7} className={styles.textarea} />
      <Button
        text={copied ? 'Copied!' : 'Copy to clipboard'}
        variant="text"
        className={styles.btn}
        onClick={handleCopy}
      />
    </div>
  )
}

export default WidgetEmbedCode
