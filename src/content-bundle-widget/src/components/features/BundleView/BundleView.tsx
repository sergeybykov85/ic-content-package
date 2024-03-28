import type Bundle from '~/models/Bundle.ts'
import { type FC, useCallback, useMemo } from 'react'
import Chip from '~/components/general/Chip'
import styles from './BundleView.module.scss'
import If from '~/components/general/If.tsx'
import Button from '~/components/general/Button'
import { useFullScreenModal } from '~/context/FullScreenModalContext'
import BundleTags from './components/BundleTags'
import BundleAbout from '~/components/features/BundleView/components/BundleAbout'
import BundleLocations from '~/components/features/BundleView/components/BundleLocations'

enum BUNDLE_DATA_TYPES {
  Tags = 'Tags',
  About = 'About',
  Location = 'Location',
}

interface BundleViewProps {
  bundle: Bundle
}

const BundleView: FC<BundleViewProps> = ({ bundle }) => {
  const { setContent } = useFullScreenModal()

  const label = useMemo(() => bundle.classification.replace('_', ' '), [bundle.classification])

  const handleClick = useCallback(
    (name: BUNDLE_DATA_TYPES) => {
      switch (name) {
        case BUNDLE_DATA_TYPES.Tags:
          setContent(<BundleTags tags={bundle.tags} />)
          break
        case BUNDLE_DATA_TYPES.About:
          setContent(<BundleAbout about={bundle.about} />)
          break
        case BUNDLE_DATA_TYPES.Location:
          setContent(<BundleLocations locations={bundle.location} />)
      }
    },
    [setContent, bundle.tags, bundle.about, bundle.location],
  )

  return (
    <div>
      <div className={styles['img-wrapper']}>
        <img src={bundle.logoUrl} alt={`Cover for bundle "${bundle.name}"`} />
        <Chip text={label} className={styles.chip} />
      </div>
      <h2 className={styles.title}>{bundle.name}</h2>
      <p>{bundle.description}</p>
      <div className={styles['btn-group']}>
        <If condition={bundle.location.length > 0}>
          <Button variant="text" text="Location" onClick={() => handleClick(BUNDLE_DATA_TYPES.Location)} />
        </If>
        <If condition={bundle.about.length > 0}>
          <Button variant="text" text="About" onClick={() => handleClick(BUNDLE_DATA_TYPES.About)} />
        </If>
        <If condition={bundle.tags.length > 0}>
          <Button variant="text" text="Tags" onClick={() => handleClick(BUNDLE_DATA_TYPES.Tags)} />
        </If>
      </div>
    </div>
  )
}

export default BundleView
