import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import type Bundle from '~/models/Bundle.ts'
import BundlesGrid from '~/components/general/BundlesGrid'
import styles from './BundlesList.module.scss'
import PaginationControl from '~/components/features/PaginationControl'
import If from '~/components/general/If'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import CreateBundleBtn from '~/components/features/CreateBundleBtn'

interface BundlesListProps {
  bundlePackageService: BundlePackageService
}
const BundlesList: FC<BundlesListProps> = ({ bundlePackageService }) => {
  const navigate = useNavigate()
  const { state, pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const [bundlesList, setBundlesList] = useState<Bundle[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const page = useMemo(() => Number(searchParams.get('page') || '0'), [searchParams])

  useEffect(() => {
    bundlePackageService.getBundlesPaginatedList(page, 8).then(({ pagination, items }) => {
      setBundlesList(items)
      setTotalPages(pagination.totalPages)
    })
  }, [bundlePackageService, page])

  const handlePageChange = useCallback(
    (newPage: number) => {
      searchParams.set('page', newPage.toString())
      navigate(`${pathname}?${searchParams.toString()}`, { state })
    },
    [navigate, pathname, searchParams, state],
  )

  return (
    <>
      <div className={styles.header}>
        <If condition={Boolean(bundlesList.length)}>
          <h2 className={styles.title}>Bundles</h2>
          <CreateBundleBtn service={bundlePackageService} />
        </If>
      </div>
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
