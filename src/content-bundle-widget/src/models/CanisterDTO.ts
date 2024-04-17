import nanosecToSec from '~/utils/nanosecToSec.ts'
import type { VariantType } from '~/types/globals.ts'
import type { AvailableBundleData, BundleDataCategories, PayloadDataItem } from '~/types/bundleTypes.ts'

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

  protected parseAvailableBundleData = (payload: PayloadDataItem[]): AvailableBundleData => {
    const availableBundleData: AvailableBundleData = {}

    payload.forEach(item => {
      // @ts-expect-error known issue
      availableBundleData[this.parseVariantType(item.group_id)] = item.categories.reduce((accum, value) => {
        return [...accum, this.parseVariantType(value)]
      }, [] as BundleDataCategories[])
    })

    return availableBundleData
  }
}
