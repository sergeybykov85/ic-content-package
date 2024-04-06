import type { FC } from 'react'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import BundleDataLayout from '../BundleDataLayout'
import styles from './BundleGallery.module.scss'
import If from '~/components/general/If.tsx'
import clsx from 'clsx'
import ExternalLink from '~/components/general/ExternalLink.tsx'

interface BundleGalleryProps {
  data?: AdditionalDataSection
}

const BundleGallery: FC<BundleGalleryProps> = ({ data }) => {
  if (!data) return null
  return (
    <BundleDataLayout title="Gallery">
      <div className={styles.gallery}>
        {data.dataList.map(item => (
          <ExternalLink href={item.url} key={item.id}>
            <img src={item.url} alt="gallery image" />
            <If condition={Boolean(item.name)}>
              <div className={clsx(styles.shadow, styles['shadow--bottom'])}>
                <span className={styles.name}>{item.name}</span>
              </div>
            </If>
          </ExternalLink>
        ))}
      </div>
    </BundleDataLayout>
  )
}

export default BundleGallery
