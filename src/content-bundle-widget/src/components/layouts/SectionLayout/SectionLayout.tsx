import type { FC, ReactNode } from 'react'
import If from '~/components/general/If'
import styles from './SectionLayout.module.scss'

interface SectionLayoutProps {
  title: string | ReactNode
  rightElement?: ReactNode
  children: ReactNode
}

const SectionLayout: FC<SectionLayoutProps> = ({ title, rightElement, children }) => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <If condition={Boolean(rightElement)}>{rightElement}</If>
    </div>
    {children}
  </section>
)

export default SectionLayout
