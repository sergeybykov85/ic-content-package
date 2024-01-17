import { type FC } from 'react'
import styles from '~/components/layouts/MainLayout/MainLayout.module.scss'
import content from '~/components/layouts/MainLayout/MainLayout.content.json'
import { LoginButton } from '~/components/features/Login'

const Header: FC = () => (
  <header className={styles.header}>
    <div className={styles.container}>
      <img src="/images/dcm-logo.svg" alt="Logo DCM" />
      <div className={styles.divider} />
      <div className={styles['header__title']}>{content.headerTitle}</div>
      <LoginButton className={styles['header__button']} />
    </div>
  </header>
)

export default Header
