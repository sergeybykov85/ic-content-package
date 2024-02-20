import type { FC } from 'react'
import ExternalLink from '~/components/general/ExternalLink'
import styles from './PoiItemDefault.module.scss'

const PoiItemDefault: FC<{ list: DataListItem[] }> = ({ list }) => (
  <ul className={styles.list}>
    {list.map(item => (
      <li>
        <ExternalLink href={item.url} key={item.id}>
          {item.url}
        </ExternalLink>
      </li>
    ))}
  </ul>
)

export default PoiItemDefault
