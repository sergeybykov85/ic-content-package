export interface Package {
  created: bigint // nanoseconds
  description: string
  id: string
  max_supply: bigint[]
  name: string
  registered: string
  submission: Record<string, null>
  logo_url?: string[]
}

export type PackageType = 'public' | 'private' | 'shared'
