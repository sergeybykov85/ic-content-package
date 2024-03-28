import styles from './BundleView.module.scss'
import type { FC } from 'react'
import Chip from '~/components/general/Chip'

const BundleTags: FC<{ tags: string[] }> = ({ tags }) => (
  <>
    <h2 className={styles.title}>Tags</h2>
    <div className={styles.tags}>
      {tags.map(i => (
        <Chip key={i} text={i} color="blue" />
      ))}
    </div>
  </>
)

export default BundleTags
