import type { FC } from 'react'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import BundleDataLayout from '~/components/features/BundleView/components/BundleDataLayout'
import styles from './BundleAudio.module.scss'
import { POI_CATEGORIES } from '~/types/bundleTypes.ts'

interface BundleAudioProps {
  data?: AdditionalDataSection
}

const BundleAudio: FC<BundleAudioProps> = ({ data }) => {
  if (!data) return null
  return (
    <BundleDataLayout title={data.category === POI_CATEGORIES.AudioGuide ? 'Audio Guide' : 'Audio'}>
      <div className={styles.container}>
        {data.dataList.map(item => (
          <div key={item.id}>
            <p>
              <span>Name:</span>
              {item.name}
            </p>
            <p>
              <span>Locale:</span>
              {item.locale}
            </p>
            <audio controls src={item.url} />
          </div>
        ))}
      </div>
    </BundleDataLayout>
  )
}

export default BundleAudio
