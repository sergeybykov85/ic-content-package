import type { FC } from 'react'
import { LoginButton } from '~/components/features/Login'
import styles from './WelcomeSection.module.scss'
import content from './WelcomeSection.content.json'

const WelcomeSection: FC = () => (
  <section className={styles.section}>
    <div>
      <h1 className={styles.title}>{content.title}</h1>
      <p className={styles.description}>{content.description}</p>
      <ul className={styles.items}>
        {content.items.map((item, idx) => (
          <li key={idx}><img src={`/images/welcome-item-${idx+1}.svg`} alt="" />{item}</li>
        ))}
      </ul>
      <LoginButton text="Start creating" className={styles.btn} />
    </div>
    <img src="/images/welcome-bg.png" alt="" className={styles.img}/>
  </section>
)

export default WelcomeSection
