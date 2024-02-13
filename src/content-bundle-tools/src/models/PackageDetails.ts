import { Package } from '~/models/Package.ts'
import type { PackageDetailsDto } from '~/types/packagesTypes.ts'

export default class PackageDetails extends Package {
  public totalBundles: number
  public creator: string
  public owner: string

  constructor({ creator, owner, total_bundles, ...details }: PackageDetailsDto) {
    super(details)
    this.creator = creator.identity_id
    this.owner = owner.identity_id
    this.totalBundles = Number(total_bundles)
  }
}
