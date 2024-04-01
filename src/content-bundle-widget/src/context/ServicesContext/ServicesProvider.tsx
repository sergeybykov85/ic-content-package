import { type FC, type ReactNode, useCallback } from 'react'
// import { useAuth } from '~/context/AuthContext'
import { ServicesContext } from '~/context/ServicesContext/index.ts'
import WidgetService from '~/services/WidgetService.ts'
import BundlePackageService from '~/services/BundlePackageService.ts'

const ServicesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // const { identity } = useAuth()

  const initBundlePackageService = useCallback((packageId: string) => new BundlePackageService(packageId), [])

  return (
    <ServicesContext.Provider value={{ widgetService: new WidgetService(), initBundlePackageService }}>
      {children}
    </ServicesContext.Provider>
  )
}

export default ServicesProvider
