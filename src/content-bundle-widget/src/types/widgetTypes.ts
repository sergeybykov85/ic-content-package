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

export interface WidgetCriteriaDto {
  entity: {
    package_id: string
    ids: string[][] // optional
  }[] // optional
  by_tag: string[] // optional
  by_country_code: string[] // optional
  by_classification: string[] // optional
}

export interface WidgetCreationRequestDto {
  name: string
  description: string
  type_id: VariantType<WIDGET_TYPES>
  status: VariantType<WIDGET_STATUSES>[] // optional
  criteria: WidgetCriteriaDto[] // optional
  options: WidgetOptionsDto[] // optional
}

export interface WidgetCreationParams {
  name: string
  description: string
  isDraft?: boolean
  packageId?: string
  bundleIds?: string[]
}

export interface WidgetUpdateRequestDto {
  name: string[] // optional
  description: string[] // optional
  status: VariantType<WIDGET_STATUSES>[] // optional
}

export interface WidgetUpdateParams {
  name?: string
  description?: string
  status?: WIDGET_STATUSES
}
