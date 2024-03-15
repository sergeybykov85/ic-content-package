import type { IdentityRecord, VariantType } from '~/types/globals.ts'

export enum PACKAGE_TYPES {
  Public = 'Public',
  Private = 'Private',
  Shared = 'Shared',
}

type PackageSubmission = VariantType<PACKAGE_TYPES>

export interface PackageDto {
  id: string
  name: string
  description: string
  logo_url: string[]
  max_supply: bigint[]
  created: bigint
  creator: IdentityRecord
  submitter: IdentityRecord
  submitted: bigint
  submission: PackageSubmission
}

export interface FiltersDto {
  intersect: boolean
  kind: PackageSubmission[]
  creator: IdentityRecord[]
  country_code: string[]
  tag: string[]
  classification: string[]
}

export interface Filters {
  kind?: PACKAGE_TYPES
  creator?: string
  countryCode?: string
  tag?: string
  classification?: string
}

export interface DataSegmentationDto {
  classifications: string[]
  countries: string[]
  tags: string[]
  total_supply: bigint
}
