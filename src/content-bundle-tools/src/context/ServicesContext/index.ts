import { createContext, useContext } from 'react'
import type PackageRegistryService from '~/services/PackageRegistryService.ts'
import type PackageService from '~/services/PackageService.ts'
import type BundlePackageService from '~/services/BundlePackageService.ts'

export interface ServicesContext {
  packageRegistryService: PackageRegistryService | null
  packageService: PackageService | null
  initBundlePackageService: ((packageId: string) => BundlePackageService) | null
}

export const ServicesContext = createContext<ServicesContext>({
  packageRegistryService: null,
  packageService: null,
  initBundlePackageService: null,
})

export const useServices = (): ServicesContext => useContext(ServicesContext)

export { default } from './ServicesProvider.tsx'
