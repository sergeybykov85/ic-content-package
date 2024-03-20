import { type FC, useEffect, useState } from 'react'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import type Bundle from '~/models/Bundle.ts'
import BundlesGrid from '~/components/general/BundlesGrid.tsx'
import PaginationControl from '~/components/features/PaginationControl'
import styles from './BundlesList.module.scss'

interface BundlesListProps {
  service: BundlePackageService
}

const BundlesList: FC<BundlesListProps> = ({ service }) => {
  const [bundlesList, setBundlesList] = useState<Bundle[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    service.getBundlesPaginatedList(page, 8).then(({ pagination, items }) => {
      setBundlesList(items)
      setTotalPages(pagination.totalPages)
    })
  }, [service, page])

  return (
    <div>
      <h2 className={styles.title}>Bundles</h2>
      <BundlesGrid bundles={bundlesList} />
      <PaginationControl pagination={{ page, totalPages }} onPageChange={setPage} />
    </div>
  )
}

export default BundlesList
