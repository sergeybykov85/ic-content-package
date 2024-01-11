import React, { type FC } from 'react'
import styles from 'components/layouts/MainLayout/MainLayout.module.scss'
import ExternalLink from 'components/general/ExternalLink'
import content from 'components/layouts/MainLayout/MainLayout.content.json'
import clsx from 'clsx'

const Footer: FC = () => (
  <footer className={styles.footer}>
    <div className={clsx(styles.container, styles['container--footer'])}>
      <div className={styles['footer__logo-and-copyright']}>
        <img src="/images/dcm-logo.svg" alt="Logo DCM" />
        <div>© {new Date().getFullYear()}, DCM Swiss</div>
      </div>
      <nav className={styles['footer__nav-links']}>
        <ExternalLink href={content.externalLinks.web3}>web3-experience.com</ExternalLink>
        <ExternalLink href={content.externalLinks.dcm}>dcm-swiss.com</ExternalLink>
      </nav>
      <div className={clsx(styles.divider, styles['divider--footer'])} />
      <nav className={styles['footer__nav-socials']}>
        <ExternalLink href={content.socialLinks.linkedIn}>
          <img src="/images/social-linked-in.svg" alt="LinkedIn logo" />
        </ExternalLink>
        <ExternalLink href={content.socialLinks.twitter}>
          <img src="/images/social-twitter.svg" alt="Twitter logo" />
        </ExternalLink>
      </nav>
    </div>
  </footer>
)

export default Footer
