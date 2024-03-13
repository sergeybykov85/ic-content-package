import type { PackageDto, PackageTypes } from '~/types/packageTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'

export class Package extends CanisterDTO {
  public id: string
  public name: string
  public description: string
  public logoUrl: string
  public maxSupply: number | 'unlimited'
  public created: string
  public creator: string
  public submitter: string
  public submitted: string
  public submission: PackageTypes

  constructor(packageDto: PackageDto) {
    super()
    this.id = packageDto.id
    this.name = packageDto.name
    this.description = packageDto.description
    this.logoUrl = this.parseOptionParam(packageDto.logo_url, '')
    this.maxSupply = this.parseMaxSupply(packageDto.max_supply)
    this.created = this.toLocalDateString(packageDto.created)
    this.creator = packageDto.creator.identity_id
    this.submitter = packageDto.submitter.identity_id
    this.submitted = this.toLocalDateString(packageDto.submitted)
    this.submission = this.parseVariantType(packageDto.submission)
  }

  private parseMaxSupply = (value: PackageDto['max_supply']): Package['maxSupply'] => {
    const maxSupplyBigInt = this.parseOptionParam(value, 0n)
    return Number(maxSupplyBigInt) || 'unlimited'
  }
}
