import type { DataListItem } from '~/models/AdditionalDataSection.ts'
import type Bundle from '~/models/Bundle.ts'
import type { FC } from 'react'
import DataItemDefault from '../DataItemDefault/DataItemDefault.tsx'
import styles from './DataItemAbout.module.scss'

interface DataItemAboutProps {
  list: DataListItem[]
  about: Bundle['about']
}

const DataItemAbout: FC<DataItemAboutProps> = ({ list, about }) => {
  if (about.length) {
    return (
      <div className={styles.container}>
        {about.map(item => (
          <div key={item.locale}>
            <p className={styles.locale}>
              <span>Locale:</span>
              {item.locale}
            </p>
            <p className={styles.name}>{item.name}</p>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    )
  }

  return <DataItemDefault list={list} />
}

export default DataItemAbout
