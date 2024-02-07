import { type FC, useCallback, useState } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import Select from '~/components/general/Select'
import { PackageTypes } from '~/types/packagesTypes.ts'
import WarehousePackages from '~/components/features/WarehousePackages'

const options = Object.values(PackageTypes)
const WarehousePage: FC = () => {
  const [type, setType] = useState<PackageTypes>(PackageTypes.Public)
  const onSelect = useCallback((value: PackageTypes) => setType(value), [])
  return (
    <SectionLayout
      title="Warehouse"
      rightElement={<Select<PackageTypes> {...{ options, onSelect, defaultValue: type }} />}
    >
      <WarehousePackages type={type} />
    </SectionLayout>
  )
}

export default WarehousePage
