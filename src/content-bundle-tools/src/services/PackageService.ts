import { idlFactory as idl } from '~/declarations/package_service/package_service.did.js'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { type DeployPackageMetadata, type DeployPackageOptions, PACKAGE_TYPES } from '~/types/packagesTypes.ts'
import type { CanisterResponse } from '~/types/globals.ts'
import CanisterService from '~/models/CanisterService.ts'

const PACKAGE_SERVICE_CANISTER_ID = import.meta.env.VITE_PACKAGE_SERVICE_CANISTER_ID

export default class PackageService extends CanisterService {
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, PACKAGE_SERVICE_CANISTER_ID, identity)
  }

  public deployPackage = async (
    type: PACKAGE_TYPES,
    metadata: DeployPackageMetadata,
    options?: DeployPackageOptions,
    contributors?: string[],
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

    let response: CanisterResponse<string>

    if (type === PACKAGE_TYPES.Shared) {
      response = (await this.actor[`deploy_${type.toLowerCase()}_package`](
        { name, description, logo },
        (contributors || []).map(item => this.createIdentityDto(item)),
        packageOptions,
      )) as CanisterResponse<string>
    } else {
      response = (await this.actor[`deploy_${type.toLowerCase()}_package`](
        { name, description, logo },
        packageOptions,
      )) as CanisterResponse<string>
    }

    return this.responseHandler(response)
  }

  public getActivityBy = async (identityId: string): Promise<{ allowance: number; deployedPackagesNumber: number }> => {
    const { allowance, deployed_packages } = (await this.actor.activity_by(this.createIdentityDto(identityId))) as {
      allowance: bigint
      deployed_packages: string[]
    }
    return {
      allowance: Number(allowance),
      deployedPackagesNumber: deployed_packages.length,
    }
  }

  public removeEmptyPackage = async (packageId: string): Promise<void> => {
    const response = (await this.actor.remove_empty_package(packageId, [])) as CanisterResponse<string>
    this.responseHandler(response)
  }
}
