import type { IdentityRecord, VariantType } from '~/types/globals.ts'

export enum PACKAGE_TYPES {
  Public = 'Public',
  Private = 'Private',
  Shared = 'Shared',
}

type PackageSubmission = VariantType<PACKAGE_TYPES>

export interface PackageDto {
  name: string
  description: string
  logo_url: string[]
  max_supply: bigint[]
  created: bigint
  creator: IdentityRecord
  submission: PackageSubmission
}

export interface PackageWithSubmitterDto extends PackageDto {
  id: string
  submitter: IdentityRecord
  submitted: bigint
}

export interface PackageWithOwnerDto extends PackageDto {
  owner: IdentityRecord
  total_bundles: bigint
}

export interface PackageFiltersDto {
  intersect: boolean
  kind: PackageSubmission[]
  creator: IdentityRecord[]
  country_code: string[]
  tag: string[]
  classification: string[]
}

export interface PackageFilters {
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
