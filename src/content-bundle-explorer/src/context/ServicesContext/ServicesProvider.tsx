import { type FC, type ReactNode, useCallback } from 'react'
import { ServicesContext, useServices } from '~/context/ServicesContext/index.ts'
import BundlePackageService from '~/services/BundlePackageService.ts'

const ServicesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { packageRegistryService } = useServices()

  const initBundlePackageService = useCallback((packageId: string) => {
    return new BundlePackageService(packageId)
  }, [])

  return (
    <ServicesContext.Provider value={{ packageRegistryService, initBundlePackageService }}>
      {children}
    </ServicesContext.Provider>
  )
}

export default ServicesProvider
