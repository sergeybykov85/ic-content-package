export enum PackageTypes {
  Public = 'Public',
  Private = 'Private',
  Shared = 'Shared',
}

type PackageSubmission = Record<PackageTypes, null>

export interface PackageDto {
  created: bigint // nanoseconds
  description: string
  id: string
  max_supply: bigint[]
  name: string
  registered: bigint // nanoseconds
  submission: PackageSubmission
  logo_url: string[]
}

export interface DeployPackageParams {
  name: string
  description: string
  logo?: { value: Uint8Array; type?: string }
}
