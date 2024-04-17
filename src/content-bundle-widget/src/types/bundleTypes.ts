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

export enum POI_CATEGORIES {
  Location = 'Location',
  About = 'About',
  History = 'History',
  AudioGuide = 'AudioGuide',
  Gallery = 'Gallery',
  AR = 'AR',
}

export enum ADDITIONS_CATEGORIES {
  Audio = 'Audio',
  Video = 'Video',
  Gallery = 'Gallery',
  Article = 'Article',
  Document = 'Document',
}

export type BundleDataCategories = POI_CATEGORIES | ADDITIONS_CATEGORIES

export interface PayloadDataItem {
  group_id: VariantType<BUNDLE_DATA_GROUPS>
  categories: VariantType<BundleDataCategories>[]
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

export type AvailableBundleData = Partial<{
  [BUNDLE_DATA_GROUPS.POI]: POI_CATEGORIES[]
  [BUNDLE_DATA_GROUPS.Additions]: ADDITIONS_CATEGORIES[]
}>

export interface AdditionalDataDto {
  data_path: StorageData
  sections: AdditionalDataSectionDto[]
  // readonly
}

export interface AdditionalDataSectionDto {
  category: VariantType<BundleDataCategories>
  data: StorageData[]
  data_path: StorageData
}
