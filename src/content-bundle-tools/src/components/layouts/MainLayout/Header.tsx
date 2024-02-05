import { type FC } from 'react'
import styles from '~/components/layouts/MainLayout/MainLayout.module.scss'
import content from '~/components/layouts/MainLayout/MainLayout.content.json'
import { LoginButton } from '~/components/features/Login'
import clsx from 'clsx'

const Header: FC = () => (
  <header className={styles.header}>
    <div className={clsx(styles.container, styles['container--header'])}>
      <img src="/images/dcm-logo.svg" alt="Logo DCM" />
      <div className={styles.divider} />
      <div className={styles['header__title']}>{content.headerTitle}</div>
      <LoginButton className={styles['header__button']} />
    </div>
  </header>
)

export default Header
