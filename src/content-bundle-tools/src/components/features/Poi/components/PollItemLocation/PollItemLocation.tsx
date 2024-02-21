import { type FC } from 'react'
import type { DataListItem } from '~/models/PoiSection.ts'
import type BundleLocation from '~/models/BundleLocation.ts'
import GoogleMap from '~/components/features/GoogleMap/GoogleMap.tsx'
import PoiItemDefault from '../PoiItemDefault/PoiItemDefault.tsx'
import If from '~/components/general/If'
import styles from './PollItemLocation.module.scss'

interface PollItemLocationProps {
  list: DataListItem[]
  locations: BundleLocation[]
}

const PollItemLocation: FC<PollItemLocationProps> = ({ list, locations }) => {
  if (locations.length) {
    return (
      <>
        {locations.map((item, idx) => (
          <div key={idx} className={styles.item}>
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
              <span>Country code:</span>
              {item.country_code2}
            </p>
            <p>
              <span>Latitude:</span>
              {item.coordinates.latitude}
            </p>
            <p>
              <span>Longitude:</span>
              {item.coordinates.longitude}
            </p>
            <GoogleMap location={item.coordinates} />
          </div>
        ))}
      </>
    )
  }
  return <PoiItemDefault list={list} />
}

export default PollItemLocation
