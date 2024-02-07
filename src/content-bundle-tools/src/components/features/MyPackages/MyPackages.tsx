import { FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import type { Package } from '~/types/packagesTypes.ts'
import PackagesGrid from '~/components/general/PackagesGrid'

const MyPackages: FC = () => {
  const { principal = '' } = useAuth()
  const { packageRegistry } = useServices()
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    if (packageRegistry) {
      packageRegistry.getMyPackages(principal).then(res => setPackages(res))
    }
  }, [])

  return <PackagesGrid packages={packages} />
}

export default MyPackages
