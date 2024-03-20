import type { LocationIndexDto } from '~/types/bundleTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'
import type { Coordinates } from '~/types/globals.ts'

export default class BundleLocation extends CanisterDTO {
  public coordinates: Coordinates
  public country_code2: string
  public city?: string
  public region?: string

  constructor(location: LocationIndexDto) {
    super()
    this.coordinates = location.coordinates
    this.country_code2 = location.country_code2
    this.region = this.parseOptionParam(location.region, undefined)
    this.city = this.parseOptionParam(location.city, undefined)
  }
}
