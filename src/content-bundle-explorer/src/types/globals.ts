export interface CanisterResponse<T> {
  ok?: T
  err?: unknown
}

export type VariantType<T extends string> = Partial<Record<T, null>>

export enum IdentityTypes {
  ICP = 'ICP',
  EvmChain = 'EvmChain',
}

export type IdentityRecord = {
  identity_type: VariantType<IdentityTypes>
  identity_id: string
}
