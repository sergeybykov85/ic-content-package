import { PACKAGE_TYPES } from '~/types/packagesTypes.ts'
import { type FC } from 'react'
import Select from '~/components/general/Select'
import styles from './WarehouseFilters.module.scss'

const options = Object.values(PACKAGE_TYPES)

interface WarehouseFiltersProps {
  onSelectType: (type: PACKAGE_TYPES) => void
}

const WarehouseFilters: FC<WarehouseFiltersProps> = ({ onSelectType }) => {
  return (
    <div className={styles.filters}>
      <div className={styles.label}>Filter by type:</div>
      <Select<PACKAGE_TYPES> {...{ options, onSelect: onSelectType, defaultValue: PACKAGE_TYPES.Public }} />
    </div>
  )
}

export default WarehouseFilters
