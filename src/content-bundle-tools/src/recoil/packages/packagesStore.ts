import { selector, selectorFamily } from 'recoil'
import createActor from '~/utils/createActor.ts'
import { idlFactory as idl } from '~/../../declarations/package_registry'
import { PackageType, Package } from 'src/recoil/packages/packagesTypes.ts'
import { identityState } from '~/recoil/auth'

export const PACKAGE_REGISTRY_CANISTER_ID = import.meta.env.VITE_PACKAGE_REGISTRY_CANISTER_ID

export const packageRegistryState = selector({
  key: 'packageRegistryState',
  get: ({ get }) => {
    return createActor(idl, PACKAGE_REGISTRY_CANISTER_ID, get(identityState) || undefined)
  },
})

export const getPackageByTypeSelector = selectorFamily<Package[], PackageType>({
  key: 'getPackageByTypeSelector',
  get:
    type =>
    async ({ get }) => {
      const args = {
        public: { Public: null },
        private: { Private: null },
        shared: { Shared: null },
      } as const
      return (await get(packageRegistryState).get_packages_by_type(args[type])) as Promise<Package[]>
    },
})
