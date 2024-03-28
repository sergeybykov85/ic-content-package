import type { FC, ReactNode } from 'react'
import styles from './BundleDataLayout.module.scss'

interface BundleDataLayoutProps {
  title: string
  children: ReactNode
}
const BundleDataLayout: FC<BundleDataLayoutProps> = ({ title, children }) => (
  <>
    <h2 className={styles.title}>{title}</h2>
    {children}
  </>
)

export default BundleDataLayout
