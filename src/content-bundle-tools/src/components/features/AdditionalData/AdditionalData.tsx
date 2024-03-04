import { type FC, type MouseEventHandler, useCallback, useEffect, useState } from 'react'
import styles from './AdditionalData.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import If from '~/components/general/If'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import type Bundle from '~/models/Bundle.ts'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import type { ADDITIONAL_DATA_GROUPS } from '~/types/bundleTypes.ts'
import { enqueueSnackbar } from 'notistack'
import DataItem from './components/DataItem/DataItem.tsx'
import IconButton from '~/components/general/IconButton'

interface AdditionalDataProps {
  type: ADDITIONAL_DATA_GROUPS
  title: string
  service: BundlePackageService
  bundleId: string
  bundle: Bundle
  editable: boolean
  onPlusClick: (group: ADDITIONAL_DATA_GROUPS) => void
}

const AdditionalData: FC<AdditionalDataProps> = ({ type, title, service, bundle, bundleId, editable, onPlusClick }) => {
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

  const handlePlusClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    event => {
      event.stopPropagation()
      editable && onPlusClick(type)
    },
    [editable, onPlusClick, type],
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <If condition={editable}>
          <IconButton iconName="plus.svg" size={32} className={styles.btn} onClick={handlePlusClick} />
        </If>
        <If condition={Boolean(sourceUrl)}>
          <ExternalLink href={sourceUrl!} className={styles.link}>
            <img src="/images/new-tab.svg" alt="" />
          </ExternalLink>
        </If>
      </div>

      <div className={styles.grid}>
        {sections.map(item => (
          <DataItem item={item} bundle={bundle} key={item.category} />
        ))}
      </div>
    </div>
  )
}

export default AdditionalData
