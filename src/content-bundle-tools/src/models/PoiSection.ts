import type { PoiSectionDto } from '~/types/bundleTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'

export interface DataListItem {
  id: string
  url: string
  name?: string
}

export default class PoiSection extends CanisterDTO {
  public category: string
  public dataList: DataListItem[]

  constructor(dto: PoiSectionDto) {
    super()
    this.category = this.parseVariantType(dto.category)
    this.dataList = this.getDataList(dto.data)
  }

  private getDataList = (list: PoiSectionDto['data']): DataListItem[] => {
    return list.map(item => ({
      id: item.resource_id,
      url: item.url,
      name: this.parseOptionParam(item.name, undefined),
    }))
  }
}
