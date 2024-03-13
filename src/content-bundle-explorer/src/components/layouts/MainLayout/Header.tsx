import { type FC } from 'react'
import clsx from 'clsx'
import styles from './MainLayout.module.scss'
import content from './MainLayout.content.json'

const Header: FC = () => (
  <header className={styles.header}>
    <div className={clsx(styles.container, styles['container--header'])}>
      <img src="/images/dcm-logo.svg" alt="Logo DCM" />
      <div className={styles.divider} />
      <div className={styles['header__title']}>{content.headerTitle}</div>
    </div>
  </header>
)

export default Header
