import createActor, { ActorInstance } from '~/utils/createActor.ts'
import { idlFactory as idl } from '~/../../declarations/package_registry'
import { Package } from '~/types/packagesTypes.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'

const PACKAGE_REGISTRY_CANISTER_ID = import.meta.env.VITE_PACKAGE_REGISTRY_CANISTER_ID

export default class PackageRegistry {
  private actor: ActorInstance
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    this.actor = createActor(idl, PACKAGE_REGISTRY_CANISTER_ID, identity)
  }

  public getMyPackages = async (principal: string): Promise<Package[]> => {
    return (await this.actor.get_packages_for_creator({
      identity_type: { ICP: null },
      identity_id: principal,
    })) as Package[]
  }
}
