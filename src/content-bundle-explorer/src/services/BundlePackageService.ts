import CanisterService from '~/services/CanisterService.ts'
import { idlFactory as idl } from '~/../../declarations/bundle_package'
import type { DataSegmentationDto, PackageWithOwnerDto } from '~/types/packageTypes.ts'
import PackageWithOwner from '~/models/PackageWithOwner.ts'

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
}
