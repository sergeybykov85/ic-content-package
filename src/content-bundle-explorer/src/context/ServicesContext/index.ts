import { createContext, useContext } from 'react'
import PackageRegistryService from '~/services/PackageRegistryService.ts'

export interface ServicesContext {
  packageRegistryService: PackageRegistryService
}

export const ServicesContext = createContext<ServicesContext>({
  packageRegistryService: new PackageRegistryService(),
})

export const useServices = (): ServicesContext => useContext(ServicesContext)

export { default } from './ServicesProvider.tsx'
