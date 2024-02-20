import { IdentityRecord, VariantType, StorageData } from '~/types/globals.ts'

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

export interface BundleDetailsDto extends Omit<BundleDto, 'tags' | 'classification'> {
  description: string
  index: {
    tags: string[]
    classification: string
    // about
    // location
  }
}

export interface PoiSectionDto {
  category: VariantType<string>
  data: StorageData[]
  data_path: StorageData
}

export interface PoiDataDto {
  data_path: StorageData
  sections: PoiSectionDto[]
  // readonly
}

export enum DATA_GROUPS {
  POI = 'POI',
  Additions = 'Additions',
}
