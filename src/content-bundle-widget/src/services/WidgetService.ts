import CanisterService from '~/services/CanisterService.ts'
import { idlFactory as idl } from '~/../../declarations/widget_service'
import type { CanisterResponse } from '~/types/globals.ts'
import type { WidgetCreationParams, WidgetCreationRequestDto, WidgetDto, WidgetItemDto } from '~/types/widgetTypes.ts'
import { WIDGET_STATUSES, WIDGET_TYPES } from '~/types/widgetTypes.ts'
import Widget from '~/models/Widget.ts'
import Bundle from '~/models/Bundle.ts'
import type { Identity } from '@dfinity/agent'
import type { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'

const WIDGET_SERVICE_CANISTER_ID = import.meta.env.VITE_WIDGET_SERVICE_CANISTER_ID

export default class WidgetService extends CanisterService {
  constructor(identity?: Identity | Secp256k1KeyIdentity) {
    super(idl, WIDGET_SERVICE_CANISTER_ID, identity)
  }
  public getWidget = async (widgetId: string): Promise<Widget> => {
    const response = (await this.actor.get_widget(widgetId)) as CanisterResponse<WidgetDto>
    return new Widget(this.responseHandler(response))
  }

  public getWidgetItems = async (widgetId: string): Promise<Bundle[]> => {
    const response = (await this.actor.query_widget_items(widgetId)) as CanisterResponse<WidgetItemDto[]>
    return this.responseHandler(response).map(({ bundle, package_id }) => new Bundle(bundle, package_id))
  }

  public getWidgetsByCreator = async (page: number, pageSize: number, principal: string): Promise<void> => {
    const startIndex = page * pageSize
    const response = await this.actor.get_widgets_page_by_creator(
      startIndex,
      pageSize,
      this.createIdentityDto(principal),
    )
    console.log(response)
  }

  public createWidget = async (params: WidgetCreationParams): Promise<string> => {
    const request: WidgetCreationRequestDto = {
      name: params.name,
      description: params.description,
      status: [{ [params.isDraft ? WIDGET_STATUSES.Draft : WIDGET_STATUSES.Active]: null }],
      type_id: { [WIDGET_TYPES.Bundle]: null },
      criteria: [],
      options: [],
    }
    if (params.packageId) {
      request.criteria.push({
        entity: [{ package_id: params.packageId, ids: params.bundleIds || [] }],
        by_tag: [],
        by_country_code: [],
        by_classification: [],
      })
    }
    const response = (await this.actor.create_widget(request)) as CanisterResponse<string>
    return this.responseHandler(response)
  }
}
