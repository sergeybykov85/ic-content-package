import type { FC } from 'react'
import styles from './WelcomeSection.module.scss'

const WelcomeSection: FC = () => (
  <section className={styles.section}>
    <h1 className={styles.title}>Distribute your content in a few clicks</h1>
    <img src="/images/bg.png" alt="" className={styles.img} />
  </section>
)

export default WelcomeSection
