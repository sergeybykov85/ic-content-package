import { idlFactory as idl } from '~/../../declarations/package_registry'
import type { PackageRaw, PackageTypes } from '~/types/packagesTypes.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { Package } from '~/models/Package.tsx'
import CanisterService from '~/models/CanisterService.ts'

const PACKAGE_REGISTRY_CANISTER_ID = import.meta.env.VITE_PACKAGE_REGISTRY_CANISTER_ID

export default class PackageRegistry extends CanisterService {
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, PACKAGE_REGISTRY_CANISTER_ID, identity)
  }
  public getMyPackages = async (principal: string): Promise<Package[]> => {
    const rawPackages = (await this.actor.get_packages_for_creator({
      identity_type: { ICP: null },
      identity_id: principal,
    })) as PackageRaw[]
    return rawPackages.map(i => new Package(i))
  }

  public getPackagesByType = async (type: PackageTypes): Promise<Package[]> => {
    const rawPackages = (await this.actor.get_packages_by_type({ [type]: null })) as PackageRaw[]
    return rawPackages.map(i => new Package(i))
  }
}
