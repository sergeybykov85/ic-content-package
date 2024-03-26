import { type FC, type MouseEventHandler, useCallback } from 'react'
import styles from './Chip.module.scss'
import clsx from 'clsx'
import If from '~/components/general/If.tsx'

export interface ChipProps {
  className?: string
  text: string
  color?: 'black' | 'blue'
  onClick?: (value: string) => void
  withCross?: boolean
  onCrossClick?: (text: string) => void
}

const Chip: FC<ChipProps> = ({ text, className, color = 'black', onClick, withCross, onCrossClick }) => {
  const handleClick = useCallback(() => {
    onClick && onClick(text)
  }, [onClick, text])

  const handleCrossClick = useCallback<MouseEventHandler<HTMLImageElement>>(
    e => {
      e.stopPropagation()
      onCrossClick && onCrossClick(text)
    },
    [onCrossClick, text],
  )

  return (
    <span
      className={clsx(styles.chip, styles[`chip--${color}`], onClick && styles.clickable, className)}
      onClick={handleClick}
    >
      {text}
      <If condition={withCross}>
        <img src="/images/plus.svg" alt="cross" onClick={handleCrossClick} />
      </If>
    </span>
  )
}

export default Chip
