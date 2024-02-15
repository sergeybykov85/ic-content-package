import type { IdentityRecord } from '~/types/globals.ts'

export interface BundleDto {
  id: string
  created: bigint
  name: string
  description: string
  creator: IdentityRecord
  owner: IdentityRecord
  logo: {
    url: string
    // there are more fields but not needed yet
  }[]
  index: {
    tags: string[]
    classification: string
    // about - not needed yet
    // location - not needed yet
  }
  // data_path - not needed yet
}
