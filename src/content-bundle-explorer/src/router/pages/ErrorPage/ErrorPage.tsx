import { type FC, useMemo } from 'react'
import Button from '~/components/general/Button'
import { Link, useRouteError } from 'react-router-dom'
import styles from './ErrorPage.module.scss'

const ErrorPage: FC = () => {
  const error = useRouteError()

  const message = useMemo(() => {
    const defaultMessage = 'Sorry, this page does not exist'
    if (error instanceof Error) {
      return error.message || defaultMessage
    }
    if (typeof error === 'string') {
      return error
    }
    return defaultMessage
  }, [error])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>4 0 4</h1>
      <h2 className={styles['sub-title']}>{message}</h2>
      <Link to="/">
        <Button text="Back to home page" />
      </Link>
    </div>
  )
}

export default ErrorPage
