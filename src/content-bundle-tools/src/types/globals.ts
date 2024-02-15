export interface CanisterResponse<T> {
  ok?: T
  err?: unknown
}

export interface PaginatedListResponse<DataType> {
  total_supply: bigint
  items: DataType[]
}

export type VariantType<T extends string> = Record<T, null>

export enum IdentityTypes {
  ICP = 'ICP',
  EvmChain = 'EvmChain',
}

export type IdentityRecord = {
  identity_type: VariantType<IdentityTypes>
  identity_id: string
}

export interface Pagination {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}
