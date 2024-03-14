import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.tsx'
import Footer from './Footer.tsx'
import styles from './MainLayout.module.scss'
import Breadcrumbs from '~/components/general/Breadcrumbs'

const MainLayout: FC = () => (
  <div className={styles.wrapper}>
    <Header />
    <main className={styles.main}>
      <div className={styles.container}>
        <Breadcrumbs />
        <Outlet />
      </div>
    </main>
    <Footer />
  </div>
)

export default MainLayout
