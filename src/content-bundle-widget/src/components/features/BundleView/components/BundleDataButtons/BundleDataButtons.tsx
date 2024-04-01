import type Bundle from '~/models/Bundle.ts'
import { type AvailableBundleData, BUNDLE_DATA_CATEGORIES, BUNDLE_DATA_GROUPS } from '~/types/bundleTypes.ts'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import Button from '~/components/general/Button'
import If from '~/components/general/If.tsx'
import BundleAbout from '~/components/features/BundleView/components/BundleAbout'
import BundleLocations from '~/components/features/BundleView/components/BundleLocations'
import { useFullScreenModal } from '~/context/FullScreenModalContext'
import styles from './BundleDataButtons.module.scss'
import { useServices } from '~/context/ServicesContext'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'

interface BundleDataButtonsProps {
  packageId: string
  bundle: Bundle
  dataToRender: AvailableBundleData
}

const BundleDataButtons: FC<BundleDataButtonsProps> = ({ packageId, bundle, dataToRender }) => {
  const { setContent } = useFullScreenModal()
  const { initBundlePackageService } = useServices()

  const service = useMemo(() => initBundlePackageService!(packageId), [initBundlePackageService, packageId])

  const [poiSections, setPoiSections] = useState<AdditionalDataSection[]>([])
  const [additionSections, setAdditionSections] = useState<AdditionalDataSection[]>([])

  const checkIsAvailable = useCallback(
    (group: BUNDLE_DATA_GROUPS, category: BUNDLE_DATA_CATEGORIES) => {
      return dataToRender[group]?.includes(category) && bundle.availableCategories[group]?.includes(category)
    },
    [bundle.availableCategories, dataToRender],
  )

  const handleClick = useCallback(
    (name: BUNDLE_DATA_CATEGORIES) => {
      switch (name) {
        case BUNDLE_DATA_CATEGORIES.About:
          setContent(<BundleAbout about={bundle.about} />)
          break
        case BUNDLE_DATA_CATEGORIES.Location:
          setContent(<BundleLocations location={bundle.location[0]} />)
      }
    },
    [setContent, bundle.about, bundle.location],
  )

  useEffect(() => {
    if (BUNDLE_DATA_GROUPS.POI in dataToRender && BUNDLE_DATA_GROUPS.POI in bundle.availableCategories) {
      service.getBundleAdditionalData(bundle.id, BUNDLE_DATA_GROUPS.POI).then(res => {
        setPoiSections(res.sections)
      })
    }
    if (BUNDLE_DATA_GROUPS.Additions in dataToRender && BUNDLE_DATA_GROUPS.Additions in bundle.availableCategories) {
      service.getBundleAdditionalData(bundle.id, BUNDLE_DATA_GROUPS.Additions).then(res => {
        setAdditionSections(res.sections)
      })
    }
  }, [bundle.availableCategories, bundle.id, dataToRender, service])

  return (
    <div className={styles.container}>
      <If condition={Boolean(location)}>
        <Button variant="text" text="Map" onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.Location)} />
      </If>
      <If condition={checkIsAvailable(BUNDLE_DATA_GROUPS.POI, BUNDLE_DATA_CATEGORIES.About)}>
        <Button variant="text" text="About" onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.About)} />
      </If>
      <If condition={checkIsAvailable(BUNDLE_DATA_GROUPS.POI, BUNDLE_DATA_CATEGORIES.AudioGuide)}>
        <Button variant="text" text="About" onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.AudioGuide)} />
      </If>
    </div>
  )
}

export default BundleDataButtons
