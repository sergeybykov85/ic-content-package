import CanisterDTO from '~/models/CanisterDTO.ts'
import type { AboutIndexDto, BundleDetailsDto, BundleDto } from '~/types/bundleTypes.ts'
import BundleLocation from '~/models/BundleLocation.ts'

export default class Bundle extends CanisterDTO {
  public id: string
  public created: string
  public name: string
  public description?: string
  public creator: string
  public owner: string
  public logoUrl: string
  public tags: string[]
  public classification: string
  public locations: BundleLocation[]
  public about: AboutIndexDto[]

  constructor(bundleDto: BundleDto | BundleDetailsDto) {
    super()
    this.id = bundleDto.id
    this.created = this.toLocalDateString(bundleDto.created)
    this.name = bundleDto.name
    this.description = this.parseDescription(bundleDto)
    this.creator = bundleDto.creator.identity_id
    this.owner = bundleDto.owner.identity_id
    this.logoUrl = bundleDto.logo[0].url || ''
    this.tags = this.parseTags(bundleDto)
    this.classification = this.parseClassification(bundleDto)
    this.locations = this.parseLocations(bundleDto)
    this.about = this.parseAbout(bundleDto)
  }

  private parseDescription = (bundle: BundleDto | BundleDetailsDto): string | undefined => {
    return 'description' in bundle ? bundle.description : undefined
  }

  private parseTags = (bundle: BundleDto | BundleDetailsDto): string[] => {
    return 'index' in bundle ? bundle.index.tags : bundle.tags
  }

  private parseClassification = (bundle: BundleDto | BundleDetailsDto): string => {
    return 'index' in bundle ? bundle.index.classification : bundle.classification
  }

  private parseLocations = (bundle: BundleDto | BundleDetailsDto): BundleLocation[] => {
    if ('index' in bundle) {
      return bundle.index.location.map(item => new BundleLocation(item))
    } else {
      return []
    }
  }

  private parseAbout = (bundle: BundleDto | BundleDetailsDto): AboutIndexDto[] => {
    return 'index' in bundle ? bundle.index.about : []
  }
}
