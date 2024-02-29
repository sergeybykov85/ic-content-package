import CanisterService from '~/models/CanisterService.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { idlFactory as idl } from '~/../../declarations/bundle_package'
import type { DataSegmentationDto, DeployPackageMetadata, PackageDetailsDto } from '~/types/packagesTypes.ts'
import PackageDetails from '~/models/PackageDetails.ts'
import Bundle from '~/models/Bundle.ts'
import type {
  BundleDetailsDto,
  BundleDto,
  AdditionalDataDto,
  ADDITIONAL_DATA_TYPES,
  CreateBundleParams,
} from '~/types/bundleTypes.ts'
import PaginatedList from '~/models/PaginatedList.ts'
import type { CanisterResponse, PaginatedListResponse, VariantType } from '~/types/globals.ts'
import AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import { Principal } from '@dfinity/principal'

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
      [], // search criteria
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

  public getBundleDataGroups = async (bundleId: string): Promise<ADDITIONAL_DATA_TYPES[]> => {
    const response = (await this.actor.get_bundle_data_groups(bundleId)) as CanisterResponse<
      VariantType<ADDITIONAL_DATA_TYPES>[]
    >
    return this.responseHandler(response).map(item => Object.keys(item)[0]) as ADDITIONAL_DATA_TYPES[]
  }

  public getBundleAdditionalData = async (
    bundleId: string,
    type: ADDITIONAL_DATA_TYPES,
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

  public deleteEmptyBundle = async (bundleId: string): Promise<void> => {
    await this.actor.remove_empty_bundle(bundleId)
  }

  public createBundle = async (bundleData: CreateBundleParams): Promise<string> => {
    const { logo: imgData, ...data } = bundleData

    const logo = []
    if (imgData) {
      logo.push({
        value: [...imgData.value],
        content_type: this.createOptionalParam(imgData.type),
      })
    }

    const response = (await this.actor.register_bundle({ ...data, logo })) as CanisterResponse<string>
    return this.responseHandler(response)
  }

  public getSupportedClassifications = async (): Promise<string[]> => {
    return (await this.actor.get_supported_classifications()) as string[]
  }

  public updatePackageMetadata = async ({
    logo: imgData,
    name,
    description,
  }: Partial<DeployPackageMetadata>): Promise<void> => {
    const logo = []
    if (imgData) {
      logo.push({
        value: [...imgData.value],
        content_type: this.createOptionalParam(imgData.type),
      })
    }
    const response = (await this.actor.update_metadata({
      name: this.createOptionalParam(name),
      description: this.createOptionalParam(description),
      logo,
    })) as CanisterResponse<void>

    this.responseHandler(response)
  }

  public checkPossibilityToCreateBundle = async (principalString: string): Promise<boolean> => {
    const principal = Principal.fromText(principalString)
    return (await this.actor.contribute_opportunity_for(principal)) as boolean
  }
}
