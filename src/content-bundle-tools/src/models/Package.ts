import type { PackageDto, PackageTypes } from '~/types/packagesTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'

export class Package extends CanisterDTO {
  created: string
  description: string
  id: string
  max_supply: number | 'unlimited'
  name: string
  registered: string
  submission: PackageTypes
  logo_url: string
  constructor(rawPackage: PackageDto) {
    super()
    this.created = this.toLocalDateString(rawPackage.created)
    this.description = rawPackage.description
    this.id = rawPackage.id
    this.max_supply = this.parseMaxSupply(rawPackage.max_supply)
    this.name = rawPackage.name
    this.registered = this.toLocalDateString(rawPackage.registered)
    this.submission = this.parseSubmission(rawPackage.submission)
    this.logo_url = this.parseOptionParam(rawPackage.logo_url, '')
  }

  private parseMaxSupply = (value: PackageDto['max_supply']): Package['max_supply'] => {
    const maxSupplyBigInt = this.parseOptionParam(value, 0n)
    return Number(maxSupplyBigInt) || 'unlimited'
  }

  private parseSubmission = (submission: PackageDto['submission']): PackageTypes => {
    return Object.keys(submission)[0] as PackageTypes
  }
}
