import type { FC, ReactNode } from 'react'
import { useContext } from 'react'
import { createContext, useCallback, useEffect, useState } from 'react'
import { AuthClient } from '@dfinity/auth-client'

interface AuthContext {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

export const authContext = createContext<AuthContext>({
  isAuthenticated: false,
  login: () => {
    return
  },
  logout: () => {
    return
  },
})
const { Provider } = authContext

export const useAuth = (): AuthContext => useContext(authContext)

export const AuthContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const initAuthClient = useCallback(async () => {
    try {
      const newAuthClient = await AuthClient.create()
      setAuthClient(newAuthClient)
    } catch (error) {
      console.error('AuthClient initiation error ===>', error)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const isAuth = await authClient?.isAuthenticated()
      setIsAuthenticated(Boolean(isAuth))
    } catch (error) {
      console.error('Authentication error ===>', error)
    }
  }, [authClient])

  useEffect(() => {
    if (!authClient) {
      initAuthClient().then(checkAuth)
    }
  }, [authClient, checkAuth, initAuthClient])

  const login = useCallback(async () => {
    if (authClient) {
      await authClient.login({
        /*
         * Chrome, Firefox: http://<canister_id>.localhost:4943
         * Safari: http://localhost:4943?canisterId=<canister_id>
         * */
        identityProvider:
          process.env.DFX_NETWORK === 'ic'
            ? 'https://identity.ic0.app'
            : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
        onSuccess: checkAuth,
        onError: error => {
          console.log('Login error', error)
          setIsAuthenticated(false)
        },
      })
    }
  }, [authClient, checkAuth])

  const logout = useCallback(() => {
    authClient?.logout({ returnTo: '/' }).then(() => {
      setIsAuthenticated(false)
    })
  }, [authClient])

  return <Provider value={{ isAuthenticated, login, logout }}>{children}</Provider>
}
