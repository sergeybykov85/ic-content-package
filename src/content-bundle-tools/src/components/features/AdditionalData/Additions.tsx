import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import { enqueueSnackbar } from 'notistack'
import DataItem from '~/components/features/AdditionalData/components/DataItem/DataItem.tsx'
import type Bundle from '~/models/Bundle.ts'
import DataBlock from '~/components/features/AdditionalData/components/DataBlock/DataBlock.tsx'
import { ADDITIONAL_DATA_TYPES } from '~/types/bundleTypes.ts'

interface AdditionsProps {
  packageId: string
  bundleId: string
  bundle: Bundle
}

const Additions: FC<AdditionsProps> = ({ bundleId, packageId, bundle }) => {
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [sourceUrl, setSourceUrl] = useState('')
  const [sections, setSections] = useState<AdditionalDataSection[]>([])

  useEffect(() => {
    bundlePackageService
      ?.getBundleAdditionalData(bundleId, ADDITIONAL_DATA_TYPES.Additions)
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
  }, [bundleId, bundlePackageService])

  return (
    <DataBlock title="Additional informartion" sourceUrl={sourceUrl}>
      {sections.map(item => (
        <DataItem item={item} bundle={bundle} key={item.category} />
      ))}
    </DataBlock>
  )
}

export default Additions
