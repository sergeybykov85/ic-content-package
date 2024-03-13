import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.tsx'
import Footer from './Footer.tsx'
import styles from './MainLayout.module.scss'

const MainLayout: FC = () => (
  <>
    <Header />
    <main className={styles.main}>
      <div className={styles.container}>
        <Outlet />
      </div>
    </main>
    <Footer />
  </>
)

export default MainLayout
