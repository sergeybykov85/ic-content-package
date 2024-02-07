import { FC, ReactNode, useMemo } from 'react'
import { useAuth } from '~/context/AuthContext'
import PackageRegistry from '~/services/PackageRegistry.ts'
import { ServicesContext } from '~/context/ServicesContext/index.ts'

const ServicesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { identity } = useAuth()

  const packageRegistry = useMemo(() => {
    return identity ? new PackageRegistry(identity) : null
  }, [identity])

  return <ServicesContext.Provider value={{ packageRegistry }}>{children}</ServicesContext.Provider>
}

export default ServicesProvider