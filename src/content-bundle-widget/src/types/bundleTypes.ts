import type { Coordinates, IdentityRecord, StorageData, VariantType } from '~/types/globals.ts'

export interface LocationIndexDto {
  city: string[] // optional
  coordinates: Coordinates
  country_code2: string
  region: string[] // optional
}

export interface AboutIndexDto {
  name: string
  description: string
  locale: string
  attributes: string[]
}

export interface PayloadDataItem {
  group_id: VariantType<BUNDLE_DATA_GROUPS>
  categories: VariantType<BUNDLE_DATA_CATEGORIES>[]
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
  data_availability: PayloadDataItem[]
}

export enum BUNDLE_DATA_GROUPS {
  POI = 'POI',
  Additions = 'Additions',
}

export enum BUNDLE_DATA_CATEGORIES {
  Location = 'Location',
  About = 'About',
  History = 'History',
  AudioGuide = 'AudioGuide',
  Audio = 'Audio',
  Video = 'Video',
  Gallery = 'Gallery',
  Article = 'Article',
  Document = 'Document',
  AR = 'AR',
  Sundry = 'Sundry',
}
