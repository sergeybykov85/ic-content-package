import type { FC, ReactNode } from 'react'
// import { useAuth } from '~/context/AuthContext'
import { ServicesContext } from '~/context/ServicesContext/index.ts'
import WidgetService from '~/services/WidgetService.ts'

const ServicesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // const { identity } = useAuth()

  return <ServicesContext.Provider value={{ widgetService: new WidgetService() }}>{children}</ServicesContext.Provider>
}

export default ServicesProvider
