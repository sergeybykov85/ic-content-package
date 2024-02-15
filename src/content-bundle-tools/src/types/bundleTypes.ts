import type { IdentityRecord } from '~/types/globals.ts'

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
