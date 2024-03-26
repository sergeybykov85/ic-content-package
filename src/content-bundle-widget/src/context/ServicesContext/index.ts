import { createContext, useContext } from 'react'
import WidgetService from '~/services/WidgetService.ts'

export interface ServicesContext {
  widgetService: WidgetService
}

export const ServicesContext = createContext<ServicesContext>({
  widgetService: new WidgetService(),
})

export const useServices = (): ServicesContext => useContext(ServicesContext)

export { default } from './ServicesProvider.tsx'
