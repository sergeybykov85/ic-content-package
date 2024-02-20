import type { FC, ReactNode } from 'react'
import styles from './CardsGrid.module.scss'
import clsx from 'clsx'

interface CardsGridProps {
  children: ReactNode
  className?: string
}

const CardsGrid: FC<CardsGridProps> = ({ children, className }) => (
  <div className={clsx(styles.grid, className)}>{children}</div>
)

export default CardsGrid
