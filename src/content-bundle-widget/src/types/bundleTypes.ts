import type { Coordinates, IdentityRecord, StorageData } from '~/types/globals.ts'

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

export interface BundleDto {
  id: string
  data_path: StorageData
  name: string
  description: string
  logo: StorageData[]
  index: {
    tags: string[]
    classification: string
    location: LocationIndexDto[]
    about: AboutIndexDto[]
  }
  creator: IdentityRecord
  owner: IdentityRecord
  created: bigint
}
