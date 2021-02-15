import React from "react";
import { useTable } from "react-table";

const defaultTableClass="border-seperate border-gray-400 border border-spacing-0";
const defaultHeaderGroupClass="";
const defaultHeaderClass="";
const defaultTaableBodyProps="";
const defaultRowProps="";
const defaultCellProps="border border-gray-400";

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
    <table {...getTableProps(tableProps)}>
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
    </table>
  )
});
ReactTable.defaultProps={
  getHeaderGroupProps: () => {},
  getHeaderProps: () => {},
  getRowProps: () => {},
  getCellProps: () => {},
}

export default ReactTable;