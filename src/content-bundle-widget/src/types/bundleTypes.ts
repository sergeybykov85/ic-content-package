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

export enum BUNDLE_DATA_GROUPS {
  POI = 'POI',
  Additions = 'Additions',
}

export enum BUNDLE_DATA_CATEGORIES {
  Location = 'Location', // POI
  About = 'About', // POI
  History = 'History', // POI
  AudioGuide = 'AudioGuide', // POI
  Audio = 'Audio', // Additions
  Video = 'Video', // Additions
  Gallery = 'Gallery', // POI and Additions
  Article = 'Article', // Additions
  Document = 'Document', // Additions
  AR = 'AR', // POI
  // Sundry = 'Sundry'
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

export type AvailableBundleData = Partial<Record<BUNDLE_DATA_GROUPS, BUNDLE_DATA_CATEGORIES[]>>

export interface AdditionalDataDto {
  data_path: StorageData
  sections: AdditionalDataSectionDto[]
  // readonly
}

export interface AdditionalDataSectionDto {
  category: VariantType<BUNDLE_DATA_CATEGORIES>
  data: StorageData[]
  data_path: StorageData
}
