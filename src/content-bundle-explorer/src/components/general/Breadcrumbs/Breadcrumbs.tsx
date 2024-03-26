import { type FC, useCallback } from 'react'
import Crumb, { type CrumbSubmitEvent } from './Crumb.tsx'
import styles from './Breadcrumbs.module.scss'
import { useNavigate, useParams } from 'react-router-dom'
import If from '~/components/general/If'
import clsx from 'clsx'

const Breadcrumbs: FC = () => {
  const { packageId = '', bundleId = '' } = useParams()
  const navigate = useNavigate()

  const handleChange = useCallback<CrumbSubmitEvent>(
    (type, value) => {
      switch (type) {
        case 'package':
          return navigate(`/package/${value}`)
        case 'bundle':
          return navigate(`/package/${packageId}/bundle/${value}`)
      }
    },
    [navigate, packageId],
  )

  return (
    <nav className={clsx(styles.nav, styles.flex)}>
      <Crumb type="package" value={packageId} onSubmit={handleChange} />
      <If condition={Boolean(packageId)}>
        <span className={styles.grey}>/</span>
        <Crumb type="bundle" value={bundleId} onSubmit={handleChange} />
      </If>
    </nav>
  )
}

export default Breadcrumbs
