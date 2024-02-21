import CanisterService from '~/models/CanisterService.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { idlFactory as idl } from '~/../../declarations/bundle_package'
import type { DataSegmentationDto, PackageDetailsDto } from '~/types/packagesTypes.ts'
import PackageDetails from '~/models/PackageDetails.ts'
import Bundle from '~/models/Bundle.ts'
import type { BundleDetailsDto, BundleDto, PoiDataDto } from '~/types/bundleTypes.ts'
import { DATA_GROUPS } from '~/types/bundleTypes.ts'
import PaginatedList from '~/models/PaginatedList.ts'
import type { CanisterResponse, PaginatedListResponse, VariantType } from '~/types/globals.ts'
import PoiSection from '~/models/PoiSection.ts'

export default class BundlePackageService extends CanisterService {
  constructor(packageId: string, identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, packageId, identity)
  }

  public getPackageDetails = async (): Promise<PackageDetails> => {
    const response = (await this.actor.get_details()) as PackageDetailsDto
    return new PackageDetails(response)
  }

  public getDataSegmentation = async (): Promise<DataSegmentationDto> => {
    return (await this.actor.get_data_segmentation()) as DataSegmentationDto
  }

  public getBundlesPaginatedList = async (page: number, pageSize: number): Promise<PaginatedList<Bundle>> => {
    const startIndex = page * pageSize
    const { total_supply, items } = (await this.actor.get_bundle_refs_page(
      startIndex,
      pageSize,
    )) as PaginatedListResponse<BundleDto>
    return new PaginatedList(
      { page, pageSize, totalItems: Number(total_supply) },
      items.map(i => new Bundle(i)),
    )
  }

  public getBundle = async (bundleId: string): Promise<Bundle> => {
    const response = (await this.actor.get_bundle(bundleId)) as CanisterResponse<BundleDetailsDto>
    console.log(response)
    return new Bundle(this.responseHandler(response))
  }

  public getBundleDataGroups = async (bundleId: string): Promise<DATA_GROUPS[]> => {
    const response = (await this.actor.get_bundle_data_groups(bundleId)) as CanisterResponse<VariantType<DATA_GROUPS>[]>
    return this.responseHandler(response).map(item => Object.keys(item)[0]) as DATA_GROUPS[]
  }

  private getBundleData = async (bundleId: string, dataGroup: DATA_GROUPS): Promise<unknown> => {
    const response = (await this.actor.get_bundle_data(bundleId, { [dataGroup]: null })) as CanisterResponse<unknown>
    return this.responseHandler(response)
  }

  public getPoiSections = async (bundleId: string): Promise<PoiSection[]> => {
    const response = (await this.getBundleData(bundleId, DATA_GROUPS.POI)) as PoiDataDto
    console.log(response)
    return response.sections.map(item => new PoiSection(item))
  }
}
