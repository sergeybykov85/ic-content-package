import { createContext, useContext } from 'react'

export interface FullScreenLoadingContext {
  setLoading: (value: boolean) => void
  loading: boolean
}

export const FullScreenLoadingContext = createContext<FullScreenLoadingContext>({
  setLoading: () => {},
  loading: false,
})

export const useFullScreenLoading = (): FullScreenLoadingContext => useContext(FullScreenLoadingContext)

export { default } from './FullScreenLoadingProvider.tsx'
