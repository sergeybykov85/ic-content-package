import nanosecToSec from '~/utils/nanosecToSec.ts'

export default class CanisterDTO {
  protected parseOptionParam = <T>(param: T[], defaultValue: T): T => {
    return param && param.length ? param[0] : defaultValue
  }

  protected toLocalDateString = (date: bigint): string => {
    return new Date(nanosecToSec(date)).toLocaleDateString()
  }
}
