import type { FC, ReactNode } from 'react'
import styles from './DataBlock.module.scss'

interface DataBlockProps {
  title: string
  children: ReactNode
}

const DataBlock: FC<DataBlockProps> = ({ title, children }) => (
  <div className={styles.container}>
    <h3 className={styles.title}>{title}</h3>
    <div className={styles.grid}>{children}</div>
  </div>
)

export default DataBlock
