import nanosecToSec from '~/utils/nanosecToSec.ts'
import type { VariantType } from '~/types/globals.ts'
import type { BUNDLE_DATA_CATEGORIES, PayloadDataItem } from '~/types/bundleTypes.ts'

export default class CanisterDTO {
  protected parseOptionParam = <T>(param: T[], defaultValue: T): T => {
    return param && param.length ? param[0] : defaultValue
  }

  protected toLocalDateString = (date: bigint): string => {
    const dateInstance = new Date(nanosecToSec(date))
    return `${dateInstance.toLocaleDateString()} - ${dateInstance.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  protected parseVariantType = <T extends string>(data: VariantType<T>): T => {
    return Object.keys(data)[0] as T
  }

  protected parseBundleDataCategoriesFromPayload = (payload: PayloadDataItem[]): BUNDLE_DATA_CATEGORIES[] => {
    const allCategoriesVariantType = payload.reduce((accum, item) => {
      return [...accum, ...item.categories]
    }, [] as VariantType<BUNDLE_DATA_CATEGORIES>[])

    return allCategoriesVariantType.reduce((accum, item) => {
      const keys = Object.keys(item) as BUNDLE_DATA_CATEGORIES[]
      return [...accum, ...keys]
    }, [] as BUNDLE_DATA_CATEGORIES[])
  }
}
