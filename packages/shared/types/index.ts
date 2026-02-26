// Shared TypeScript types used across frontend and backend

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface DateRange {
  from: Date
  to: Date
}

export type SortOrder = 'asc' | 'desc'

export interface SortOptions {
  field: string
  order: SortOrder
}

export interface FilterOptions {
  search?: string
  sort?: SortOptions
  page?: number
  pageSize?: number
}
