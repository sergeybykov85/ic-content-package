import { FC, useEffect, useMemo, useState } from 'react'
import styles from './Poi.module.scss'
import { useServices } from '~/context/ServicesContext'
import PoiSection from '~/models/PoiSection.ts'
import { DATA_GROUPS } from '~/types/bundleTypes.ts'
import { enqueueSnackbar } from 'notistack'
import PoiItem from './components/PoiItem/PoiItem.tsx'

interface PoiProps {
  packageId: string
  bundleId: string
}

const Poi: FC<PoiProps> = ({ bundleId, packageId }) => {
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [sections, setSections] = useState<PoiSection[]>([])

  useEffect(() => {
    bundlePackageService
      ?.getPoiSections(bundleId, DATA_GROUPS.POI)
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
          <PoiItem item={item} key={item.category} />
        ))}
      </div>
    </div>
  )
}

export default Poi
