import { atom, selector } from 'recoil'
import type { AuthClient } from '@dfinity/auth-client'
import type { Identity } from '@dfinity/agent'
import type { AUTH_TYPE } from '~/recoil/auth/authTypes.ts'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'

export const authClientState = atom<AuthClient | null>({
  key: 'authClientState',
  default: null,
  dangerouslyAllowMutability: true,
})

export const authTypeState = atom<AUTH_TYPE | undefined>({
  key: 'authTypeState',
  default: undefined,
})

export const identityStore = atom<Identity | Secp256k1KeyIdentity | null>({
  key: 'identityStore',
  default: null,
  dangerouslyAllowMutability: true,
})

export const principalState = selector({
  key: 'principalState',
  get: ({ get }) => get(identityStore)?.getPrincipal().toString(),
})

export const isAuthenticatedState = selector({
  key: 'isAuthenticatedState',
  get: ({ get }) => {
    return Boolean(get(identityStore))
  },
})
