import CanisterService from '~/models/CanisterService.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { idlFactory as idl } from '~/../../declarations/bundle_package'
import type { CanisterResponse } from '~/types/globals.ts'
import type { PackageDetailsDto } from '~/types/packagesTypes.ts'
import PackageDetails from '~/models/PackageDetails.ts'

export default class BundlePackageService extends CanisterService {
  constructor(packageId: string, identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, packageId, identity)
  }

  public getPackageDetails = async (packageId: string): Promise<PackageDetails> => {
    const response = (await this.actor.get_details(packageId)) as CanisterResponse<PackageDetailsDto>
    return new PackageDetails(this.responseHandler(response))
  }
}
