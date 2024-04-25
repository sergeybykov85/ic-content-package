import type { FC } from 'react'
import type { DataListItem } from '~/models/AdditionalDataSection.ts'
import styles from './DataItemAudio.module.scss'
import getLanguageByCode from '~/utils/getLanguageByCode.ts'

const DataItemAudio: FC<{ list: DataListItem[] }> = ({ list }) => (
  <div className={styles.container}>
    {list.map(item => (
      <div key={item.id}>
        <p>
          <span>Locale:</span>
          {item.locale ? getLanguageByCode(item.locale) : 'Not set'}
        </p>
        <audio controls src={item.url} />
      </div>
    ))}
  </div>
)

export default DataItemAudio
