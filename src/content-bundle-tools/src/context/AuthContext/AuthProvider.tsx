import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { enqueueSnackbar } from 'notistack'
import cookies from '~/utils/cookies.ts'
import identityJsonHelper from '~/utils/identityJsonHelper.ts'
import decodeIdentity from '~/utils/decodeIdentity.ts'
import {
  AUTH_EXPIRATION_TIME,
  AUTH_TYPE,
  COOKIE_AUTH_TYPE_NAME,
  COOKIE_IDENTITY_NAME,
  IdentityInstance,
} from '~/types/authTypes.ts'
import { AuthContext } from './index.ts'

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [identity, setIdentity] = useState<IdentityInstance | null>(null)
  const [authType, setAuthType] = useState<AUTH_TYPE | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const isAuthenticated = useMemo(() => Boolean(identity), [identity])

  const principal = useMemo(() => {
    return identity?.getPrincipal().toString()
  }, [identity])

  useEffect(() => {
    if (!authClient) {
      AuthClient.create()
        .then(newAuthClient => {
          setAuthClient(newAuthClient)
        })
        .catch(error => {
          enqueueSnackbar(`AuthClient initiation error: ${error}`, { variant: 'error' })
        })
    }
  }, [authClient, setAuthClient])

  useEffect(() => {
    if (!authType) {
      const authTypeFromCookie = cookies.getCookie(COOKIE_AUTH_TYPE_NAME) as AUTH_TYPE
      if (Object.values(AUTH_TYPE).includes(authTypeFromCookie)) {
        setAuthType(authTypeFromCookie)
      }
    }
  }, [authClient, setAuthType])

  const checkIIAuth = useCallback(() => {
    authClient
      ?.isAuthenticated()
      .then(res => {
        if (res) {
          setIdentity(authClient.getIdentity())
        }
      })
      .finally(() => setAuthReady(true))
  }, [authClient, setIdentity])

  const checkPEMAuth = useCallback(() => {
    const identityFromCookie = cookies.getCookie(COOKIE_IDENTITY_NAME)
    const restoredIdentity = identityJsonHelper.fromJSON(identityFromCookie)
    setIdentity(restoredIdentity || null)
    setAuthReady(true)
  }, [setIdentity])

  useEffect(() => {
    if (authClient && authType && !identity) {
      switch (authType) {
        case AUTH_TYPE.IC:
          checkIIAuth()
          break
        case AUTH_TYPE.PEM:
          checkPEMAuth()
          break
      }
    }
  }, [authClient, authType, checkIIAuth, checkPEMAuth, identity])

  const logout = useCallback(() => {
    setIdentity(null)
    setAuthType(null)
    cookies.deleteCookie(COOKIE_IDENTITY_NAME)
    cookies.deleteCookie(COOKIE_AUTH_TYPE_NAME)
    authClient?.logout()
  }, [authClient, setAuthType, setIdentity])

  const loginWithPem = useCallback(
    (pemFile: string) => {
      try {
        const newIdentity = decodeIdentity(pemFile)
        setIdentity(newIdentity)
        setAuthType(AUTH_TYPE.PEM)
        cookies.setCookie(COOKIE_AUTH_TYPE_NAME, AUTH_TYPE.PEM, AUTH_EXPIRATION_TIME)
        cookies.setCookie(COOKIE_IDENTITY_NAME, identityJsonHelper.toJSON(newIdentity), AUTH_EXPIRATION_TIME)
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Decode PEM file failed'
        enqueueSnackbar(`Login error: ${error}`, { variant: 'error', style: { whiteSpace: 'pre-line' } })
      }
    },
    [setAuthType, setIdentity],
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
        maxTimeToLive: BigInt(AUTH_EXPIRATION_TIME) * 10n ** 9n, // from seconds to nanoseconds
        onSuccess: () => {
          setAuthType(AUTH_TYPE.IC)
          cookies.setCookie(COOKIE_AUTH_TYPE_NAME, AUTH_TYPE.IC, AUTH_EXPIRATION_TIME)
          setIdentity(authClient.getIdentity())
        },
        onError: error => {
          enqueueSnackbar(`Login error: ${error}`, { variant: 'error' })
          logout()
        },
      })
    }
  }, [authClient, logout, setAuthType, setIdentity])

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

  return (
    <AuthContext.Provider value={{ login, logout, principal, identity, isAuthenticated, authReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
