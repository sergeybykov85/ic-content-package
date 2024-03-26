import type { IdentityRecord, VariantType } from '~/types/globals.ts'

export enum WIDGET_TYPES {
  Bundle = 'Bundle',
  Feed = 'Feed',
}

export enum WIDGET_STATUSES {
  Draft = 'Draft',
  Active = 'Active',
}

export interface WidgetDto {
  id: string
  name: string
  description: string
  type_id: VariantType<WIDGET_TYPES>
  status: VariantType<WIDGET_STATUSES>
  creator: IdentityRecord
  created: bigint
  // criteria: ?CriteriaView;
  // options : ?OptionsView;
}
