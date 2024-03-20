import CanisterService from '~/services/CanisterService.ts'
import { idlFactory as idl } from '~/../../declarations/bundle_package'
import type { DataSegmentationDto, PackageWithOwnerDto } from '~/types/packageTypes.ts'
import PackageWithOwner from '~/models/PackageWithOwner.ts'
import PaginatedList from '~/models/PaginatedList.ts'
import Bundle from '~/models/Bundle.ts'
import type { PaginatedListResponse } from '~/types/globals.ts'
import type { BundleDto, BundleFilters } from '~/types/bundleTypes.ts'

export default class BundlePackageService extends CanisterService {
  constructor(packageId: string) {
    super(idl, packageId)
  }

  public getPackageDetails = async (): Promise<PackageWithOwner> => {
    const response = (await this.actor.get_details()) as PackageWithOwnerDto
    return new PackageWithOwner(response)
  }

  public getDataSegmentation = async (): Promise<DataSegmentationDto> => {
    return (await this.actor.get_data_segmentation()) as DataSegmentationDto
  }

  public getBundlesPaginatedList = async (
    page: number,
    pageSize: number,
    filters?: BundleFilters,
  ): Promise<PaginatedList<Bundle>> => {
    const startIndex = page * pageSize
    const { total_supply, items } = (await this.actor.get_bundle_refs_page(
      startIndex,
      pageSize,
      filters || [], // search criteria
    )) as PaginatedListResponse<BundleDto>
    return new PaginatedList(
      { page, pageSize, totalItems: Number(total_supply) },
      items.map(i => new Bundle(i)),
    )
  }
}
