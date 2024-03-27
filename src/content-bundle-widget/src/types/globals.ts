export interface CanisterResponse<T> {
  ok?: T
  err?: unknown
}

export type VariantType<T extends string> = Partial<Record<T, null>>

export enum IDENTITY_TYPES {
  ICP = 'ICP',
  EvmChain = 'EvmChain',
}

export type IdentityRecord = {
  identity_type: VariantType<IDENTITY_TYPES>
  identity_id: string
}

export interface StorageData {
  resource_id: string
  url: string
  bucket_id: string
  locale: string[]
  name: string[]
}

export interface Coordinates {
  latitude: number
  longitude: number
}
