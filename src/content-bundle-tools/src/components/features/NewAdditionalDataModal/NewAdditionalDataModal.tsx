import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import type {
  AdditionalDataCategories,
  ADDITIONS_CATEGORIES,
  ApplyAdditionalDataParams,
} from '~/types/bundleDataTypes.ts'
import { ADDITIONAL_DATA_ACTIONS, ADDITIONAL_DATA_GROUPS, POI_CATEGORIES } from '~/types/bundleDataTypes.ts'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import styles from './NewAdditionalDataModal.module.scss'
import ModalDialog from '~/components/general/ModalDialog'
import Select from '~/components/general/Select'
import LocationDataForm from '~/components/features/NewAdditionalDataModal/components/LocationDataForm/LocationDataForm.tsx'
import IconButton from '~/components/general/IconButton'
import Collapse from '~/components/general/Collapse'
import { enqueueSnackbar } from 'notistack'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'

interface NewAdditionalDataModalProps {
  bundleId: string
  onClose: () => void
  group: ADDITIONAL_DATA_GROUPS | null
  supportedGroups: ADDITIONAL_DATA_GROUPS[]
  service?: BundlePackageService
  onSuccess: () => void
}

interface CategoriesByGroup {
  [ADDITIONAL_DATA_GROUPS.POI]: POI_CATEGORIES[]
  [ADDITIONAL_DATA_GROUPS.Additions]: ADDITIONS_CATEGORIES[]
}

const NewAdditionalDataModal: FC<NewAdditionalDataModalProps> = ({
  bundleId,
  group,
  supportedGroups,
  onClose,
  service,
  onSuccess,
}) => {
  const { setLoading } = useFullScreenLoading()

  const [chosenGroup, setChosenGroup] = useState(group)
  const [categoriesByGroup, setCategoriesByGroup] = useState<CategoriesByGroup>({
    [ADDITIONAL_DATA_GROUPS.POI]: [],
    [ADDITIONAL_DATA_GROUPS.Additions]: [],
  })
  const [chosenCategory, setChosenCategory] = useState<AdditionalDataCategories | ''>('')

  const categoryOptions = useMemo(
    () => (chosenGroup ? categoriesByGroup[chosenGroup] : []),
    [categoriesByGroup, chosenGroup],
  )

  useEffect(() => {
    setChosenGroup(group)
  }, [group])
  useEffect(() => {
    chosenGroup && setChosenCategory('')
  }, [chosenGroup])

  useEffect(() => {
    if (service && chosenGroup && !categoriesByGroup[chosenGroup].length) {
      service.getBundleSupportedDataCategories(chosenGroup).then(res => {
        setCategoriesByGroup(prevState => ({
          ...prevState,
          [chosenGroup]: res,
        }))
      })
    }
  }, [categoriesByGroup, chosenGroup, service])

  const onSubmit = useCallback(
    async (params: Partial<ApplyAdditionalDataParams> & Pick<ApplyAdditionalDataParams, 'payload'>) => {
      try {
        if (!chosenGroup || !chosenCategory) {
          return
        }
        setLoading(true)
        await service?.applyDataSection(bundleId, {
          group: chosenGroup,
          category: chosenCategory,
          action: ADDITIONAL_DATA_ACTIONS.Upload,
          ...params,
        })
        onClose()
        onSuccess()
        enqueueSnackbar('Success', { variant: 'success' })
      } catch (e) {
        console.error(e)
        enqueueSnackbar('Failed', {
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    },
    [bundleId, chosenCategory, chosenGroup, onClose, onSuccess, service, setLoading],
  )

  const renderForm = useCallback(
    (category: AdditionalDataCategories | '') => {
      if (!category) {
        return null
      }
      switch (category) {
        case POI_CATEGORIES.Location:
          return <LocationDataForm onSubmit={onSubmit} onCancel={onClose} />
        default:
          return null
      }
    },
    [onClose, onSubmit],
  )

  return (
    <ModalDialog open={Boolean(group)}>
      <div className={styles.header}>
        <h2>New additional data</h2>
        <IconButton iconName="cross.svg" size={25} onClick={onClose} />
      </div>
      <div className={styles.selects}>
        <Select
          label="Group"
          options={supportedGroups}
          defaultValue={chosenGroup || supportedGroups[0]}
          onSelect={value => setChosenGroup(value)}
        />
        <Select
          label="Category"
          options={categoryOptions}
          defaultValue={chosenCategory}
          onSelect={value => setChosenCategory(value)}
          placeholder="Choose category..."
        />
      </div>
      <Collapse open={Boolean(chosenCategory)}>{renderForm(chosenCategory)}</Collapse>
    </ModalDialog>
  )
}

export default NewAdditionalDataModal