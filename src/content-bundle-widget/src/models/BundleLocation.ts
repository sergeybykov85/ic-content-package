import type { LocationIndexDto } from '~/types/bundleTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'
import type { Coordinates } from '~/types/globals.ts'
import getCountryByCode from '~/utils/getCountryByCode.ts'

export default class BundleLocation extends CanisterDTO {
  public coordinates: Coordinates
  public country: string
  public city?: string
  public region?: string

  constructor(location: LocationIndexDto) {
    super()
    this.coordinates = location.coordinates
    this.country = getCountryByCode(location.country_code2)
    this.region = this.parseOptionParam(location.region, undefined)
    this.city = this.parseOptionParam(location.city, undefined)
  }
}
