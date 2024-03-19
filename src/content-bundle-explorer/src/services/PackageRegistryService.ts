import { idlFactory as idl } from '~/../../declarations/package_registry'
import CanisterService from '~/services/CanisterService.ts'
import { Package } from '~/models/Package.ts'
import type { DataSegmentationDto, Filters, FiltersDto, PackageDto } from '~/types/packageTypes.ts'
import { IDENTITY_TYPES, type PaginatedListResponse } from '~/types/globals.ts'
import PaginatedList from '~/models/PaginatedList.ts'
import countries from '~/assets/countries.json'

const COUNTRIES = countries as Record<string, string>

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

  public getPackagesByFilters = async (
    page: number,
    pageSize: number,
    filters: Filters,
  ): Promise<PaginatedList<Package>> => {
    const startIndex = page * pageSize
    const countryCode = Object.keys(COUNTRIES).find(key => COUNTRIES[key] === filters.countryCode)
    const filtersDto: FiltersDto = {
      intersect: true,
      country_code: this.createOptionalParam(countryCode),
      tag: this.createOptionalParam(filters.tag),
      classification: this.createOptionalParam(filters.classification),
      kind: filters.kind ? [{ [filters.kind]: null }] : [],
      creator: filters.creator ? [this.createIdentityDto(filters.creator, IDENTITY_TYPES.ICP)] : [],
    }
    const { items, total_supply } = (await this.actor.get_packages_by_criteria(
      startIndex,
      pageSize,
      filtersDto,
    )) as PaginatedListResponse<PackageDto>
    return new PaginatedList(
      { page, pageSize, totalItems: Number(total_supply) },
      items.map(i => new Package(i)),
    )
  }

  public getDataSegmentation = async (): Promise<DataSegmentationDto> => {
    const response = (await this.actor.get_data_segmentation()) as DataSegmentationDto
    return {
      ...response,
      countries: response.countries.map(i => COUNTRIES[i] || i),
    }
  }
}
