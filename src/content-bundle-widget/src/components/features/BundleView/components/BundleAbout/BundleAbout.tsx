import type { FC } from 'react'
import type { AboutIndexDto } from '~/types/bundleTypes.ts'
import styles from './BundleAbout.module.scss'
import BundleDataLayout from '../BundleDataLayout'
import getLanguageByCode from '~/utils/getLanguageByCode.ts'

const BundleAbout: FC<{ about: AboutIndexDto[] }> = ({ about }) => (
  <BundleDataLayout title="About">
    <div className={styles.about}>
      {about.map(item => (
        <div key={item.locale}>
          <p className={styles.locale}>
            <span>Language:</span>
            {getLanguageByCode(item.locale)}
          </p>
          <h4 className={styles.name}>{item.name}</h4>
          <div className={styles.description}>
            {item.description.split(/(\r\n|\r|\n)/g).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  </BundleDataLayout>
)

export default BundleAbout
