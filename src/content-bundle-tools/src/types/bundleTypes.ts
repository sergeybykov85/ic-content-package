import type { Coordinates, IdentityRecord, RawFile } from '~/types/globals.ts'

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

export interface CreateBundleParams {
  name: string
  description: string
  logo?: RawFile
  classification: string
  tags: string[]
}

export interface BundleUpdateDto {
  name?: string
  description?: string
  logo?: RawFile
  tags?: string[]
  classification?: string
}

export interface BundleUpdateParams {
  name?: string
  description?: string
  logo?: RawFile
  tags?: string[]
  classification?: string
}
