import CanisterService from '~/services/CanisterService.ts'
import { idlFactory as idl } from '~/../../declarations/widget_service'
import type { CanisterResponse } from '~/types/globals.ts'
import type { WidgetDto } from '~/types/widgetTypes.ts'
import Widget from '~/models/Widget.ts'

const WIDGET_SERVICE_CANISTER_ID = import.meta.env.VITE_WIDGET_SERVICE_CANISTER_ID

export default class WidgetService extends CanisterService {
  constructor() {
    super(idl, WIDGET_SERVICE_CANISTER_ID)
  }

  public getWidget = async (widgetId: string): Promise<Widget> => {
    const response = (await this.actor.get_widget(widgetId)) as CanisterResponse<WidgetDto>
    return new Widget(this.responseHandler(response))
  }
}
