import type { Pagination } from '~/types/globals.ts'

export default class PaginatedList<ItemType> {
  public pagination: Pagination
  public items: ItemType[]

  constructor(pagination: Omit<Pagination, 'totalPages'>, items: ItemType[]) {
    this.pagination = {
      ...pagination,
      totalPages: this.calcTotalPages(pagination),
    }
    this.items = items
  }

  private calcTotalPages = ({ totalItems, pageSize }: Omit<Pagination, 'totalPages'>): number => {
    return Math.ceil(totalItems / pageSize)
  }
}
