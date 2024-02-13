import type { PackageTypes } from '~/types/packagesTypes.ts'
import type { Package } from '~/models/Package.ts'
import { type FC, useEffect, useState } from 'react'
import PackagesGrid from '~/components/general/PackagesGrid'
import { useServices } from '~/context/ServicesContext'

interface WarehousePackagesProps {
  type: PackageTypes
}

const WarehousePackages: FC<WarehousePackagesProps> = ({ type }) => {
  const { packageRegistryService } = useServices()
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    if (packageRegistryService) {
      packageRegistryService.getPackagesByType(type).then(res => {
        setPackages(res)
      })
    }
  }, [packageRegistryService, type])

  return <PackagesGrid packages={packages} />
}

export default WarehousePackages
