import React, { useMemo } from "react";
import * as Immutable from "immutable";
import { useTable } from "react-table";

import Table from 'react-bootstrap/Table';

import { numberToExpWithTrailing } from "../utils/string-utils.js"
import { cumulativeSum } from "../utils/array-utils.js";
import FormattedChemicalCompound from "../formatting/FormattedChemicalCompound.js";

const ConcentrationTable=React.memo((props) => {
  const { currentResult, style, className } = props;
  const columns=useMemo(() => [
    {
      Header: "Species",
      id: "name",
      accessor: ([id, {name}]) => <FormattedChemicalCompound>{name}</FormattedChemicalCompound>
    },
    {
      Header: "Conc",
      id: "conc",
      accessor: ([id, {conc}]) => numberToExpWithTrailing(conc, 4)
    },
    {
      Header: () => <>&minus;log(Conc)</>,
      id: "negLogConc",
      accessor: ([id, {conc}]) => numberToExpWithTrailing(-Math.log10(conc), 4)
    },
  ], [])

  const data=useMemo(() => Immutable.List([
    Immutable.List(currentResult().components),
    Immutable.List(currentResult().aqs),
    Immutable.List(currentResult().solidsPresent),
  ]).flatten(true), [currentResult]);
  console.log(data);
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

  const borderLengths=useMemo(() => Immutable.Set(cumulativeSum([currentResult().components.size, currentResult().aqs.size, currentResult().solidsPresent.size])).filter(item => item!==data.size && item!==0), [currentResult, data.size]);
  return (
    <Table bordered {...getTableProps({style, className})}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                const CellType=cell.column.id==="name" ? "th" : "td";
                return <CellType {...cell.getCellProps(borderLengths.has(i+1) ? {style : {"borderBottom": "3px solid #dee2e6"}} : {})}>{cell.render('Cell')}</CellType>;
              })}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
});

const TotalConcentrationTable=React.memo((props) => {

  const {currentResult, style, className} = props;

  const columns=useMemo(() => [
    {
      Header: "Component",
      id: "name",
      accessor: ([id, {name}]) => <FormattedChemicalCompound>{name}</FormattedChemicalCompound>
    },
    {
      Header: "Calculated Total Conc",
      id: "totalConc",
      accessor: ([id, {totalConc}]) => numberToExpWithTrailing(totalConc, 4)
    },
  ], []);

  const data=useMemo(() => Immutable.List(currentResult().components), [currentResult]);

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
    <Table bordered {...getTableProps({style, className})}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                const CellType=cell.column.id==="name" ? "th" : "td";
                return <CellType {...cell.getCellProps()}>{cell.render('Cell')}</CellType>;
              })}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
});

const SolublilityProductTable=React.memo((props) => {
  const {currentResult, style, className} = props;

  if(!currentResult().solidsNotPresent.size){
    return <></>;
  }
  
  const columns=useMemo(() => [
    {
      Header: "Solid",
      id: "name",
      accessor: ([id, {name}]) => <FormattedChemicalCompound>{name}</FormattedChemicalCompound>
    },
    {
      Header: "Solubility Product",
      id: "solProd",
      accessor: ([id, {solubilityProduct}]) => numberToExpWithTrailing(solubilityProduct, 4)
    },
  ], []);

  const data=useMemo(() => Immutable.List(currentResult().solidsNotPresent), [currentResult]);

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
    <Table bordered {...getTableProps({style, className})}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                const CellType=cell.column.id==="name" ? "th" : "td";
                return <CellType {...cell.getCellProps()}>{cell.render('Cell')}</CellType>;
              })}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
});

const ResultTables=React.memo((props) => {
  return (
    <>
      <ConcentrationTable currentResult={props.currentResult} className="mb-4 mb-lc-0"/>
      <TotalConcentrationTable currentResult={props.currentResult} className="mb-4 mb-lc-0"/>
      <SolublilityProductTable currentResult={props.currentResult} className="mb-4 mb-lc-0"/>
    </>
  );
});

const ResultError=React.memo((props) => {
  const {currentResult} = props;
  return <>{"Error: "+currentResult().message}</>;
});


const Results = React.memo((props) => {
  const { currentResult } = props;
  console.log(currentResult())
  if(currentResult() instanceof Error){
    return <ResultError currentResult={currentResult}/>;
  } else {
    return <ResultTables currentResult={currentResult}/>;
  }
});
export default Results;  