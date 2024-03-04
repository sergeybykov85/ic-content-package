import type { IdentityRecord, VariantType, StorageData } from '~/types/globals.ts'

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
  coordinates: {
    latitude: number
    longitude: number
  }
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

export interface AdditionalDataSectionDto {
  category: VariantType<string>
  data: StorageData[]
  data_path: StorageData
}

export interface AdditionalDataDto {
  data_path: StorageData
  sections: AdditionalDataSectionDto[]
  // readonly
}

export enum ADDITIONAL_DATA_TYPES { // TODO: rename on GROUPS
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

export type AdditionalDataCategories = POI_CATEGORIES | ADDITIONS_CATEGORIES

export interface CreateBundleParams {
  name: string
  description: string
  logo?: { value: Uint8Array; type?: string }
  classification: string
  tags: string[]
}
