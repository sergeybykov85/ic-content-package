import type { IdentityRecord, VariantType } from '~/types/globals.ts'

export enum PackageTypes {
  Public = 'Public',
  Private = 'Private',
  Shared = 'Shared',
}

type PackageSubmission = VariantType<PackageTypes>

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
