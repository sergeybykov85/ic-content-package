import type { PackageWithOwnerDto } from '~/types/packageTypes.ts'
import Package from '~/models/Package.ts'

export default class PackageWithOwner extends Package {
  public owner: string
  public totalBundles: number

  constructor(packageDto: PackageWithOwnerDto) {
    super(packageDto)
    this.owner = packageDto.owner.identity_id
    this.totalBundles = Number(packageDto.total_bundles)
  }
}
