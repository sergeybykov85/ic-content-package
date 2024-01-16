import { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import cookies from 'utils/cookies'
import decodeIdentity from 'utils/decodeIdentity'

interface AuthContext {
  isAuthenticated: boolean
  login: (pem?: string) => void
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

const PRINCIPAL_COOKIE_NAME = 'principal'

export const AuthContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [principal, setPrincipal] = useState<string | undefined>(cookies.getCookie(PRINCIPAL_COOKIE_NAME))
  const isAuthenticated = useMemo(() => Boolean(principal), [principal])

  const initAuthClient = useCallback(async () => {
    try {
      const newAuthClient = await AuthClient.create()
      setAuthClient(newAuthClient)
    } catch (error) {
      console.error('AuthClient initiation error ===>', error)
    }
  }, [])

  useEffect(() => {
    if (!authClient) {
      void initAuthClient()
    }
  }, [authClient, initAuthClient])

  const logout = useCallback(() => {
    setPrincipal(undefined)
    cookies.deleteCookie(PRINCIPAL_COOKIE_NAME)
    authClient?.logout()
  }, [authClient])

  const loginOnSuccess = useCallback((newPrincipal: string) => {
    cookies.setCookie(PRINCIPAL_COOKIE_NAME, newPrincipal, 60 * 60 * 24) // 24h
    setPrincipal(newPrincipal)
  }, [])

  const loginWithPem = useCallback(
    (pemFile: string) => {
      const identity = decodeIdentity(pemFile)
      loginOnSuccess(identity.getPrincipal().toText())
    },
    [loginOnSuccess],
  )

  const loginWithII = useCallback(async () => {
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
        onSuccess: () => {
          loginOnSuccess(authClient.getIdentity().getPrincipal().toText())
        },
        onError: error => {
          console.error('Login error', error)
          logout()
        },
      })
    }
  }, [authClient, loginOnSuccess, logout])

  const login = useCallback(
    (pemFile?: string) => {
      if (pemFile) {
        loginWithPem(pemFile)
      } else {
        void loginWithII()
      }
    },
    [loginWithII, loginWithPem],
  )

  return <Provider value={{ isAuthenticated, login, logout }}>{children}</Provider>
}
