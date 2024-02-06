import { FC, ReactNode } from 'react'
import If from '~/components/general/If'
import { Link } from 'react-router-dom'
import MainLayout from '~/components/layouts/MainLayout'
import styles from './SectionLayout.module.scss'
import Button from '~/components/general/Button'

interface SectionLayoutProps {
  title: string
  button?: {
    text: string
    link: string
  }
  children: ReactNode
}

const SectionLayout: FC<SectionLayoutProps> = ({ title, button, children }) => (
  <MainLayout>
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <If condition={Boolean(button)}>
          <Link to={button?.link || ''}>
            <Button>{button?.text}</Button>
          </Link>
        </If>
      </div>
      {children}
    </section>
  </MainLayout>
)

export default SectionLayout
