import { useCallback, useEffect, useState, useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import cookies from '~/utils/cookies'
import decodeIdentity from '~/utils/decodeIdentity'
import { enqueueSnackbar } from 'notistack'
import { AuthContext } from './'

const PRINCIPAL_COOKIE_NAME = 'principal'

const AuthContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [principal, setPrincipal] = useState<AuthContext['principal']>(cookies.getCookie(PRINCIPAL_COOKIE_NAME))
  const isAuthenticated = useMemo(() => Boolean(principal), [principal])

  const initAuthClient = useCallback(async () => {
    try {
      const newAuthClient = await AuthClient.create()
      setAuthClient(newAuthClient)
    } catch (error) {
      enqueueSnackbar(`AuthClient initiation error: ${error}`, { variant: 'error' })
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
      try {
        const identity = decodeIdentity(pemFile)
        loginOnSuccess(identity.getPrincipal().toText())
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Decode PEM file failed'
        enqueueSnackbar(`Login error: ${error}`, { variant: 'error', style: { whiteSpace: 'pre-line' } })
      }
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
          enqueueSnackbar(`Login error: ${error}`, { variant: 'error' })
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

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, principal }}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
