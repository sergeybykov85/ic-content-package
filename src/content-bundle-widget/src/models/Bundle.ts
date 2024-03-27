import CanisterDTO from '~/models/CanisterDTO.ts'
import type { AboutIndexDto, BundleDto } from '~/types/bundleTypes.ts'
import BundleLocation from '~/models/BundleLocation.ts'

export default class Bundle extends CanisterDTO {
  public id: string
  public name: string
  public description: string
  public logoUrl: string
  public tags: string[]
  public classification: string
  public location: BundleLocation[]
  public about: AboutIndexDto[]
  public creator: string
  public owner: string
  public created: string
  public packageId?: string

  constructor(bundleDto: BundleDto, packageId?: string) {
    super()
    this.id = bundleDto.id
    this.name = bundleDto.name
    this.description = bundleDto.description
    this.logoUrl = bundleDto.logo[0]?.url || ''
    this.tags = bundleDto.index.tags
    this.classification = bundleDto.index.classification
    this.location = bundleDto.index.location.map(item => new BundleLocation(item))
    this.about = bundleDto.index.about
    this.creator = bundleDto.creator.identity_id
    this.owner = bundleDto.owner.identity_id
    this.created = this.toLocalDateString(bundleDto.created)
    this.packageId = packageId
  }
}
