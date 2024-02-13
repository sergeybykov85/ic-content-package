import type { IdentityRecord, VariantType } from '~/types/globals.ts'

export enum PackageTypes {
  Public = 'Public',
  Private = 'Private',
  Shared = 'Shared',
}

type PackageSubmission = VariantType<PackageTypes>

export interface PackageDto {
  created: bigint // nanoseconds
  description: string
  id: string
  max_supply: bigint[]
  name: string
  // registered: bigint // nanoseconds
  submission: PackageSubmission
  logo_url: string[]
}

export interface PackageDetailsDto extends PackageDto {
  creator: IdentityRecord
  owner: IdentityRecord
  total_bundles: bigint
}

/*
{ created=1707225273809262881;
creator={identity_type=variant {ICP}; identity_id="br5f7-7uaaa-aaaaa-qaaca-cai"};
owner= {identity_type=variant {ICP}; identity_id="nko75-gurhe-pmt5b-mhzyt-42njv-cdchk-fnwyz-ye6k6-melkn-btfz2-tae"};
name="Amazing places in the Middle East";
description="Most beautiful cities and locations in the Middle East";
logo_url=opt "http://c2lt4-zmaaa-aaaaa-qaaiq-cai.localhost:4943/r/logo";
max_supply=opt 200;
total_bundles=10;
submission=variant {Public}}
*
* */

export interface DeployPackageParams {
  name: string
  description: string
  logo?: { value: Uint8Array; type?: string }
}
