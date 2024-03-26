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
