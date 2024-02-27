import { type FC, useCallback } from 'react'
import If from '~/components/general/If'
import styles from './Chip.module.scss'
import clsx from 'clsx'

interface ChipProps {
  className?: string
  text: string
  color?: 'black' | 'blue'
  withCross?: boolean
  onCrossClick?: (text: string) => void
}

const Chip: FC<ChipProps> = ({ text, className, color = 'black', withCross, onCrossClick }) => {
  const handleCrossClick = useCallback(() => {
    onCrossClick && onCrossClick(text)
  }, [onCrossClick, text])
  return (
    <span className={clsx(styles.chip, styles[`chip--${color}`], className)}>
      {text}
      <If condition={withCross}>
        <img src="/images/plus.svg" alt="cross" onClick={handleCrossClick} />
      </If>
    </span>
  )
}

export default Chip
