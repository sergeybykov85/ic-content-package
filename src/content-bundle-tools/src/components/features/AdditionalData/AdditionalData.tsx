import { type FC, type MouseEventHandler, useCallback, useEffect, useState } from 'react'
import styles from './AdditionalData.module.scss'
import ExternalLink from '~/components/general/ExternalLink'
import If from '~/components/general/If'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import type Bundle from '~/models/Bundle.ts'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import type { ADDITIONAL_DATA_GROUPS, RemoveBundleDataParams } from '~/types/bundleDataTypes.ts'
import { enqueueSnackbar } from 'notistack'
import DataItem from './components/DataItem/DataItem.tsx'
import IconButton from '~/components/general/IconButton'
import RemoveBundleDataModal from '~/components/features/RemoveBundleDataModal'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'

interface AdditionalDataProps {
  group: ADDITIONAL_DATA_GROUPS
  title: string
  service: BundlePackageService
  bundleId: string
  bundle: Bundle
  editable: boolean
  onPlusClick: (group: ADDITIONAL_DATA_GROUPS) => void
}

const AdditionalData: FC<AdditionalDataProps> = ({
  group,
  title,
  service,
  bundle,
  bundleId,
  editable,
  onPlusClick,
}) => {
  const { setLoading } = useFullScreenLoading()

  const [sourceUrl, setSourceUrl] = useState('')
  const [sections, setSections] = useState<AdditionalDataSection[]>([])
  const [dataToRemove, setDataToRemove] = useState<RemoveBundleDataParams | null>(null)

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

  const handlePlusClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    event => {
      event.stopPropagation()
      editable && onPlusClick(group)
    },
    [editable, onPlusClick, group],
  )

  const handleRemoveClick = useCallback(
    (params: Omit<RemoveBundleDataParams, 'group'>) => {
      setDataToRemove({
        group,
        ...params,
      })
    },
    [group],
  )
  const onRemoveCancel = useCallback(() => setDataToRemove(null), [])

  const handleSubmitRemove = useCallback(() => {
    if (!dataToRemove) return
    setLoading(true)
    service
      .removeBundleData(bundleId, dataToRemove)
      .then(() => {
        getData()
        setDataToRemove(null)
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [dataToRemove, service, getData, bundleId, setLoading])

  useEffect(() => {
    getData()
  }, [getData])

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
          <DataItem {...{ item, bundle, editable }} key={item.category} onRemoveClick={handleRemoveClick} />
        ))}
      </div>
      <RemoveBundleDataModal data={dataToRemove} onCancel={onRemoveCancel} onSubmit={handleSubmitRemove} />
    </div>
  )
}

export default AdditionalData
