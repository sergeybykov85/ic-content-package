import type { PACKAGE_TYPES, PackageDto } from '~/types/packageTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'

export default class Package extends CanisterDTO {
  public name: string
  public description: string
  public logoUrl: string
  public maxSupply: number | 'unlimited'
  public created: string
  public creator: string
  public submission: PACKAGE_TYPES

  constructor(packageDto: PackageDto) {
    super()
    this.name = packageDto.name
    this.description = packageDto.description
    this.logoUrl = this.parseOptionParam(packageDto.logo_url, '')
    this.maxSupply = this.parseMaxSupply(packageDto.max_supply)
    this.created = this.toLocalDateString(packageDto.created)
    this.creator = packageDto.creator.identity_id
    this.submission = this.parseVariantType(packageDto.submission)
  }

  private parseMaxSupply = (value: PackageDto['max_supply']): Package['maxSupply'] => {
    const maxSupplyBigInt = this.parseOptionParam(value, 0n)
    return Number(maxSupplyBigInt) || 'unlimited'
  }
}
