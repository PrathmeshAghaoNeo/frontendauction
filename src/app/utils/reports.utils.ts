export interface FilterSortOptions {
  data: any[];
  searchText: string;
  searchableFields: string[];
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export function applyFilterAndSort(options: FilterSortOptions): any[] {
  const { data, searchText, searchableFields, sortColumn, sortDirection } =
    options;

  // Filter
  let result = data.filter((item) =>
    searchableFields.some((field) =>
      (item[field] ?? '')
        .toString()
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )
  );

  // Sort
  if (sortColumn && sortDirection) {
    result = result.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  return result;
}

export interface PaginationOptions {
  data: any[];
  currentPage: number;
  itemsPerPage: number;
}

export function paginateData(options: PaginationOptions): any[] {
  const { data, currentPage, itemsPerPage } = options;
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
}
