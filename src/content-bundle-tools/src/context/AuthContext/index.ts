import { createContext, useContext } from 'react'

export interface AuthContext {
  principal: string | undefined
  isAuthenticated: boolean
  login: (pem?: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContext>({
  principal: undefined,
  isAuthenticated: false,
  login: () => {
    return
  },
  logout: () => {
    return
  },
})

export const useAuth = (): AuthContext => useContext(AuthContext)
