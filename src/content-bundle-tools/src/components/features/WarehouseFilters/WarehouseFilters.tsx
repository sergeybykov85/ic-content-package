import { PackageTypes } from '~/types/packagesTypes.ts'
import { type FC } from 'react'
import Select from '~/components/general/Select'
import styles from './WarehouseFilters.module.scss'

const options = Object.values(PackageTypes)

interface WarehouseFiltersProps {
  onSelectType: (type: PackageTypes) => void
}

const WarehouseFilters: FC<WarehouseFiltersProps> = ({ onSelectType }) => {
  return (
    <div className={styles.filters}>
      <div className={styles.label}>Filter by type:</div>
      <Select<PackageTypes> {...{ options, onSelect: onSelectType, defaultValue: PackageTypes.Public }} />
    </div>
  )
}

export default WarehouseFilters
