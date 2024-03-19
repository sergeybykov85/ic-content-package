import { createContext, useContext } from 'react'
import PackageRegistryService from '~/services/PackageRegistryService.ts'
import type BundlePackageService from '~/services/BundlePackageService.ts'

export interface ServicesContext {
  packageRegistryService: PackageRegistryService
  initBundlePackageService: ((packageId: string) => BundlePackageService) | null
}

export const ServicesContext = createContext<ServicesContext>({
  packageRegistryService: new PackageRegistryService(),
  initBundlePackageService: null,
})

export const useServices = (): ServicesContext => useContext(ServicesContext)

export { default } from './ServicesProvider.tsx'
