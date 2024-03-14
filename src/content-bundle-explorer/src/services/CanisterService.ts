import type { IDL } from '@dfinity/candid'
import { Actor, type ActorMethod, type ActorSubclass, HttpAgent } from '@dfinity/agent'
import type { CanisterResponse, IDENTITY_TYPES, IdentityRecord } from '~/types/globals.ts'

type ActorInstance = ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>>

export default class CanisterService {
  protected actor: ActorInstance
  constructor(idl: IDL.InterfaceFactory, canisterId: string) {
    this.actor = this.createActor(idl, canisterId)
  }

  private createActor = (idl: IDL.InterfaceFactory, canisterId: string): ActorInstance => {
    const isLocal = import.meta.env.VITE_DFX_NETWORK !== 'ic'
    const host = isLocal ? import.meta.env.VITE_HOST : undefined
    const agent = new HttpAgent({ host })

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

  protected createOptionalParam = <T>(value: T): NonNullable<T>[] => {
    return value ? [value] : []
  }

  protected createIdentityDto = (id: string, type: IDENTITY_TYPES): IdentityRecord => ({
    identity_id: id,
    identity_type: {
      [type]: null,
    },
  })
}
