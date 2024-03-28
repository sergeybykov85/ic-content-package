import styles from './BundleTags.module.scss'
import type { FC } from 'react'
import Chip from '~/components/general/Chip'
import BundleDataLayout from '../BundleDataLayout'

const BundleTags: FC<{ tags: string[] }> = ({ tags }) => (
  <BundleDataLayout title="Tags">
    <div className={styles.tags}>
      {tags.map(tag => (
        <Chip key={tag} text={tag} color="blue" />
      ))}
    </div>
  </BundleDataLayout>
)

export default BundleTags
