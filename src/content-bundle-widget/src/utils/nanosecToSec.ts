export default function nanosecToSec(nanosec: bigint): number {
  return Number(nanosec / 10n ** 6n)
}
