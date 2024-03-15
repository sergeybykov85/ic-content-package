import type { Pagination } from '~/types/globals.ts'
import { type FC, type MouseEventHandler, useCallback } from 'react'
import { useMemo } from 'react'
import If from '~/components/general/If'
import styles from './PaginationControl.module.scss'
import clsx from 'clsx'

interface PaginationProps {
  pagination: Pick<Pagination, 'totalPages' | 'page'>
  onPageChange: (page: number) => void
  className?: string
}

const PaginationControl: FC<PaginationProps> = ({ pagination, onPageChange, className }) => {
  const pages = useMemo(() => {
    const { page, totalPages } = pagination
    if (totalPages <= 7) {
      return [...Array(totalPages).keys()]
    } else if (page < 4) {
      return [...Array(7).keys()]
    } else if (totalPages - page < 4) {
      return Array.from({ length: 7 }, (_, index) => totalPages - 7 + index)
    } else {
      return Array.from({ length: 7 }, (_, index) => page - 3 + index)
    }
  }, [pagination])

  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    event => {
      onPageChange(Number(event.currentTarget.value))
    },
    [onPageChange],
  )

  if (pagination.totalPages < 2) {
    return null
  }

  return (
    <div className={clsx(styles.paginator, className)}>
      <If condition={pagination.page !== 0}>
        <button value={0} onClick={onClick}>
          {'<<'}
        </button>
        <button value={pagination.page - 1} onClick={onClick}>
          {'<'}
        </button>
      </If>
      {pages.map(item => (
        <button key={item} value={item} className={clsx(item === pagination.page && styles.current)} onClick={onClick}>
          {item + 1}
        </button>
      ))}
      <If condition={pagination.page !== pagination.totalPages - 1}>
        <button value={pagination.page + 1} onClick={onClick}>
          {'>'}
        </button>
        <button value={pagination.totalPages - 1} onClick={onClick}>
          {'>>'}
        </button>
      </If>
    </div>
  )
}

export default PaginationControl
