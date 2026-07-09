import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

type DataTableColumn<Row> = {
  header: ReactNode;
  cell: (row: Row, rowIndex: number) => ReactNode;
  key?: string;
};

type DataTableProps<Row> = {
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  emptyMessage?: string;
  getRowKey?: (row: Row, rowIndex: number) => string | number;
};

function DataTable<Row>({ columns, rows, emptyMessage = 'No rows', getRowKey }: DataTableProps<Row>) {
  return (
    <div className="table-wrap">
      <table>
        {columns.length > 0 ? (
          <thead>
            <tr>
              {columns.map((column, columnIndex) => (
                <th key={column.key ?? columnIndex}>{column.header}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)}>
                <EmptyState compact>{emptyMessage}</EmptyState>
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={getRowKey?.(row, rowIndex) ?? rowIndex}>
                {columns.map((column, columnIndex) => (
                  <td key={column.key ?? columnIndex}>{column.cell(row, rowIndex)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };
export type { DataTableColumn };
