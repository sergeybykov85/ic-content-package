import type { FC } from 'react'
import type { DataListItem } from '~/models/AdditionalDataSection.ts'
import styles from './DataItemAudio.module.scss'

const DataItemAudio: FC<{ list: DataListItem[] }> = ({ list }) => (
  <div className={styles.container}>
    {list.map(item => (
      <div key={item.id}>
        <p>
          <span>Name:</span>
          {item.name}
        </p>
        <audio controls src={item.url} />
      </div>
    ))}
  </div>
)

export default DataItemAudio
