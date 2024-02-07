import { type Package, PackageTypes } from '~/types/packagesTypes.ts'
import { FC, useEffect, useState } from 'react'
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
  }, [type])

  return <PackagesGrid packages={packages} />
}

export default WarehousePackages
