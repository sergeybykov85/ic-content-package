import type { Coordinates, IdentityRecord } from '~/types/globals.ts'
import type { PackageFilters, PackageFiltersDto } from '~/types/packageTypes.ts'

export type BundleFilters = Omit<PackageFilters, 'kind'>
export type BundleFiltersDto = Omit<PackageFiltersDto, 'kind'>

export interface BundleDto {
  id: string
  created: bigint
  name: string
  creator: IdentityRecord
  owner: IdentityRecord
  logo: {
    url: string
    // there are more fields but not needed yet
  }[]
  tags: string[]
  classification: string
  // data_path - not needed yet
}

export interface LocationIndexDto {
  city: string[]
  coordinates: Coordinates
  country_code2: string
  region: string[]
}

export interface AboutIndexDto {
  name: string
  description: string
  locale: string
  attributes: string[]
}

export interface BundleDetailsDto extends Omit<BundleDto, 'tags' | 'classification'> {
  description: string
  index: {
    tags: string[]
    classification: string
    location: LocationIndexDto[]
    about: AboutIndexDto[]
  }
}
