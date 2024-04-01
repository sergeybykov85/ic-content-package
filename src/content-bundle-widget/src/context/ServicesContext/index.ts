import { createContext, useContext } from 'react'
import WidgetService from '~/services/WidgetService.ts'
import type BundlePackageService from '~/services/BundlePackageService.ts'

export interface ServicesContext {
  widgetService: WidgetService
  initBundlePackageService: ((packageId: string) => BundlePackageService) | null
}

export const ServicesContext = createContext<ServicesContext>({
  widgetService: new WidgetService(),
  initBundlePackageService: null,
})

export const useServices = (): ServicesContext => useContext(ServicesContext)

export { default } from './ServicesProvider.tsx'
