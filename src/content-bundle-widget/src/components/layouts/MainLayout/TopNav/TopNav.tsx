import { type FC, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './TopNav.module.scss'
import clsx from 'clsx'

interface Nav {
  label: string
  link: string
}

const TopNav: FC = () => {
  const { pathname } = useLocation()
  const navs = useMemo<Nav[]>(
    () => [
      {
        label: 'My content',
        link: '/my-packages',
      },
      {
        label: 'Warehouse',
        link: '/warehouse',
      },
    ],
    [],
  )

  const isActive = useCallback((link: string) => pathname.includes(link), [pathname])

  return (
    <nav className={styles.nav}>
      {navs.map((item, idx) => (
        <Link to={item.link} key={idx} className={clsx(isActive(item.link) && styles.active)}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export default TopNav
