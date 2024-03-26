import { type FC, useCallback } from 'react'
import styles from './EmptyBlock.module.scss'
import clsx from 'clsx'

interface EmptyBlockProps {
  variant: 'idle' | 'not-found'
  className?: string
}

const EmptyBlock: FC<EmptyBlockProps> = ({ variant, className }) => {
  const render = useCallback(() => {
    switch (variant) {
      case 'idle':
        return (
          <>
            <img src="/images/loupe.svg" alt="search" />
            <p>Use filters to find packages...</p>
          </>
        )
      case 'not-found':
        return (
          <>
            <img src="/images/nothing-found.svg" alt="nothing found" />
            <p>Sorry, nothing found, try changing the filters...</p>
          </>
        )
    }
  }, [variant])

  return <div className={clsx(styles.empty, className)}>{render()}</div>
}

export default EmptyBlock
