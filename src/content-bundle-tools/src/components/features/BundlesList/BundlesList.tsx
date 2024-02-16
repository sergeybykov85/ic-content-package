import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import BundlesGrid from '~/components/general/BundlesGrid'
import styles from './BundlesList.module.scss'
import PaginationControl from '~/components/features/PaginationControl'
import If from '~/components/general/If'

interface BundlesListProps {
  packageId: string
}
const BundlesList: FC<BundlesListProps> = ({ packageId }) => {
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [bundlesList, setBundlesList] = useState<Bundle[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    bundlePackageService?.getBundlesPaginatedList(page, 2).then(({ pagination, items }) => {
      setBundlesList(items)
      setTotalPages(pagination.totalPages)
    })
  }, [bundlePackageService, page])

  const handlePageChange = useCallback((page: number) => setPage(page), [])

  return (
    <>
      <h2 className={styles.title}>Bundles</h2>
      <BundlesGrid bundles={bundlesList} />
      <If condition={totalPages > 1}>
        <PaginationControl
          pagination={{ page, totalPages }}
          onPageChange={handlePageChange}
          className={styles.paginator}
        />
      </If>
    </>
  )
}

export default BundlesList
