import CanisterService from '~/services/CanisterService.ts'
import { idlFactory as idl } from '~/../../declarations/widget_service'
import type { CanisterResponse } from '~/types/globals.ts'
import type { WidgetDto, WidgetItemDto } from '~/types/widgetTypes.ts'
import Widget from '~/models/Widget.ts'
import Bundle from '~/models/Bundle.ts'

const WIDGET_SERVICE_CANISTER_ID = import.meta.env.VITE_WIDGET_SERVICE_CANISTER_ID

export default class WidgetService extends CanisterService {
  constructor() {
    super(idl, WIDGET_SERVICE_CANISTER_ID)
  }
  public getWidget = async (widgetId: string): Promise<Widget> => {
    const response = (await this.actor.get_widget(widgetId)) as CanisterResponse<WidgetDto>
    return new Widget(this.responseHandler(response))
  }

  public getWidgetItems = async (widgetId: string): Promise<Bundle[]> => {
    const response = (await this.actor.query_widget_items(widgetId)) as CanisterResponse<WidgetItemDto[]>
    return this.responseHandler(response).map(({ bundle, package_id }) => new Bundle(bundle, package_id))
  }
}
