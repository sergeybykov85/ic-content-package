import { type FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import PackagesGrid from '~/components/general/PackagesGrid'
import type { Package } from '~/models/Package.tsx'

const MyPackages: FC = () => {
  const { principal = '' } = useAuth()
  const { packageRegistry } = useServices()
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    if (packageRegistry) {
      packageRegistry.getMyPackages(principal).then(res => setPackages(res))
    }
  }, [packageRegistry, principal])

  return <PackagesGrid packages={packages} />
}

export default MyPackages
