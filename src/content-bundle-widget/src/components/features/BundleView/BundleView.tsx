import type Bundle from '~/models/Bundle.ts'
import { type FC, useMemo } from 'react'
import Chip from '~/components/general/Chip'
import styles from './BundleView.module.scss'
import If from '~/components/general/If.tsx'
import BundleDataButtons from './components/BundleDataButtons'
import type Widget from '~/models/Widget.ts'

interface BundleViewProps {
  bundle: Bundle
  widget: Widget
}

const BundleView: FC<BundleViewProps> = ({ bundle, widget }) => {
  const label = useMemo(() => bundle.classification.replace('_', ' '), [bundle.classification])
  const location = useMemo(() => bundle.location[0], [bundle.location])
  console.log(bundle.packageId)
  return (
    <div>
      <div className={styles['img-wrapper']}>
        <img src={bundle.logoUrl} alt={`Cover for bundle "${bundle.name}"`} />
        <Chip text={label} className={styles.chip} />
      </div>
      <div className={styles['title-wrapper']}>
        <h2 className={styles.title}>{bundle.name}</h2>
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
      <BundleDataButtons {...{ bundle, dataToRender: widget.bundleDataToRender }} />
    </div>
  )
}

export default BundleView
