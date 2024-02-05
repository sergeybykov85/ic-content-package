import type { IDL } from '@dfinity/candid'
import type { ActorMethod, ActorSubclass } from '@dfinity/agent'
import { Actor, HttpAgent } from '@dfinity/agent'

const createActor = (
  idl: IDL.InterfaceFactory,
  canisterId: string,
  httpAgent?: HttpAgent,
): ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>> => {
  const agent = httpAgent || new HttpAgent({ host: 'http://127.0.0.1:4943/' })
  if (process.env.DFX_NETWORK !== 'ic') {
    // FIXME: Fix it to correct env
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
