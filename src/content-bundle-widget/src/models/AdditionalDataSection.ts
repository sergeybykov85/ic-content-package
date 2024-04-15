import type { AdditionalDataSectionDto, BundleDataCategories } from '~/types/bundleTypes.ts'
import CanisterDTO from '~/models/CanisterDTO.ts'
import getLanguageByCode from '~/utils/getLanguageByCode.ts'

export interface DataListItem {
  id: string
  url: string
  name?: string
  locale?: string
}

export default class AdditionalDataSection extends CanisterDTO {
  public category: BundleDataCategories
  public dataList: DataListItem[]
  public dataPathUrl: string

  constructor(dto: AdditionalDataSectionDto) {
    super()
    this.category = this.parseVariantType(dto.category)
    this.dataList = this.getDataList(dto.data)
    this.dataPathUrl = dto.data_path.url
  }

  private getDataList = (list: AdditionalDataSectionDto['data']): DataListItem[] => {
    return list.map(item => {
      const locale = this.parseOptionParam(item.locale, undefined)
      return {
        id: item.resource_id,
        url: item.url,
        name: this.parseOptionParam(item.name, undefined),
        locale: locale && getLanguageByCode(locale),
      }
    })
  }
}
