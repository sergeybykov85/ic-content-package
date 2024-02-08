import type { PackageRaw, PackageTypes } from '~/types/packagesTypes.ts'
import nanosecToSec from '~/utils/nanosecToSec.ts'

export class Package {
  created: number // seconds
  description: string
  id: string
  max_supply: bigint[]
  name: string
  registered: string
  submission: PackageTypes
  logo_url?: string[]
  constructor(rawPackage: PackageRaw) {
    this.created = nanosecToSec(rawPackage.created)
    this.description = rawPackage.description
    this.id = rawPackage.id
    this.max_supply = rawPackage.max_supply
    this.name = rawPackage.name
    this.registered = rawPackage.registered
    this.submission = this.parseSubmission(rawPackage.submission)
    this.logo_url = rawPackage.logo_url
  }

  private parseSubmission = (submission: PackageRaw['submission']): PackageTypes => {
    return Object.keys(submission)[0] as PackageTypes
  }
}
