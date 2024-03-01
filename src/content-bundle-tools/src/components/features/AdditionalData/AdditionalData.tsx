import { type FC, useEffect, useState } from 'react'
import styles from './AdditionalData.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import If from '~/components/general/If'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import type Bundle from '~/models/Bundle.ts'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import type { ADDITIONAL_DATA_TYPES } from '~/types/bundleTypes.ts'
import { enqueueSnackbar } from 'notistack'
import DataItem from './components/DataItem/DataItem.tsx'

interface AdditionalDataProps {
  type: ADDITIONAL_DATA_TYPES
  title: string
  service: BundlePackageService
  bundleId: string
  bundle: Bundle
}

const AdditionalData: FC<AdditionalDataProps> = ({ type, title, service, bundle, bundleId }) => {
  const [sourceUrl, setSourceUrl] = useState('')
  const [sections, setSections] = useState<AdditionalDataSection[]>([])

  useEffect(() => {
    service
      .getBundleAdditionalData(bundleId, type)
      .then(({ sections, url }) => {
        setSourceUrl(url)
        setSections(sections)
      })
      .catch(error => {
        if ('NotRegistered' in error) {
          setSourceUrl('')
          setSections([])
        } else {
          console.error(error)
          enqueueSnackbar(error.message, {
            variant: 'error',
          })
        }
      })
  }, [bundleId, service, type])

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {title}
        <If condition={Boolean(sourceUrl)}>
          <ExternalLink href={sourceUrl!} className={styles.link}>
            <img src="/images/new-tab.svg" alt="" />
          </ExternalLink>
        </If>
      </h3>
      <div className={styles.grid}>
        {sections.map(item => (
          <DataItem item={item} bundle={bundle} key={item.category} />
        ))}
      </div>
    </div>
  )
}

export default AdditionalData
