import { Buffer } from 'buffer'
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import pemFileParser from 'utils/pemFileParser'

export default function decodeIdentity(rawKey: string): Secp256k1KeyIdentity {
  const key = pemFileParser(rawKey)
  const buffer = Buffer.from(key, 'base64')
  if (buffer.length !== 118) {
    throw new Error('expecting byte length 118 but got ' + buffer.length)
  }
  return Secp256k1KeyIdentity.fromSecretKey(buffer.subarray(7, 39))
}
