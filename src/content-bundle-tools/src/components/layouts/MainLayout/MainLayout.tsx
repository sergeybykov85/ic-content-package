import type { FC, ReactNode } from 'react'
import styles from './MainLayout.module.scss'
import ExternalLink from 'components/general/ExternalLink'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => (
  <>
    <header className={styles.header}>
      <div className={styles.container}>
        <img src="/images/dcm-logo-with-text.svg" alt="Logo DCM" />
        <div className={styles.divider} />
        <div className={styles['header__title']}>Content Bundle Tool</div>
      </div>
    </header>
    <main className={styles.main}>{children}</main>
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles['container--footer']}`}>
        <div className={styles['footer__logo-and-copyright']}>
          <img src="/images/dcm-logo.svg" alt="Logo DCM" />
          <div>© {new Date().getFullYear()}, DCM Swiss</div>
        </div>
        <nav className={styles['footer__nav-links']}>
          <ExternalLink href="https://dcm-swiss.com/">
            dcm-swiss.com
          </ExternalLink>
          <ExternalLink href="https://web3-experience.com/">
            web3-experience.com
          </ExternalLink>
        </nav>
        <div className={styles['divider--footer']} />
        <nav className={styles['footer__nav-socials']}>
          <ExternalLink href="https://www.linkedin.com/company/dcm-swiss">
            <img src="/images/social-linked-in.svg" alt="LinkedIn logo" />
          </ExternalLink>
          <ExternalLink href="https://twitter.com/DCMSwiss">
            <img src="/images/social-twitter.svg" alt="Twitter logo" />
          </ExternalLink>
        </nav>
      </div>
    </footer>
  </>
)

export default MainLayout
