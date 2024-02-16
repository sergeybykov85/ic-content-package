import type { FC } from 'react'
import styles from './Chip.module.scss'
import clsx from 'clsx'
interface ChipProps {
  className?: string
  text?: string
  color?: 'black' | 'blue'
}

const Chip: FC<ChipProps> = ({ text, className, color = 'black' }) => (
  <span className={clsx(styles.chip, styles[`chip--${color}`], className)}>{text}</span>
)

export default Chip
