import { useCallback, useEffect } from 'react'
import cookies from '~/utils/cookies.ts'
import { authClientState, isAuthenticatedState, PRINCIPAL_COOKIE_NAME, principalState } from './authStore.ts'
import { useRecoilState, useRecoilValue } from 'recoil'
import { AuthClient } from '@dfinity/auth-client'
import { enqueueSnackbar } from 'notistack'
import decodeIdentity from '~/utils/decodeIdentity.ts'

type UseAuth = () => {
  principal: string | undefined
  isAuthenticated: boolean
  login: (pem?: string) => void
  logout: () => void
}

const useAuth: UseAuth = () => {
  const isAuthenticated = useRecoilValue(isAuthenticatedState)
  const [authClient, setAuthClient] = useRecoilState(authClientState)
  const [principal, setPrincipal] = useRecoilState(principalState)

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

  const logout = useCallback(() => {
    setPrincipal(undefined)
    cookies.deleteCookie(PRINCIPAL_COOKIE_NAME)
    authClient?.logout()
  }, [authClient, setPrincipal])

  const loginOnSuccess = useCallback(
    (newPrincipal: string) => {
      cookies.setCookie(PRINCIPAL_COOKIE_NAME, newPrincipal, 60 * 60 * 24) // 24h
      setPrincipal(newPrincipal)
    },
    [setPrincipal],
  )

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

  return { login, logout, principal, isAuthenticated }
}

export default useAuth
