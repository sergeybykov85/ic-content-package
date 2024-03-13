import { idlFactory as idl } from '~/../../declarations/package_registry'
import CanisterService from '~/services/CanisterService.ts'
import { Package } from '~/models/Package.ts'
import type { PackageDto } from '~/types/packageTypes.ts'

const PACKAGE_REGISTRY_CANISTER_ID = import.meta.env.VITE_PACKAGE_REGISTRY_CANISTER_ID

export default class PackageRegistryService extends CanisterService {
  constructor() {
    super(idl, PACKAGE_REGISTRY_CANISTER_ID)
  }

  public getRecentPackages = async (packageCapacity?: number, bundleCapacity?: number): Promise<Package[]> => {
    const response = (await this.actor.get_recent_packages(
      this.createOptionalParam(packageCapacity),
      this.createOptionalParam(bundleCapacity),
    )) as { package: PackageDto }[]

    return response.map(item => new Package(item.package))
  }
}
