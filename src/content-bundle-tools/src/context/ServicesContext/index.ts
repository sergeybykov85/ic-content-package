import { createContext, useContext } from 'react'
import PackageRegistry from '~/services/PackageRegistry.ts'

export interface ServicesContext {
  packageRegistry: PackageRegistry | null
}

export const ServicesContext = createContext<ServicesContext>({
  packageRegistry: null,
})

export const useServices = (): ServicesContext => useContext(ServicesContext)

export { default } from './ServicesProvider.tsx'
