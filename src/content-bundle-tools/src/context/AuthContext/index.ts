import { createContext, useContext } from 'react'
import type { IdentityInstance } from '~/types/authTypes.ts'

export interface AuthContext {
  principal: string | undefined
  identity: IdentityInstance | null
  isAuthenticated: boolean
  login: (pem?: string) => void
  logout: () => void
  authReady: boolean
}

export const AuthContext = createContext<AuthContext>({
  principal: undefined,
  identity: null,
  isAuthenticated: false,
  authReady: false,
  login: () => {
    return
  },
  logout: () => {
    return
  },
})

export const useAuth = (): AuthContext => useContext(AuthContext)

export { default } from './AuthProvider.tsx'
