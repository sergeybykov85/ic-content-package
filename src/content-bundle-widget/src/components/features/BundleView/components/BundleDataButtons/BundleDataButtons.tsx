import styles from './BundleDataButtons.module.scss'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useFullScreenModal } from '~/context/FullScreenModalContext'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import type AdditionalDataSection from '~/models/AdditionalDataSection.ts'
import { type AvailableBundleData, BUNDLE_DATA_CATEGORIES, BUNDLE_DATA_GROUPS } from '~/types/bundleTypes.ts'
import Button from '~/components/general/Button'
import If from '~/components/general/If.tsx'
import BundleAbout from '~/components/features/BundleView/components/BundleAbout'
import BundleLocations from '~/components/features/BundleView/components/BundleLocations'
import BundleAudio from '~/components/features/BundleView/components/BundleAudio'
import BundleGallery from '~/components/features/BundleView/components/BundleGallery'

interface BundleDataButtonsProps {
  bundle: Bundle
  dataToRender: AvailableBundleData
}

const BundleDataButtons: FC<BundleDataButtonsProps> = ({ bundle, dataToRender }) => {
  const { setContent } = useFullScreenModal()
  const { initBundlePackageService } = useServices()

  const service = useMemo(() => {
    if (initBundlePackageService && bundle.packageId) {
      return initBundlePackageService(bundle.packageId)
    }
  }, [bundle.packageId, initBundlePackageService])

  const [poiSections, setPoiSections] = useState<AdditionalDataSection[]>([])
  const [additionSections, setAdditionSections] = useState<AdditionalDataSection[]>([])

  const getSection = useCallback(
    (group: BUNDLE_DATA_GROUPS, category: BUNDLE_DATA_CATEGORIES) => {
      switch (group) {
        case BUNDLE_DATA_GROUPS.POI:
          return poiSections.find(section => section.category === category)
        case BUNDLE_DATA_GROUPS.Additions:
          return additionSections.find(section => section.category === category)
      }
    },
    [additionSections, poiSections],
  )

  const checkIsAvailable = useCallback(
    (group: BUNDLE_DATA_GROUPS, category: BUNDLE_DATA_CATEGORIES) => {
      return dataToRender[group]?.includes(category) && bundle.availableCategories[group]?.includes(category)
    },
    [bundle.availableCategories, dataToRender],
  )

  const handleClick = useCallback(
    (category: BUNDLE_DATA_CATEGORIES, group?: BUNDLE_DATA_GROUPS) => {
      switch (category) {
        case BUNDLE_DATA_CATEGORIES.About:
          setContent(<BundleAbout about={bundle.about} />)
          break
        case BUNDLE_DATA_CATEGORIES.Location:
          setContent(<BundleLocations location={bundle.location[0]} />)
          break
        case BUNDLE_DATA_CATEGORIES.AudioGuide:
          setContent(<BundleAudio data={getSection(BUNDLE_DATA_GROUPS.POI, category)} />)
          break
        case BUNDLE_DATA_CATEGORIES.Audio:
          setContent(<BundleAudio data={getSection(BUNDLE_DATA_GROUPS.Additions, category)} />)
          break
        case BUNDLE_DATA_CATEGORIES.Gallery:
          setContent(<BundleGallery data={getSection(group!, category)} />)
          break
      }
    },
    [setContent, bundle.about, bundle.location, getSection],
  )

  useEffect(() => {
    if (BUNDLE_DATA_GROUPS.POI in dataToRender && BUNDLE_DATA_GROUPS.POI in bundle.availableCategories) {
      service?.getBundleAdditionalData(bundle.id, BUNDLE_DATA_GROUPS.POI).then(res => {
        setPoiSections(res.sections)
      })
    }
    if (BUNDLE_DATA_GROUPS.Additions in dataToRender && BUNDLE_DATA_GROUPS.Additions in bundle.availableCategories) {
      service?.getBundleAdditionalData(bundle.id, BUNDLE_DATA_GROUPS.Additions).then(res => {
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
        <Button variant="text" text="Audio Guide" onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.AudioGuide)} />
      </If>
      <If condition={checkIsAvailable(BUNDLE_DATA_GROUPS.Additions, BUNDLE_DATA_CATEGORIES.Audio)}>
        <Button variant="text" text="Audio" onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.Audio)} />
      </If>
      <If condition={checkIsAvailable(BUNDLE_DATA_GROUPS.POI, BUNDLE_DATA_CATEGORIES.Gallery)}>
        <Button
          variant="text"
          text="Gallery"
          onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.Gallery, BUNDLE_DATA_GROUPS.POI)}
        />
      </If>
      <If condition={checkIsAvailable(BUNDLE_DATA_GROUPS.Additions, BUNDLE_DATA_CATEGORIES.Gallery)}>
        <Button
          variant="text"
          text="Gallery"
          onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.Gallery, BUNDLE_DATA_GROUPS.Additions)}
        />
      </If>
    </div>
  )
}

export default BundleDataButtons
