import type { FC, ReactNode } from 'react'
import styles from './CardsGrid.module.scss'

interface CardsGridProps {
  children: ReactNode
}

const CardsGrid: FC<CardsGridProps> = ({ children }) => <div className={styles.grid}>{children}</div>

export default CardsGrid
