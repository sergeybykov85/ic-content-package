import { type FC, useCallback } from 'react'
import type { DataListItem } from '~/models/AdditionalDataSection.ts'
import If from '~/components/general/If'
import ExternalLink from '~/components/general/ExternalLink'
import styles from '../DataItemDefault/DataItemDefault.module.scss'

interface DataItemArticleProps {
  list: DataListItem[]
  dataPathUrl?: string
}

const DataItemArticle: FC<DataItemArticleProps> = ({ dataPathUrl, list }) => {
  const isHtmlFile = useCallback((item: DataListItem) => item.name?.includes('.html'), [])
  return (
    <ul className={styles.list}>
      {list.map(item => (
        <li key={item.id}>
          <If condition={isHtmlFile(item)}>
            <span>{item.name}</span>[<ExternalLink href={`${dataPathUrl}/${item.name}`}>open HTML view</ExternalLink>]
          </If>
          <If condition={!isHtmlFile(item)}>
            <span>{item.name}</span>[<ExternalLink href={item.url}>open file</ExternalLink>]
          </If>
        </li>
      ))}
    </ul>
  )
}

export default DataItemArticle
