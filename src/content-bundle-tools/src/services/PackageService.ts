import { idlFactory as idl } from '~/../../declarations/package_service'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import type { DeployPackageParams, PackageTypes } from '~/types/packagesTypes.ts'
import type { CanisterResponse } from '~/types/globals.ts'
import CanisterService from '~/models/CanisterService.ts'

const PACKAGE_SERVICE_CANISTER_ID = import.meta.env.VITE_PACKAGE_SERVICE_CANISTER_ID

export default class PackageService extends CanisterService {
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, PACKAGE_SERVICE_CANISTER_ID, identity)
  }

  public deployPackage = async (type: PackageTypes, params: DeployPackageParams): Promise<string> => {
    const { name, description } = params
    // prettier-ignore
    const logo = params.logo ? [
      {
        value: [...params.logo.value],
        content_type: params.logo.type ? [params.logo.type] : [],
      },
    ] : []

    const response = (await this.actor[`deploy_${type.toLowerCase()}_package`](
      { name, description, logo },
      [],
    )) as CanisterResponse<string>

    return this.responseHandler(response)
  }
}
