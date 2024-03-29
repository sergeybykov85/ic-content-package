import type Bundle from '~/models/Bundle.ts'
import { type FC, useCallback, useMemo } from 'react'
import Chip from '~/components/general/Chip'
import styles from './BundleView.module.scss'
import If from '~/components/general/If.tsx'
import Button from '~/components/general/Button'
import { useFullScreenModal } from '~/context/FullScreenModalContext'
import BundleAbout from '~/components/features/BundleView/components/BundleAbout'
import BundleLocations from '~/components/features/BundleView/components/BundleLocations'

enum BUNDLE_DATA_TYPES {
  About = 'About',
  Location = 'Location',
}

interface BundleViewProps {
  bundle: Bundle
}

const BundleView: FC<BundleViewProps> = ({ bundle }) => {
  const { setContent } = useFullScreenModal()

  const label = useMemo(() => bundle.classification.replace('_', ' '), [bundle.classification])
  const location = useMemo(() => bundle.location[0], [bundle.location])

  const handleClick = useCallback(
    (name: BUNDLE_DATA_TYPES) => {
      switch (name) {
        case BUNDLE_DATA_TYPES.About:
          setContent(<BundleAbout about={bundle.about} />)
          break
        case BUNDLE_DATA_TYPES.Location:
          setContent(<BundleLocations location={bundle.location[0]} />)
      }
    },
    [setContent, bundle.about, bundle.location],
  )

  return (
    <div>
      <div className={styles['img-wrapper']}>
        <img src={bundle.logoUrl} alt={`Cover for bundle "${bundle.name}"`} />
        <Chip text={label} className={styles.chip} />
      </div>
      <div className={styles['title-wrapper']}>
        <h2 className={styles.title}>{bundle.name}</h2>
        <If condition={Boolean(location)}>
          <Button variant="text" text="Map" onClick={() => handleClick(BUNDLE_DATA_TYPES.Location)} />
        </If>
        <If condition={bundle.about.length > 0}>
          <Button variant="text" text="About" onClick={() => handleClick(BUNDLE_DATA_TYPES.About)} />
        </If>
      </div>
      <p className={styles.description} title={bundle.description}>
        {bundle.description}
      </p>
      <If condition={Boolean(location)}>
        <div className={styles.coordinates}>
          <p className={styles.country}>
            <span>Country:</span>
            {location?.country}
          </p>
          <p>
            <span>Latitude:</span>
            {location?.coordinates.latitude}
          </p>
          <p>
            <span>Longitude:</span>
            {location?.coordinates.longitude}
          </p>
        </div>
      </If>
      <If condition={bundle.tags.length > 0}>
        <div className={styles.tags}>
          {bundle.tags.map(tag => (
            <Chip key={tag} text={tag} color="blue" />
          ))}
        </div>
      </If>
    </div>
  )
}

export default BundleView
