import { UseSortByColumnProps, UseSortByOptions, UseSortByState } from 'react-table';

declare module 'react-table' {
  // The app's tables install useSortBy; expose that plugin's supported fields.
  export interface TableOptions<D extends object> extends UseSortByOptions<D> {}
  export interface ColumnInstance<D extends object = {}> extends UseSortByColumnProps<D> {}
  export interface TableState<D extends object = {}> extends UseSortByState<D> {}
}
