import CanisterService from '~/services/CanisterService.ts'
import { idlFactory as idl } from '~/../../declarations/bundle_package'
import type { DataSegmentationDto, PackageWithOwnerDto } from '~/types/packageTypes.ts'
import PackageWithOwner from '~/models/PackageWithOwner.ts'
import PaginatedList from '~/models/PaginatedList.ts'
import Bundle from '~/models/Bundle.ts'
import type { CanisterResponse, PaginatedListResponse, VariantType } from '~/types/globals.ts'
import { IDENTITY_TYPES } from '~/types/globals.ts'
import type { BundleDetailsDto, BundleDto, BundleFilters, BundleFiltersDto } from '~/types/bundleTypes.ts'
import countries from '~/assets/countries.json'
import type { ADDITIONAL_DATA_GROUPS, AdditionalDataDto } from '~/types/bundleDataTypes.ts'
import AdditionalDataSection from '~/models/AdditionalDataSection.ts'

const COUNTRIES = countries as Record<string, string>

export default class BundlePackageService extends CanisterService {
  constructor(packageId: string) {
    super(idl, packageId)
  }

  public getPackageDetails = async (): Promise<PackageWithOwner> => {
    const response = (await this.actor.get_details()) as PackageWithOwnerDto
    return new PackageWithOwner(response)
  }

  public getDataSegmentation = async (): Promise<DataSegmentationDto> => {
    const response = (await this.actor.get_data_segmentation()) as DataSegmentationDto
    return {
      ...response,
      countries: response.countries.map(i => COUNTRIES[i] || i),
    }
  }

  public getBundlesPaginatedList = async (
    page: number,
    pageSize: number,
    filters: BundleFilters = {},
  ): Promise<PaginatedList<Bundle>> => {
    const startIndex = page * pageSize
    const countryCode = Object.keys(COUNTRIES).find(key => COUNTRIES[key] === filters.countryCode)
    const filtersDto: BundleFiltersDto = {
      intersect: true,
      country_code: this.createOptionalParam(countryCode),
      tag: this.createOptionalParam(filters.tag),
      classification: this.createOptionalParam(filters.classification),
      creator: filters.creator ? [this.createIdentityDto(filters.creator, IDENTITY_TYPES.ICP)] : [],
    }
    const emptyFilters = Object.values(filters).every(item => Boolean(!item))
    const { total_supply, items } = (await this.actor.get_bundle_refs_page(
      startIndex,
      pageSize,
      emptyFilters ? [] : [filtersDto], // search criteria
    )) as PaginatedListResponse<BundleDto>
    return new PaginatedList(
      { page, pageSize, totalItems: Number(total_supply) },
      items.map(i => new Bundle(i)),
    )
  }

  public getBundle = async (bundleId: string): Promise<Bundle> => {
    const response = (await this.actor.get_bundle(bundleId)) as CanisterResponse<BundleDetailsDto>
    return new Bundle(this.responseHandler(response))
  }

  public getBundleSupportedDataGroups = async (): Promise<ADDITIONAL_DATA_GROUPS[]> => {
    const response = (await this.actor.get_supported_groups()) as VariantType<ADDITIONAL_DATA_GROUPS>[]
    return response.map(item => Object.keys(item)[0]) as ADDITIONAL_DATA_GROUPS[]
  }

  public getBundleAdditionalData = async (
    bundleId: string,
    type: ADDITIONAL_DATA_GROUPS,
  ): Promise<{ url: string; sections: AdditionalDataSection[] }> => {
    const response = (await this.actor.get_bundle_data(bundleId, {
      [type]: null,
    })) as CanisterResponse<AdditionalDataDto>
    const data = this.responseHandler(response)
    return {
      url: data.data_path.url,
      sections: data.sections.map(item => new AdditionalDataSection(item)),
    }
  }
}
