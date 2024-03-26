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

export interface PaginatedListResponse<Item> {
  total_supply: bigint
  items: Item[]
}

export interface Pagination {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface StorageData {
  resource_id: string
  url: string
  bucket_id: string
  locale: string[]
  name: string[]
}
