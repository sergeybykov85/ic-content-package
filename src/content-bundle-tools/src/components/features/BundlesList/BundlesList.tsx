import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import BundlesGrid from '~/components/general/BundlesGrid'
import styles from './BundlesList.module.scss'
import PaginationControl from '~/components/features/PaginationControl'
import If from '~/components/general/If'
import { useSearchParams } from 'react-router-dom'

interface BundlesListProps {
  packageId: string
}
const BundlesList: FC<BundlesListProps> = ({ packageId }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(
    () => initBundlePackageService?.(packageId),
    [initBundlePackageService, packageId],
  )

  const [bundlesList, setBundlesList] = useState<Bundle[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const page = useMemo(() => Number(searchParams.get('page') || '0'), [searchParams])

  useEffect(() => {
    bundlePackageService?.getBundlesPaginatedList(page, 8).then(({ pagination, items }) => {
      setBundlesList(items)
      setTotalPages(pagination.totalPages)
    })
  }, [bundlePackageService, page])

  const handlePageChange = useCallback(
    (newPage: number) => {
      searchParams.set('page', newPage.toString())
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams],
  )

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
