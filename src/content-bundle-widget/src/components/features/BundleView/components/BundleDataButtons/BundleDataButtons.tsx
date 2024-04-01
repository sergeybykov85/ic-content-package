import type Bundle from '~/models/Bundle.ts'
import { type AvailableBundleData, BUNDLE_DATA_CATEGORIES, BUNDLE_DATA_GROUPS } from '~/types/bundleTypes.ts'
import { type FC, useCallback } from 'react'
import Button from '~/components/general/Button'
import If from '~/components/general/If.tsx'
import BundleAbout from '~/components/features/BundleView/components/BundleAbout'
import BundleLocations from '~/components/features/BundleView/components/BundleLocations'
import { useFullScreenModal } from '~/context/FullScreenModalContext'
import styles from './BundleDataButtons.module.scss'

interface BundleDataButtonsProps {
  bundle: Bundle
  dataToRender: AvailableBundleData
}

const BundleDataButtons: FC<BundleDataButtonsProps> = ({ bundle, dataToRender }) => {
  const { setContent } = useFullScreenModal()

  const checkIsAvailable = useCallback(
    (group: BUNDLE_DATA_GROUPS, category: BUNDLE_DATA_CATEGORIES) => {
      return dataToRender[group]?.includes(category)
    },
    [dataToRender],
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
  return (
    <div className={styles.container}>
      <If condition={Boolean(location)}>
        <Button variant="text" text="Map" onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.Location)} />
      </If>
      <If condition={checkIsAvailable(BUNDLE_DATA_GROUPS.POI, BUNDLE_DATA_CATEGORIES.About)}>
        <Button variant="text" text="About" onClick={() => handleClick(BUNDLE_DATA_CATEGORIES.About)} />
      </If>
    </div>
  )
}

export default BundleDataButtons
