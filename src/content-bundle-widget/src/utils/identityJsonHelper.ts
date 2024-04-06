import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'

export default {
  toJSON: (identity: Secp256k1KeyIdentity): string => {
    return JSON.stringify(identity.toJSON())
  },
  fromJSON: (json?: string): Secp256k1KeyIdentity | undefined => {
    return json ? Secp256k1KeyIdentity.fromJSON(json) : undefined
  },
}
