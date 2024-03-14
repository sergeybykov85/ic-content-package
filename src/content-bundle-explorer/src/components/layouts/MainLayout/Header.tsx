import { type FC } from 'react'
import clsx from 'clsx'
import styles from './MainLayout.module.scss'
import content from './MainLayout.content.json'
import { Link } from 'react-router-dom'

const Header: FC = () => (
  <header className={styles.header}>
    <div className={clsx(styles.container, styles['container--header'])}>
      <Link to="/">
        <img src="/images/dcm-logo.svg" alt="Logo DCM" />
      </Link>
      <div className={styles.divider} />
      <div className={styles['header__title']}>{content.headerTitle}</div>
    </div>
  </header>
)

export default Header
