import type { FC, ReactNode } from 'react'
import styles from './WidgetLayout.module.scss'
import { Outlet } from 'react-router-dom'
import FullScreenModalProvider from '~/context/FullScreenModalContext'

const WidgetLayout: FC<{ children?: ReactNode }> = ({ children }) => (
  <FullScreenModalProvider className={styles.layout}>{children || <Outlet />}</FullScreenModalProvider>
)

export default WidgetLayout
