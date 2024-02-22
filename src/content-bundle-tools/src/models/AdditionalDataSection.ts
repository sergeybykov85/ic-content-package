import type { AdditionalDataSectionDto } from '~/types/bundleTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'

export interface DataListItem {
  id: string
  url: string
  name?: string
}

export default class AdditionalDataSection extends CanisterDTO {
  public category: string
  public dataList: DataListItem[]

  constructor(dto: AdditionalDataSectionDto) {
    super()
    this.category = this.parseVariantType(dto.category)
    this.dataList = this.getDataList(dto.data)
  }

  private getDataList = (list: AdditionalDataSectionDto['data']): DataListItem[] => {
    return list.map(item => ({
      id: item.resource_id,
      url: item.url,
      name: this.parseOptionParam(item.name, undefined),
    }))
  }
}
