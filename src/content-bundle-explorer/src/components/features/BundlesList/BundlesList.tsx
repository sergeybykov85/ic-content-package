import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import type BundlePackageService from '~/services/BundlePackageService.ts'
import type Bundle from '~/models/Bundle.ts'
import BundlesGrid from '~/components/general/BundlesGrid.tsx'
import PaginationControl from '~/components/features/PaginationControl'
import styles from './BundlesList.module.scss'
import Select from '~/components/general/Select'
import If from '~/components/general/If.tsx'
import Button from '~/components/general/Button'
import type { BundleFilters } from '~/types/bundleTypes.ts'
import type { DataSegmentationDto } from '~/types/packageTypes.ts'
import EmptyBlock from '~/components/features/EmptyBlock'

type DataSegmentation = Omit<DataSegmentationDto, 'total_supply'>

const dataSegmentationInitState: DataSegmentation = {
  classifications: [],
  countries: [],
  tags: [],
}

interface BundlesListProps {
  service: BundlePackageService
}

const BundlesList: FC<BundlesListProps> = ({ service }) => {
  const [bundlesList, setBundlesList] = useState<Bundle[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState<BundleFilters>({})
  const [dataSegmentation, setDataSegmentation] = useState<DataSegmentation>(dataSegmentationInitState)

  const emptyFilters = useMemo(() => {
    return Object.values(filters).every(item => Boolean(!item))
  }, [filters])

  const handleSelectChange = useCallback((value: string, name?: string) => {
    setFilters(prevState => ({ ...prevState, [name!]: value !== 'None' ? value : '' }))
  }, [])

  useEffect(() => {
    service.getBundlesPaginatedList(page, 8, filters).then(({ pagination, items }) => {
      setBundlesList(items)
      setTotalPages(pagination.totalPages)
    })
  }, [service, page, filters])

  useEffect(() => {
    service.getDataSegmentation().then(response => setDataSegmentation(response))
  }, [service])

  return (
    <div>
      <h2 className={styles.title}>Bundles</h2>
      <div className={styles.filters}>
        <Select
          label="Classification"
          placeholder="Select..."
          defaultValue={filters.classification || ''}
          options={['None', ...dataSegmentation.classifications]}
          name="classification"
          onSelect={handleSelectChange}
        />
        <Select
          label="Country"
          placeholder="Select..."
          defaultValue={filters.countryCode || ''}
          options={['None', ...dataSegmentation.countries]}
          name="countryCode"
          onSelect={handleSelectChange}
        />
        <Select
          label="Tag"
          placeholder="Select..."
          defaultValue={filters.tag || ''}
          options={['None', ...dataSegmentation.tags]}
          name="tag"
          onSelect={handleSelectChange}
        />
        <If condition={!emptyFilters}>
          <Button variant="text" text="Reset filters" onClick={() => setFilters({})} className={styles.reset} />
        </If>
      </div>
      <If condition={!bundlesList.length}>
        <EmptyBlock variant={emptyFilters ? 'idle' : 'not-found'} />
      </If>
      <BundlesGrid bundles={bundlesList} />
      <PaginationControl pagination={{ page, totalPages }} onPageChange={setPage} />
    </div>
  )
}

export default BundlesList
