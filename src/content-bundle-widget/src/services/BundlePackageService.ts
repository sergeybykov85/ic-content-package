import CanisterService from '~/services/CanisterService.ts'
import { idlFactory as idl } from '~/declarations/bundle_package/bundle_package.did.js'
import type { AdditionalDataDto, BUNDLE_DATA_GROUPS } from '~/types/bundleTypes.ts'
import type { CanisterResponse } from '~/types/globals.ts'
import AdditionalDataSection from '~/models/AdditionalDataSection.ts'

export default class BundlePackageService extends CanisterService {
  constructor(packageId: string) {
    super(idl, packageId)
  }

  public getBundleAdditionalData = async (
    bundleId: string,
    type: BUNDLE_DATA_GROUPS,
  ): Promise<{ url: string; sections: AdditionalDataSection[] }> => {
    const response = (await this.actor.get_bundle_data(bundleId, {
      [type]: null,
    })) as CanisterResponse<AdditionalDataDto>
    const data = this.responseHandler(response)
    return {
      url: data.data_path.url,
      sections: data.sections.map(item => new AdditionalDataSection(item)),
    }
  }
}
