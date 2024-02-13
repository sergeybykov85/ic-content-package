import { type FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import PackagesGrid from '~/components/general/PackagesGrid'
import type { Package } from '~/models/Package.ts'

const MyPackages: FC = () => {
  const { principal = '' } = useAuth()
  const { packageRegistryService } = useServices()
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    if (packageRegistryService) {
      packageRegistryService.getMyPackages(principal).then(res => setPackages(res))
    }
  }, [packageRegistryService, principal])

  return <PackagesGrid packages={packages} />
}

export default MyPackages
