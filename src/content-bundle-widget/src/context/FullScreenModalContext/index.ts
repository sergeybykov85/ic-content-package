import { createContext, type ReactNode, useContext } from 'react'

export interface FullScreenModalContext {
  setContent: (content: ReactNode) => void
}

export const FullScreenModalContext = createContext<FullScreenModalContext>({
  setContent: () => {},
})

export const useFullScreenModal = (): FullScreenModalContext => useContext(FullScreenModalContext)

export { default } from './FullScreenModalProvider.tsx'
