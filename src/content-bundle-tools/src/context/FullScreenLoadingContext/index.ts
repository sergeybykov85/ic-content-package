import { createContext, useContext } from 'react'

export interface FullScreenLoadingContext {
  setLoading: (value: boolean) => void
}

export const FullScreenLoadingContext = createContext<FullScreenLoadingContext>({
  setLoading: () => {},
})

export const useFullScreenLoading = (): FullScreenLoadingContext => useContext(FullScreenLoadingContext)

export { default } from './FullScreenLoadingProvider.tsx'
