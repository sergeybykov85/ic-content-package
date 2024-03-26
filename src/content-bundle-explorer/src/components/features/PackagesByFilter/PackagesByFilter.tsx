import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { type DataSegmentationDto, type PackageFilters, PACKAGE_TYPES } from '~/types/packageTypes.ts'
import { useServices } from '~/context/ServicesContext'
import Select from '~/components/general/Select'
import PackageGrid from '~/components/general/PackageGrid'
import type { PackageWithSubmitter } from '~/models/PackageWithSubmitter.ts'
import If from '~/components/general/If'
import Button from '~/components/general/Button'
import EmptyBlock from '~/components/features/EmptyBlock'
import styles from './PackagesByFilter.module.scss'
import PaginationControl from '~/components/features/PaginationControl'
import ChipsFilter from '~/components/features/ChipsFilter'

type DataSegmentation = Omit<DataSegmentationDto, 'total_supply'>

const dataSegmentationInitState: DataSegmentation = {
  classifications: [],
  countries: [],
  tags: [],
}

const PackagesByFilter: FC = () => {
  const { packageRegistryService } = useServices()

  const [filters, setFilters] = useState<PackageFilters>({})
  const [dataSegmentation, setDataSegmentation] = useState<DataSegmentation>(dataSegmentationInitState)
  const [packages, setPackages] = useState<PackageWithSubmitter[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)

  const emptyFilters = useMemo<boolean>(() => {
    return Object.values(filters).every(item => Boolean(!item))
  }, [filters])

  const handleFilterChange = useCallback((value: string, name?: string) => {
    setFilters(prevState => ({ ...prevState, [name!]: value !== 'None' ? value : '' }))
  }, [])

  useEffect(() => {
    packageRegistryService.getPackagesByFilters(page, 8, filters).then(response => {
      setPackages(response.items)
      setTotalPages(response.pagination.totalPages)
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
          onSelect={handleFilterChange}
        />
        <Select
          label="Country"
          placeholder="Select..."
          defaultValue={filters.countryCode || ''}
          options={['None', ...dataSegmentation.countries]}
          name="countryCode"
          onSelect={handleFilterChange}
        />
        <If condition={!emptyFilters}>
          <Button variant="text" text="Reset filters" onClick={() => setFilters({})} className={styles.reset} />
        </If>
      </div>
      <ChipsFilter
        data={dataSegmentation.classifications}
        label="Classifications:"
        name="classification"
        onChange={handleFilterChange}
        activeItem={filters.classification || ''}
        className={styles.chips}
      />
      <ChipsFilter
        data={dataSegmentation.tags}
        label="Tags:"
        name="tag"
        onChange={handleFilterChange}
        activeItem={filters.tag || ''}
        className={styles.chips}
        color="blue"
      />
      <If condition={!packages.length}>
        <EmptyBlock variant={emptyFilters ? 'idle' : 'not-found'} />
      </If>
      <PackageGrid packages={packages} />
      <PaginationControl pagination={{ page, totalPages }} onPageChange={setPage} />
    </div>
  )
}

export default PackagesByFilter
