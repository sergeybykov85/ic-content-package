import type { ActorInstance } from '~/utils/createActor.ts'
import createActor from '~/utils/createActor.ts'
import { idlFactory as idl } from '~/../../declarations/package_service'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import type { DeployPackageParams, PackageTypes } from '~/types/packagesTypes.ts'
import type { CanisterResponse } from '~/types/globals.ts'

const PACKAGE_SERVICE_CANISTER_ID = import.meta.env.VITE_PACKAGE_SERVICE_CANISTER_ID

export default class PackageService {
  private actor: ActorInstance
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    this.actor = createActor(idl, PACKAGE_SERVICE_CANISTER_ID, identity)
  }

  public deployPackage = async (type: PackageTypes, params: DeployPackageParams): Promise<CanisterResponse<string>> => {
    return (await this.actor[`deploy_${type.toLowerCase()}_package`](
      { ...params, logo: params.logo || [] },
      [],
    )) as CanisterResponse<string>
  }
}
