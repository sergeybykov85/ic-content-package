import type { Pagination } from '~/types/globals.ts'

export default class PaginatedList<DataType> {
  public pagination: Pagination
  public data: DataType[]

  constructor(pagination: Omit<Pagination, 'totalPages'>, data: DataType[]) {
    this.pagination = {
      ...pagination,
      totalPages: this.calcTotalPages(pagination),
    }
    this.data = data
  }

  private calcTotalPages = ({ totalItems, pageSize }: Omit<Pagination, 'totalPages'>): number => {
    return Math.ceil(totalItems / pageSize)
  }
}
