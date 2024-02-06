import type { IDL } from '@dfinity/candid'
import type { ActorMethod, ActorSubclass, Identity } from '@dfinity/agent'
import { Actor, HttpAgent } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'

const createActor = (
  idl: IDL.InterfaceFactory,
  canisterId: string,
  identity?: Identity | Secp256k1KeyIdentity,
): ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>> => {
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

export default createActor
