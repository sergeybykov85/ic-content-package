import type { FC } from 'react'
import styles from './WelcomeSection.module.scss'
import content from './WelcomeSection.content.json'

const WelcomeSection: FC = () => (
  <section className={styles.section} style={{ backgroundImage: `url('/images/world-map.png')` }}>
    <h1 className={styles.title}>{content.title}</h1>
    <p className={styles.description}>{content.description}</p>
  </section>
)

export default WelcomeSection
