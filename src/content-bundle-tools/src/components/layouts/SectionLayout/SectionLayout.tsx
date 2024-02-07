import type { FC, ReactNode } from 'react'
import If from '~/components/general/If'
import MainLayout from '~/components/layouts/MainLayout'
import styles from './SectionLayout.module.scss'

interface SectionLayoutProps {
  title: string
  rightElement?: ReactNode
  children: ReactNode
}

const SectionLayout: FC<SectionLayoutProps> = ({ title, rightElement, children }) => (
  <MainLayout>
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <If condition={Boolean(rightElement)}>{rightElement}</If>
      </div>
      {children}
    </section>
  </MainLayout>
)

export default SectionLayout
