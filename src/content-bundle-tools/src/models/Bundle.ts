import CanisterDTO from '~/models/CanisterDTO.ts'
import type { BundleDto } from '~/types/bundleTypes.ts'

export default class Bundle extends CanisterDTO {
  public id: string
  public created: string
  public name: string
  public creator: string
  public owner: string
  public logoUrl: string
  public tags: string[]
  public classification: string

  constructor(bundleDto: BundleDto) {
    super()
    this.id = bundleDto.id
    this.created = this.toLocalDateString(bundleDto.created)
    this.name = bundleDto.name
    this.creator = bundleDto.creator.identity_id
    this.owner = bundleDto.owner.identity_id
    this.logoUrl = bundleDto.logo[0].url || ''
    this.tags = bundleDto.tags
    this.classification = bundleDto.classification
  }
}
