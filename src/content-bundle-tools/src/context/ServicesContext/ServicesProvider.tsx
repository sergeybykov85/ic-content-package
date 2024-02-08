import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'
import { useAuth } from '~/context/AuthContext'
import PackageRegistry from '~/services/PackageRegistry.ts'
import { ServicesContext } from '~/context/ServicesContext/index.ts'
import PackageService from '~/services/PackageService.ts'

const ServicesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { identity } = useAuth()

  const packageRegistry = useMemo(() => {
    return identity ? new PackageRegistry(identity) : null
  }, [identity])

  const packageService = useMemo(() => {
    return identity ? new PackageService(identity) : null
  }, [identity])

  return <ServicesContext.Provider value={{ packageRegistry, packageService }}>{children}</ServicesContext.Provider>
}

export default ServicesProvider
