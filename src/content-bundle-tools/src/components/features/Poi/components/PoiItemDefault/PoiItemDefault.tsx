import type { FC } from 'react'
import ExternalLink from '~/components/general/ExternalLink'
import styles from './PoiItemDefault.module.scss'
import type { DataListItem } from '~/models/PoiSection.ts'

const PoiItemDefault: FC<{ list: DataListItem[] }> = ({ list }) => (
  <ul className={styles.list}>
    {list.map(item => (
      <li key={item.id}>
        <ExternalLink href={item.url}>{item.url}</ExternalLink>
      </li>
    ))}
  </ul>
)

export default PoiItemDefault
