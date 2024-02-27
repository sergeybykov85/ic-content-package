import type { FC, ReactNode } from 'react'
import styles from './DataBlock.module.scss'
import ExternalLink from '~/components/general/ExternalLink'

interface DataBlockProps {
  title: string
  sourceUrl: string
  children: ReactNode
}

const DataBlock: FC<DataBlockProps> = ({ title, sourceUrl, children }) => (
  <div className={styles.container}>
    <h3 className={styles.title}>
      {title}
      <ExternalLink href={sourceUrl} className={styles.link}>
        <img src="/images/new-tab.svg" alt="" />
      </ExternalLink>
    </h3>
    <div className={styles.grid}>{children}</div>
  </div>
)

export default DataBlock
