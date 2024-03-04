import { type FC, useEffect, useMemo, useState } from 'react'
import type { ADDITIONS_CATEGORIES, POI_CATEGORIES, AdditionalDataCategories } from '~/types/bundleDataTypes.ts'
import { ADDITIONAL_DATA_GROUPS } from '~/types/bundleDataTypes.ts'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import ModalDialog from '~/components/general/ModalDialog'
import Select from '~/components/general/Select'
import styles from './NewAdditionalDataModal.module.scss'

interface NewAdditionalDataModalProps {
  onClose: () => void
  group: ADDITIONAL_DATA_GROUPS | null
  supportedGroups: ADDITIONAL_DATA_GROUPS[]
  service?: BundlePackageService
}

interface CategoriesByGroup {
  [ADDITIONAL_DATA_GROUPS.POI]: POI_CATEGORIES[]
  [ADDITIONAL_DATA_GROUPS.Additions]: ADDITIONS_CATEGORIES[]
}

const NewAdditionalDataModal: FC<NewAdditionalDataModalProps> = ({ group, supportedGroups, onClose, service }) => {
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
    if (service && chosenGroup && !categoriesByGroup[chosenGroup].length) {
      service.getBundleSupportedDataCategories(chosenGroup).then(res => {
        setCategoriesByGroup(prevState => ({
          ...prevState,
          [chosenGroup]: res,
        }))
      })
    }
  }, [categoriesByGroup, chosenGroup, service])

  return (
    <ModalDialog open={Boolean(group)} onClose={onClose}>
      <h2>New additional data</h2>
      <div className={styles.selects}>
        <Select
          options={supportedGroups}
          defaultValue={chosenGroup || supportedGroups[0]}
          onSelect={value => setChosenGroup(value)}
        />
        <Select
          options={categoryOptions}
          defaultValue={chosenCategory}
          onSelect={value => setChosenCategory(value)}
          placeholder="Choose category..."
        />
      </div>
    </ModalDialog>
  )
}

export default NewAdditionalDataModal
