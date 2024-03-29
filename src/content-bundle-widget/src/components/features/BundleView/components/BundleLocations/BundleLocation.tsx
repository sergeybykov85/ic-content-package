import type { FC } from 'react'
import type BundleLocation from '~/models/BundleLocation.ts'
import BundleDataLayout from '../BundleDataLayout'
import If from '~/components/general/If.tsx'
import GoogleMap from '~/components/features/GoogleMap'
import styles from './BundleLocations.module.scss'

const BundleLocations: FC<{ location: BundleLocation }> = ({ location }) => (
  <BundleDataLayout title="Map">
    <div className={styles.location}>
      <p>
        <span>Country:</span>
        {location.country}
      </p>
      <If condition={Boolean(location.region)}>
        <p>
          <span>Region:</span>
          {location.region}
        </p>
      </If>
      <If condition={Boolean(location.city)}>
        <p>
          <span>City:</span>
          {location.city}
        </p>
      </If>
      <GoogleMap location={location.coordinates} height={325} />
    </div>
  </BundleDataLayout>
)

export default BundleLocations
