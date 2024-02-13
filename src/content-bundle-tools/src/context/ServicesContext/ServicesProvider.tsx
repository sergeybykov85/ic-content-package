import type { FC, ReactNode } from 'react'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { useAuth } from '~/context/AuthContext'
import PackageRegistryService from '~/services/PackageRegistryService.ts'
import { ServicesContext } from '~/context/ServicesContext/index.ts'
import PackageService from '~/services/PackageService.ts'
import BundlePackageService from '~/services/BundlePackageService.ts'

const ServicesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { identity } = useAuth()

  const packageRegistryService = useMemo(() => {
    return identity ? new PackageRegistryService(identity) : null
  }, [identity])

  const packageService = useMemo(() => {
    return identity ? new PackageService(identity) : null
  }, [identity])

  const initBundlePackageService = useCallback(
    (packageId: string) => {
      return new BundlePackageService(packageId, identity || undefined)
    },
    [identity],
  )

  return (
    <ServicesContext.Provider value={{ packageRegistryService, packageService, initBundlePackageService }}>
      {children}
    </ServicesContext.Provider>
  )
}

export default ServicesProvider
