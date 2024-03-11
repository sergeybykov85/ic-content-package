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

export interface LocationDataPayloadDto {
  country_code2: string
  region: string[]
  city: string[]
  coordinates: Coordinates
}

export interface AboutDataPayloadDto {
  name: string
  description: string
  locale: string
  attributes: []
}

export interface AdditionalDataPayloadDto {
  location: LocationDataPayloadDto[]
  about: AboutDataPayloadDto[]
  reference: []
  history: []
}

export interface AdditionalDataRawPayloadDto {
  value: Uint8Array
  content_type: string[]
}

export interface AdditionalDataRequestDto<T> {
  group: VariantType<ADDITIONAL_DATA_GROUPS>
  category: VariantType<AdditionalDataCategories>
  nested_path: string[]
  name: string[]
  locale: string[]
  resource_id: string[]
  payload: T
  action: VariantType<ADDITIONAL_DATA_ACTIONS>
}

export type AdditionalDataDomainRequestDto = AdditionalDataRequestDto<AdditionalDataPayloadDto>
export type AdditionalDataRawRequestDto = AdditionalDataRequestDto<AdditionalDataRawPayloadDto>

export interface LocationDataParams {
  countryCode2: string
  region?: string
  city?: string
  coordinates: Coordinates
}

export interface AboutDataParams {
  name: string
  description: string
  locale: string
  attributes?: []
}

export interface AdditionalDataPayloadParams {
  location?: LocationDataParams
  about?: AboutDataParams
  reference?: []
  history?: []
}

export interface ApplyAdditionalDataParams<T> {
  group: ADDITIONAL_DATA_GROUPS
  category: AdditionalDataCategories
  name?: string
  locale?: string
  payload: T
}

export type AdditionalDataDomainParams = ApplyAdditionalDataParams<AdditionalDataPayloadParams>
export type AdditionalDataRawParams = ApplyAdditionalDataParams<File>
