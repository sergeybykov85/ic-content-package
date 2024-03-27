import type { FC, ReactNode } from 'react'
import styles from './WidgetLayout.module.scss'
import { Outlet } from 'react-router-dom'

const WidgetLayout: FC<{ children?: ReactNode }> = ({ children }) => (
  <div className={styles.layout}>{children || <Outlet />}</div>
)

export default WidgetLayout
