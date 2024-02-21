import type { DataListItem } from '~/models/PoiSection.ts'
import type Bundle from '~/models/Bundle.ts'
import type { FC } from 'react'
import PoiItemDefault from '../PoiItemDefault/PoiItemDefault.tsx'
import styles from './PoiItemAbout.module.scss'

interface PoiItemAboutProps {
  list: DataListItem[]
  about: Bundle['about']
}

const PoiItemAbout: FC<PoiItemAboutProps> = ({ list, about }) => {
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

  return <PoiItemDefault list={list} />
}

export default PoiItemAbout
