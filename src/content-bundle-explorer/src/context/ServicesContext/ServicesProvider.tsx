import type { FC, ReactNode } from 'react'
import { ServicesContext, useServices } from '~/context/ServicesContext/index.ts'

const ServicesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { packageRegistryService } = useServices()
  return <ServicesContext.Provider value={{ packageRegistryService }}>{children}</ServicesContext.Provider>
}

export default ServicesProvider
