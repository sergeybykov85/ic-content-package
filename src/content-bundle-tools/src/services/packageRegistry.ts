import { idlFactory as idl } from '~/../declarations/package_registry'
import createActor from '~/utils/createActor.ts'

export const PACKAGE_REGISTRY_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai'

const packageRegistry = createActor(idl, PACKAGE_REGISTRY_CANISTER_ID)

export interface Package {
  created: bigint // nanoseconds
  description: string
  id: string
  max_supply: bigint[]
  name: string
  registered: string
  submission: Record<string, null>
  logo_url?: string[]
}

export const getPackageByType = (type: 'public' | 'private' | 'shared'): Promise<Package[]> => {
  const args = {
    public: { Public: null },
    private: { Private: null },
    shared: { Shared: null },
  } as const
  return packageRegistry.get_packages_by_type(args[type]) as Promise<Package[]>
}
