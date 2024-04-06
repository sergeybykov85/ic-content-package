import type { FC } from 'react'
import Loader from './Loader.tsx'
import styles from './FullScreenLoader.module.scss'

const FullScreenLoader: FC = () => (
  <div className={styles.loader}>
    <Loader />
  </div>
)

export default FullScreenLoader
