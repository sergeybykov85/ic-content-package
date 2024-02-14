import { idlFactory as idl } from '~/../../declarations/package_service'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import type { DeployPackageOptions, DeployPackageMetadata, PackageTypes } from '~/types/packagesTypes.ts'
import type { CanisterResponse } from '~/types/globals.ts'
import CanisterService from '~/models/CanisterService.ts'

const PACKAGE_SERVICE_CANISTER_ID = import.meta.env.VITE_PACKAGE_SERVICE_CANISTER_ID

export default class PackageService extends CanisterService {
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, PACKAGE_SERVICE_CANISTER_ID, identity)
  }

  public deployPackage = async (
    type: PackageTypes,
    metadata: DeployPackageMetadata,
    options?: DeployPackageOptions,
  ): Promise<string> => {
    const { name, description } = metadata

    const logo = []
    if (metadata.logo) {
      logo.push({
        value: [...metadata.logo.value],
        content_type: this.createOptionalParam(metadata.logo.type),
      })
    }

    const packageOptions = []
    if (options) {
      packageOptions.push({
        max_tag_supply: this.createOptionalParam(options.maxTagSupply),
        max_supply: this.createOptionalParam(options.maxSupply),
        max_creator_supply: this.createOptionalParam(options.maxCreatorSupply),
        identifier_type: options.identifierType ? [{ [options.identifierType]: null }] : [],
      })
    }

    console.log('packageOptions', packageOptions)

    const response = (await this.actor[`deploy_${type.toLowerCase()}_package`](
      { name, description, logo },
      packageOptions,
    )) as CanisterResponse<string>

    return this.responseHandler(response)
  }
}
