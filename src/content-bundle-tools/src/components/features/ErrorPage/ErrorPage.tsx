import type { FC } from 'react'
import MainLayout from '~/components/layouts/MainLayout'
import Button from '~/components/general/Button'
import { Link } from 'react-router-dom'
import styles from './ErrorPage.module.scss'

const ErrorPage: FC = () => (
  <MainLayout>
    <div className={styles.container}>
      <h1 className={styles.title}>4 0 4</h1>
      <h2 className={styles['sub-title']}>Sorry, this page does not exist</h2>
      <Link to="/">
        <Button text="Back to home page" />
      </Link>
    </div>
  </MainLayout>
)

export default ErrorPage
