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
          <p className={styles.name}>{item.name}</p>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  </BundleDataLayout>
)

export default BundleAbout
