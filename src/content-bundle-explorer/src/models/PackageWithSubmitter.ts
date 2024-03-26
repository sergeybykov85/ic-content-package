import type { PackageWithSubmitterDto } from '~/types/packageTypes.ts'
import Package from '~/models/Package.ts'

export class PackageWithSubmitter extends Package {
  public id: string
  public submitter: string
  public submitted: string

  constructor(packageDto: PackageWithSubmitterDto) {
    super(packageDto)
    this.id = packageDto.id
    this.submitter = packageDto.submitter.identity_id
    this.submitted = this.toLocalDateString(packageDto.submitted)
  }
}
