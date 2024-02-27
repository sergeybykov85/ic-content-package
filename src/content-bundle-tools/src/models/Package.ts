import type { PackageDto, PackageTypes } from '~/types/packagesTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'

export class Package extends CanisterDTO {
  public created: string
  public description: string
  public id: string
  public maxSupply: number | 'unlimited'
  public name: string
  // public registered: string
  public submission: PackageTypes
  public logoUrl: string
  constructor(packageDto: PackageDto) {
    super()
    this.created = this.toLocalDateString(packageDto.created)
    this.description = packageDto.description
    this.id = packageDto.id
    this.maxSupply = this.parseMaxSupply(packageDto.max_supply)
    this.name = packageDto.name
    // this.registered = this.toLocalDateString(packageDto.registered)
    this.submission = this.parseVariantType(packageDto.submission)
    this.logoUrl = this.parseOptionParam(packageDto.logo_url, '')
  }

  private parseMaxSupply = (value: PackageDto['max_supply']): Package['maxSupply'] => {
    const maxSupplyBigInt = this.parseOptionParam(value, 0n)
    return Number(maxSupplyBigInt) || 'unlimited'
  }
}
