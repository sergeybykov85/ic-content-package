import type { Coordinates, StorageData, VariantType } from '~/types/globals.ts'

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

export enum ADDITIONAL_DATA_GROUPS {
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

export enum ADDITIONAL_DATA_ACTIONS {
  Upload = 'Upload',
  UploadChunk = 'UploadChunk',
  Package = 'Package',
}

export interface LocationDataPayload {
  country_code2: string
  region: string[]
  city: string[]
  coordinates: Coordinates
}

export interface AdditionalDataPayload {
  location: LocationDataPayload[]
  about: []
  reference: []
  history: []
}

export interface AdditionalDataRequest {
  group: VariantType<ADDITIONAL_DATA_GROUPS>
  category: VariantType<AdditionalDataCategories>
  nested_path: string[]
  name: string[]
  locale: string[]
  resource_id: string[]
  payload: AdditionalDataPayload
  action: VariantType<ADDITIONAL_DATA_ACTIONS>
}

export interface LocationDataParams {
  countryCode2: string
  region?: string
  city?: string
  coordinates: Coordinates
}

export interface AdditionalDataPayloadParams {
  location?: LocationDataParams
  about?: []
  reference?: []
  history?: []
}

export interface ApplyAdditionalDataParams {
  group: ADDITIONAL_DATA_GROUPS
  category: AdditionalDataCategories
  name?: string
  locale?: string
  action: ADDITIONAL_DATA_ACTIONS
  payload: AdditionalDataPayloadParams
}
