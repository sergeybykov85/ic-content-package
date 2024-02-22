import type { FC } from 'react'
import ExternalLink from '~/components/general/ExternalLink'
import styles from './DataItemDefault.module.scss'
import type { DataListItem } from '~/models/AdditionalDataSection.ts'

const DataItemDefault: FC<{ list: DataListItem[] }> = ({ list }) => (
  <ul className={styles.list}>
    {list.map(item => (
      <li key={item.id}>
        <ExternalLink href={item.url}>{item.url}</ExternalLink>
      </li>
    ))}
  </ul>
)

export default DataItemDefault
