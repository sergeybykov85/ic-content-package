import type { IdentityRecord, VariantType } from '~/types/globals.ts'
import type { BundleDto, PayloadDataItem } from '~/types/bundleTypes.ts'

export enum WIDGET_TYPES {
  Bundle = 'Bundle',
  Feed = 'Feed',
}

export enum WIDGET_STATUSES {
  Draft = 'Draft',
  Active = 'Active',
}

export interface WidgetOptionsDto {
  width: bigint[] // optional
  height: bigint[] // optional
  payload_items: PayloadDataItem[][] // optional
}

export interface WidgetDto {
  id: string
  name: string
  description: string
  type_id: VariantType<WIDGET_TYPES>
  status: VariantType<WIDGET_STATUSES>
  creator: IdentityRecord
  created: bigint
  options: WidgetOptionsDto[]
  // criteria: ?CriteriaView;
}

export interface WidgetItemDto {
  package_id: string
  bundle: BundleDto
}
