import { type FC, useEffect, useState } from 'react'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import { enqueueSnackbar } from 'notistack'
import DataItem from '~/components/features/AdditionalData/components/DataItem/DataItem.tsx'
import type Bundle from '~/models/Bundle.ts'
import DataBlock from '~/components/features/AdditionalData/components/DataBlock/DataBlock.tsx'
import { ADDITIONAL_DATA_TYPES } from '~/types/bundleTypes.ts'
import type BundlePackageService from '~/services/BundlePackageService.ts'

interface AdditionsProps {
  service: BundlePackageService
  bundleId: string
  bundle: Bundle
}

const Additions: FC<AdditionsProps> = ({ bundleId, service, bundle }) => {
  const [sourceUrl, setSourceUrl] = useState('')
  const [sections, setSections] = useState<AdditionalDataSection[]>([])

  useEffect(() => {
    service
      .getBundleAdditionalData(bundleId, ADDITIONAL_DATA_TYPES.Additions)
      .then(({ sections, url }) => {
        setSourceUrl(url)
        setSections(sections)
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
  }, [bundleId, service])

  return (
    <DataBlock title="Additional informartion" sourceUrl={sourceUrl}>
      {sections.map(item => (
        <DataItem item={item} bundle={bundle} key={item.category} />
      ))}
    </DataBlock>
  )
}

export default Additions
