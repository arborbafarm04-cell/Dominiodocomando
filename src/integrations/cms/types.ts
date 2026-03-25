export interface CrudServiceOptions {
  singleRef?: string[];
  multiRef?: string[];
  limit?: number;
  skip?: number;
}

export interface CrudServiceResult<T> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
  currentPage: number;
  pageSize: number;
  nextSkip: number | null;
}
