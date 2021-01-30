import React from "react";
import Table from 'react-bootstrap/Table';
import { useTable } from "react-table";

const ReactTable=React.memo(({
  tableProps,
  getHeaderGroupProps,
  getHeaderProps,
  tableBodyProps,
  getRowProps,
  headerColumn,
  getCellProps,
  columns,
  data,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  return (
    <Table bordered {...getTableProps(tableProps)}>
      <thead>
        {headerGroups.map((headerGroup, numHeaderGroup) => (
          <tr {...headerGroup.getHeaderGroupProps(getHeaderGroupProps(headerGroup, numHeaderGroup))}>
            {headerGroup.headers.map((column, numColumn) => (
              <th {...column.getHeaderProps(getHeaderProps(column, numColumn))}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps(tableBodyProps)}>
        {rows.map((row, numRow) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps(getRowProps(row, numRow))}>
              {row.cells.map((cell, numCell) => {
                const CellType=cell.column.id && cell.column.id===headerColumn ? "th" : "td";
                return <CellType {...cell.getCellProps(getCellProps(cell, numCell))}>{cell.render('Cell')}</CellType>;
              })}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
});
ReactTable.defaultProps={
  getHeaderGroupProps: () => {},
  getHeaderProps: () => {},
  getRowProps: () => {},
  getCellProps: () => {},
}

export default ReactTable;