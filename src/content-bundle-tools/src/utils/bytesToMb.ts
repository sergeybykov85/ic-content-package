export default function bytesToMb(bytes: number, decimals: number = 2): number {
  return Number((bytes / 1024 ** 2).toFixed(decimals))
}
