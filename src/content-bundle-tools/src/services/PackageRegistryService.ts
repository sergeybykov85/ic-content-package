import { idlFactory as idl } from '~/../../declarations/package_registry'
import type { PackageDto, PackageTypes } from '~/types/packagesTypes.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { Package } from '~/models/Package.ts'
import CanisterService from '~/models/CanisterService.ts'
import type { CanisterResponse } from '~/types/globals.ts'
import { Principal } from '@dfinity/principal'

const PACKAGE_REGISTRY_CANISTER_ID = import.meta.env.VITE_PACKAGE_REGISTRY_CANISTER_ID

export default class PackageRegistryService extends CanisterService {
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, PACKAGE_REGISTRY_CANISTER_ID, identity)
  }
  public getMyPackages = async (principal: string): Promise<Package[]> => {
    const rawPackages = (await this.actor.get_packages_for_creator({
      identity_type: { ICP: null },
      identity_id: principal,
    })) as PackageDto[]
    return rawPackages.map(i => new Package(i))
  }

  public getPackagesByType = async (type: PackageTypes): Promise<Package[]> => {
    const rawPackages = (await this.actor.get_packages_by_type({ [type]: null })) as PackageDto[]
    return rawPackages.map(i => new Package(i))
  }

  public refreshPackage = async (packageId: string): Promise<void> => {
    const principal = Principal.fromText(packageId)
    const response = (await this.actor.refresh_package(principal)) as CanisterResponse<void>
    this.responseHandler(response)
  }
}
