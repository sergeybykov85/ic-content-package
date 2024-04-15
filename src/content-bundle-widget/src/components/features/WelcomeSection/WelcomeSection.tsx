import type { FC } from 'react'
import styles from './WelcomeSection.module.scss'
import { LoginButton } from '~/components/features/Login'

const WelcomeSection: FC = () => (
  <section className={styles.section}>
    <div>
      <h1 className={styles.title}>Content Bundle Widget</h1>
      <p className={styles['sub-title']}>Increase the engagement of your POI with bundle-widget.</p>
      <p className={styles['sub-title']}>Distribute your content in a few clicks!</p>
      <LoginButton text="Start creating" className={styles.btn} />
    </div>
    <img src="/images/bg.png" alt="" className={styles.img} />
  </section>
)

export default WelcomeSection
