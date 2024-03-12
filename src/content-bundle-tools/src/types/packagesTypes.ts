import type { IdentityRecord, RawFile, VariantType } from '~/types/globals.ts'

export enum PackageTypes {
  Public = 'Public',
  Private = 'Private',
  Shared = 'Shared',
}

export enum IdentifierTypes {
  Hash = 'Hash',
  Ordinal = 'Ordinal',
}

type PackageSubmission = VariantType<PackageTypes>

export interface PackageDto {
  created: bigint // nanoseconds
  description: string
  id: string
  max_supply: bigint[]
  name: string
  // registered: bigint // nanoseconds
  submission: PackageSubmission
  logo_url: string[]
}

export interface PackageDetailsDto extends PackageDto {
  creator: IdentityRecord
  owner: IdentityRecord
  total_bundles: bigint
}

export interface DeployPackageMetadata {
  name: string
  description: string
  logo?: RawFile
}

export interface DeployPackageOptions {
  maxTagSupply?: number
  maxCreatorSupply?: number
  identifierType?: IdentifierTypes
  maxSupply?: number
}

export interface DataSegmentationDto {
  classifications: string[]
  countries: string[]
  tags: string[]
  total_supply: bigint
}
