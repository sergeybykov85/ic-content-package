import type { FC } from 'react'
import styles from './LogInSection.module.scss'
import content from './LogInSection.content.json'

const LogInSection: FC = () => (
  <section
    className={styles.section}
    style={{ backgroundImage: `url('/images/world-map.png')` }}
  >
    <h1 className={styles.title}>{content.title}</h1>
    <p className={styles.description}>{content.description}</p>
  </section>
)

export default LogInSection
