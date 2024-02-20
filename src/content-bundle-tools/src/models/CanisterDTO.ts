import nanosecToSec from '~/utils/nanosecToSec.ts'
import type { VariantType } from '~/types/globals.ts'

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

  protected parseVariantType = <T>(data: VariantType<T>): T => {
    return Object.keys(data)[0]
  }
}
