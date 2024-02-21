import { type FC, useEffect, useMemo, useState } from 'react'
import styles from './Poi.module.scss'
import { useServices } from '~/context/ServicesContext'
import type PoiSection from '~/models/PoiSection.ts'
import { enqueueSnackbar } from 'notistack'
import PoiItem from './components/PoiItem/PoiItem.tsx'
import type Bundle from '~/models/Bundle.ts'

interface PoiProps {
  packageId: string
  bundleId: string
  bundle: Bundle
}

const Poi: FC<PoiProps> = ({ bundleId, packageId, bundle }) => {
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [sections, setSections] = useState<PoiSection[]>([])

  useEffect(() => {
    bundlePackageService
      ?.getPoiSections(bundleId)
      .then(res => setSections(res))
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
  }, [bundleId, bundlePackageService])

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>POI</h3>
      <div className={styles.grid}>
        {sections.map(item => (
          <PoiItem item={item} bundle={bundle} key={item.category} />
        ))}
      </div>
    </div>
  )
}

export default Poi
