import { type FC, useCallback, useState } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import { PackageTypes } from '~/types/packagesTypes.ts'
import WarehousePackages from '~/components/features/WarehousePackages'
import WarehouseFilters from '~/components/features/WarehouseFilters'

const WarehousePage: FC = () => {
  const [type, setType] = useState<PackageTypes>(PackageTypes.Public)
  const onSelect = useCallback((value: PackageTypes) => setType(value), [])
  return (
    <SectionLayout title="Warehouse" rightElement={<WarehouseFilters onSelectType={onSelect} />}>
      <WarehousePackages type={type} />
    </SectionLayout>
  )
}

export default WarehousePage
