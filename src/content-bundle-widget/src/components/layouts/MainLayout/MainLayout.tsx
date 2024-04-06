import type { FC, ReactNode } from 'react'
import styles from './MainLayout.module.scss'
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'

interface MainLayoutProps {
  children?: ReactNode
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => (
  <>
    <Header />
    <main className={styles.main}>
      <div className={styles.container}>{children || <Outlet />}</div>
    </main>
    <Footer />
  </>
)

export default MainLayout
