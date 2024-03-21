import { type FC, useCallback, useEffect, useState } from 'react'
import styles from './AdditionalData.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import If from '~/components/general/If'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import type Bundle from '~/models/Bundle.ts'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import type { ADDITIONAL_DATA_GROUPS } from '~/types/bundleDataTypes.ts'
import { enqueueSnackbar } from 'notistack'
import DataItem from './components/DataItem/DataItem.tsx'

interface AdditionalDataProps {
  group: ADDITIONAL_DATA_GROUPS
  title: string
  service: BundlePackageService
  bundleId: string
  bundle: Bundle
}

const AdditionalData: FC<AdditionalDataProps> = ({ group, title, service, bundle, bundleId }) => {
  const [sourceUrl, setSourceUrl] = useState('')
  const [sections, setSections] = useState<AdditionalDataSection[]>([])

  const getData = useCallback(() => {
    service
      .getBundleAdditionalData(bundleId, group)
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
  }, [service, bundleId, group])

  useEffect(() => {
    getData()
  }, [getData])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <If condition={Boolean(sourceUrl)}>
          <ExternalLink href={sourceUrl!} className={styles.link}>
            <img src="/images/new-tab.svg" alt="" />
          </ExternalLink>
        </If>
      </div>

      <div className={styles.grid}>
        {sections.map(item => (
          <DataItem {...{ item, bundle }} key={item.category} />
        ))}
      </div>
    </div>
  )
}

export default AdditionalData
