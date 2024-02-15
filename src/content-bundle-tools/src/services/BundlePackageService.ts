import CanisterService from '~/models/CanisterService.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { idlFactory as idl } from '~/../../declarations/bundle_package'
import type { PackageDetailsDto } from '~/types/packagesTypes.ts'
import PackageDetails from '~/models/PackageDetails.ts'
import Bundle from '~/models/Bundle.ts'
import type { BundleDto } from '~/types/bundleTypes.ts'
import PaginatedList from '~/models/PaginatedList.ts'
import type { PaginatedListResponse } from '~/types/globals.ts'

export default class BundlePackageService extends CanisterService {
  constructor(packageId: string, identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, packageId, identity)
  }

  public getPackageDetails = async (): Promise<PackageDetails> => {
    const response = (await this.actor.get_details()) as PackageDetailsDto
    return new PackageDetails(response)
  }

  public getBundlesPaginatedList = async (page: number, pageSize: number): Promise<PaginatedList<Bundle>> => {
    const startIndex = page * pageSize
    const limit = startIndex + pageSize
    const { total_supply, items } = (await this.actor.get_bundle_refs_page(
      startIndex,
      limit,
    )) as PaginatedListResponse<BundleDto>
    console.log(items)
    return new PaginatedList(
      { page, pageSize, totalItems: Number(total_supply) },
      items.map(i => new Bundle(i)),
    )
  }
}
