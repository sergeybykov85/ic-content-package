import type { FC } from 'react'
import type BundleLocation from '~/models/BundleLocation.ts'
import BundleDataLayout from '../BundleDataLayout'
import If from '~/components/general/If.tsx'
import GoogleMap from '~/components/features/GoogleMap'
import styles from './BundleLocations.module.scss'

const BundleLocations: FC<{ locations: BundleLocation[] }> = ({ locations }) => (
  <BundleDataLayout title="Location">
    {locations.map((item, idx) => (
      <div key={idx} className={styles.location}>
        <div className={styles.grid}>
          <div>
            <If condition={Boolean(item.city)}>
              <p>
                <span>City:</span>
                {item.city}
              </p>
            </If>
            <If condition={Boolean(item.region)}>
              <p>
                <span>Region:</span>
                {item.region}
              </p>
            </If>
            <p>
              <span>Country:</span>
              {item.country}
            </p>
          </div>
          <div>
            <p>
              <span>Latitude:</span>
              {item.coordinates.latitude}
            </p>
            <p>
              <span>Longitude:</span>
              {item.coordinates.longitude}
            </p>
          </div>
        </div>
        <GoogleMap location={item.coordinates} height={250} />
      </div>
    ))}
  </BundleDataLayout>
)

export default BundleLocations
