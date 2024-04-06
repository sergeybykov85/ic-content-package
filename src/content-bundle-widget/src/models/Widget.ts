import CanisterDTO from '~/models/CanisterDTO.ts'
import type { WIDGET_STATUSES, WIDGET_TYPES, WidgetDto } from '~/types/widgetTypes.ts'
import type { AvailableBundleData } from '~/types/bundleTypes.ts'

export default class Widget extends CanisterDTO {
  public id: string
  public name: string
  public description: string
  public type: WIDGET_TYPES
  public status: WIDGET_STATUSES
  public creator: string
  public created: string
  public bundleDataToRender: AvailableBundleData

  constructor(widgetDto: WidgetDto) {
    super()
    this.id = widgetDto.id
    this.name = widgetDto.name
    this.description = widgetDto.description
    this.type = this.parseVariantType(widgetDto.type_id)
    this.status = this.parseVariantType(widgetDto.status)
    this.creator = widgetDto.creator.identity_id
    this.created = this.toLocalDateString(widgetDto.created)
    this.bundleDataToRender = this.parseBundleCategories(widgetDto.options)
  }

  private parseBundleCategories = (options: WidgetDto['options']): AvailableBundleData => {
    if (!options.length || !options[0].payload_items.length) return {}

    return this.parseAvailableBundleData(options[0].payload_items[0])
  }
}
