import styles from './PackageDetailsPage.module.scss'
import type { FC } from 'react'
import CopyBtn from '~/components/general/CopyBtn'
import { Link, useParams } from 'react-router-dom'
import Button from '~/components/general/Button'

const PackageDetailsPage: FC = () => {
  const { packageId = '' } = useParams()

  return (
    <h1 className={styles.title}>
      Package ID: {packageId} <CopyBtn text={packageId} />
      <Link to="/">
        <Button variant="text" text="Back to home" />
      </Link>
    </h1>
  )
}

export default PackageDetailsPage
