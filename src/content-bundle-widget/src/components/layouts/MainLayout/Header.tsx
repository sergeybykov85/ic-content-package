import { type FC } from 'react'
import styles from '~/components/layouts/MainLayout/MainLayout.module.scss'
import content from '~/components/layouts/MainLayout/MainLayout.content.json'
import { LoginButton } from '~/components/features/Login'
import clsx from 'clsx'
import TopNav from './TopNav'
import { useAuth } from '~/context/AuthContext'
import If from '~/components/general/If'

const Header: FC = () => {
  const { isAuthenticated } = useAuth()
  return (
    <header className={styles.header}>
      <div className={clsx(styles.container, styles['container--header'])}>
        <img src="/images/dcm-logo.svg" alt="Logo DCM" />
        <div className={styles.divider} />
        <div className={styles['header__title']}>{content.headerTitle}</div>
        <If condition={isAuthenticated}>
          <div className={styles.divider} />
          <TopNav />
        </If>
        <LoginButton className={styles['header__button']} />
      </div>
    </header>
  )
}

export default Header
