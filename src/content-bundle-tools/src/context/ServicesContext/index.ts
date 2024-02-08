import { createContext, useContext } from 'react'
import type PackageRegistry from '~/services/PackageRegistry.ts'
import type PackageService from '~/services/PackageService.ts'

export interface ServicesContext {
  packageRegistry: PackageRegistry | null
  packageService: PackageService | null
}

export const ServicesContext = createContext<ServicesContext>({
  packageRegistry: null,
  packageService: null,
})

export const useServices = (): ServicesContext => useContext(ServicesContext)

export { default } from './ServicesProvider.tsx'
