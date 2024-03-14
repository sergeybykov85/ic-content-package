import { idlFactory as idl } from '~/../../declarations/package_registry'
import CanisterService from '~/services/CanisterService.ts'
import { Package } from '~/models/Package.ts'
import type { Filters, FiltersDto, PackageDto } from '~/types/packageTypes.ts'
import { IDENTITY_TYPES, type PaginatedListResponse } from '~/types/globals.ts'

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

  getPackagesByFilters = async (page: number, pageSize: number, filters: Filters): Promise<Package[]> => {
    const startIndex = page * pageSize
    const filtersDto: FiltersDto = {
      intersect: true,
      country_code: this.createOptionalParam(filters.countryCode),
      tag: this.createOptionalParam(filters.tag),
      classification: this.createOptionalParam(filters.classification),
      kind: filters.kind ? [{ [filters.kind]: null }] : [],
      creator: filters.creator ? [this.createIdentityDto(filters.creator, IDENTITY_TYPES.ICP)] : [],
    }
    const { items } = (await this.actor.get_packages_by_criteria(
      startIndex,
      pageSize,
      filtersDto,
    )) as PaginatedListResponse<PackageDto>
    return items.map(item => new Package(item))
  }
}
