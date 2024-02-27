import type { IDL } from '@dfinity/candid'
import type { Identity } from '@dfinity/agent'
import { Actor, type ActorMethod, type ActorSubclass, HttpAgent } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import type { CanisterResponse } from '~/types/globals.ts'

type ActorInstance = ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>>

export default class CanisterService {
  protected actor: ActorInstance
  constructor(idl: IDL.InterfaceFactory, canisterId: string, identity?: Identity | Secp256k1KeyIdentity) {
    this.actor = this.createActor(idl, canisterId, identity)
  }

  private createActor = (
    idl: IDL.InterfaceFactory,
    canisterId: string,
    identity?: Identity | Secp256k1KeyIdentity,
  ): ActorInstance => {
    const isLocal = import.meta.env.VITE_DFX_NETWORK !== 'ic'
    const host = isLocal ? import.meta.env.VITE_HOST : undefined
    const agent = new HttpAgent({ host, identity })

    if (isLocal) {
      agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running')
        console.error(err)
      })
    }
    return Actor.createActor(idl, {
      agent,
      canisterId,
    })
  }

  protected responseHandler = <T>(response: CanisterResponse<T>): T => {
    const { ok, err } = response
    if (err || ok === undefined) {
      throw err || new Error('Something went wrong')
    }
    return ok
  }

  protected createOptionalParam = <T>(value: T): T[] => {
    return value ? [value] : []
  }
}
