import type { PackageTypes } from '~/types/packagesTypes.ts'
import type { Package } from '~/models/Package.tsx'
import { type FC, useEffect, useState } from 'react'
import PackagesGrid from '~/components/general/PackagesGrid'
import { useServices } from '~/context/ServicesContext'

interface WarehousePackagesProps {
  type: PackageTypes
}

const WarehousePackages: FC<WarehousePackagesProps> = ({ type }) => {
  const { packageRegistry } = useServices()
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    if (packageRegistry) {
      packageRegistry.getPackagesByType(type).then(res => {
        setPackages(res)
      })
    }
  }, [packageRegistry, type])

  return <PackagesGrid packages={packages} />
}

export default WarehousePackages
