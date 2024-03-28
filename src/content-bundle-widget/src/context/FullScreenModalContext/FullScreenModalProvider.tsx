import { type FC, type ReactNode, useEffect, useState } from 'react'
import { FullScreenModalContext } from '~/context/FullScreenModalContext/index.ts'
import clsx from 'clsx'
import styles from './FullScreenModalProvider.module.scss'
import IconButton from '~/components/general/IconButton'

interface FullScreenModalProviderProps {
  className?: string
  children: ReactNode
}

const FullScreenModalProvider: FC<FullScreenModalProviderProps> = ({ children, className }) => {
  const [content, setContent] = useState<ReactNode>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (content) {
      setOpen(true)
    }
  }, [content])

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setContent(null)
      }, 300)
    }
  }, [open])

  return (
    <FullScreenModalContext.Provider value={{ setContent }}>
      <div className={clsx(styles.container, className)}>
        {children}
        <div className={clsx(styles.dialog, open && styles['dialog--opened'])}>{content}</div>
        <IconButton
          iconName="cross.svg"
          className={clsx(styles.cross, open && styles['cross--opened'])}
          size={25}
          onClick={() => setOpen(false)}
        />
      </div>
    </FullScreenModalContext.Provider>
  )
}

export default FullScreenModalProvider
