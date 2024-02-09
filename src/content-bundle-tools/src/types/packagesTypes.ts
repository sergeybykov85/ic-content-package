export interface PackageRaw {
  created: bigint // nanoseconds
  description: string
  id: string
  max_supply: bigint[]
  name: string
  registered: string
  submission: Record<PackageTypes, null>
  logo_url?: string[]
}

export enum PackageTypes {
  Public = 'Public',
  Private = 'Private',
  Shared = 'Shared',
}

export interface DeployPackageParams {
  name: string
  description: string
  logo?: { value: Uint8Array; type?: string }
}
