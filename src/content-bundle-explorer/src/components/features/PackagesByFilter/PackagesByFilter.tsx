import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { type DataSegmentationDto, type Filters, PACKAGE_TYPES } from '~/types/packageTypes.ts'
import { useServices } from '~/context/ServicesContext'
import Select from '~/components/general/Select'
import PackageGrid from '~/components/general/PackageGrid'
import type { Package } from '~/models/Package.ts'
import If from '~/components/general/If'
import EmptyBlock from '~/components/features/EmptyBlock'
import styles from './PackagesByFilter.module.scss'
import PaginationControl from '~/components/features/PaginationControl'
import type { Pagination } from '~/types/globals.ts'

type DataSegmentation = Omit<DataSegmentationDto, 'total_supply'>

const dataSegmentationInitState: DataSegmentation = {
  classifications: [],
  countries: [],
  tags: [],
}
const paginationInitState: Pagination = {
  page: 0,
  pageSize: 8,
  totalPages: 1,
  totalItems: 0,
}

const PackagesByFilter: FC = () => {
  const { packageRegistryService } = useServices()

  const [filters, setFilters] = useState<Filters>({})
  const [dataSegmentation, setDataSegmentation] = useState<DataSegmentation>(dataSegmentationInitState)
  const [packages, setPackages] = useState<Package[]>([])
  const [pagination, setPagination] = useState<Pagination>(paginationInitState)
  const [page, setPage] = useState(0)

  const emptyFilters = useMemo<boolean>(() => {
    return Object.values(filters).every(item => Boolean(!item))
  }, [filters])

  const handleSelectChange = useCallback((value: string, name?: string) => {
    setFilters(prevState => ({ ...prevState, [name!]: value !== 'None' ? value : '' }))
  }, [])

  useEffect(() => {
    packageRegistryService.getPackagesByFilters(page, 8, filters).then(response => {
      setPackages(response.items)
      setPagination(response.pagination)
    })
  }, [packageRegistryService, filters, page])

  useEffect(() => {
    packageRegistryService.getDataSegmentation().then(response => setDataSegmentation(response))
  }, [packageRegistryService])

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <Select
          label="Type"
          placeholder="Select..."
          defaultValue={filters.kind || ''}
          options={['None', ...Object.values(PACKAGE_TYPES)]}
          name="kind"
          onSelect={handleSelectChange}
        />
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
      </div>
      <If condition={!packages.length}>
        <EmptyBlock variant={emptyFilters ? 'idle' : 'not-found'} />
      </If>
      <PackageGrid packages={packages} />
      <PaginationControl pagination={pagination} onPageChange={page => setPage(page)} />
    </div>
  )
}

export default PackagesByFilter
