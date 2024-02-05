import { atom, selector } from 'recoil'
import type { AuthClient } from '@dfinity/auth-client'
import cookies from '~/utils/cookies.ts'

export const PRINCIPAL_COOKIE_NAME = 'principal'

export const authClientState = atom<AuthClient | null>({
  key: 'authClientState',
  default: null,
})

export const principalState = atom({
  key: 'principalState',
  default: cookies.getCookie(PRINCIPAL_COOKIE_NAME),
})

export const isAuthenticatedState = selector({
  key: 'isAuthenticatedState',
  get: ({ get }) => {
    return Boolean(get(principalState))
  },
})
