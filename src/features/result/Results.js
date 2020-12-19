import React, { useMemo, useState } from "react";
import * as Immutable from "immutable";
import { useTable } from "react-table";

import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import { numberToExpWithTrailing } from "../../utils/string-utils.js"
import { cumulativeSum } from "../../utils/array-utils.js";
import FormattedChemicalCompound from "../../reusable_components/formatting/FormattedChemicalCompound.js";
import { useSelector } from "react-redux";
import { getCalculations, getResult } from "./resultsSlice.js";

import ReactPaginate from 'react-paginate';
import useWindowSize from "../../utils/useWindowSize.js";

const ConcentrationTable=React.memo(({ currentContext, currentResult, style, className }) => {
  const columns=useMemo(() => [
    {
      Header: "Species",
      id: "name",
      accessor: ([id, {db}]) => <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
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
    Immutable.List(currentResult.components.map(component => ({...component, db: currentContext.componentDB.components }))),
    Immutable.List(currentResult.aqs.map(component => ({...component, db: currentContext.speciesDB.aqs }))),
    Immutable.List(currentResult.solidsPresent.map(component => ({...component, db: currentContext.speciesDB.solids }))),
  ]).flatten(true), [currentResult, currentContext]);

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

  const borderLengths=useMemo(() => Immutable.Set(cumulativeSum([currentResult.components.size, currentResult.aqs.size, currentResult.solidsPresent.size])).filter(item => item!==data.size && item!==0), [currentResult, data.size]);
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

const TotalConcentrationTable=React.memo(({currentResult, currentContext, style, className}) => {

  const columns=useMemo(() => [
    {
      Header: "Component",
      id: "name",
      accessor: ([id, {db}]) => <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
    },
    {
      Header: "Calculated Total Conc",
      id: "totalConc",
      accessor: ([id, {totalConc}]) => numberToExpWithTrailing(totalConc, 4)
    },
  ], []);

  const data=useMemo(() => Immutable.List(currentResult.components.map(component => ({...component, db: currentContext.componentDB.components }))), [currentResult, currentContext]);

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

const SolublilityProductTable=React.memo(({currentResult, currentContext, style, className}) => {

  if(!currentResult.solidsNotPresent.size){
    return <></>;
  }
  
  const columns=useMemo(() => [
    {
      Header: "Solid",
      id: "name",
      accessor: ([id, {db}]) => <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
    },
    {
      Header: "Solubility Product",
      id: "solProd",
      accessor: ([id, {solubilityProduct}]) => numberToExpWithTrailing(solubilityProduct, 4)
    },
  ], []);

  const data=useMemo(() => Immutable.List(currentResult.solidsNotPresent.map(component => ({...component, db: currentContext.speciesDB.solids }))), [currentResult, currentContext]);

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
      <ConcentrationTable {...props} className="mb-4 mb-lc-0"/>
      <TotalConcentrationTable {...props} className="mb-4 mb-lc-0"/>
      <SolublilityProductTable {...props} className="mb-4 mb-lc-0"/>
    </>
  );
});

const ResultError=React.memo(({currentResult}) => {
  return <>{"Error: "+currentResult.message}</>;
});


const ResultPage = React.memo(({context}) => {
  const currentResult=useSelector(state => getResult(state, {context}));
  if(currentResult.name || currentResult instanceof Error){
    return <ResultError currentContext={context} currentResult={currentResult}/>;
  } else {
    return <ResultTables currentContext={context} currentResult={currentResult}/>;
  }
});

const Results = React.memo(({Footer, Body}) => {
  const windowSize=useWindowSize();

  const calculations=useSelector(getCalculations);
  const [pageNumber, setPageNumber]=useState(calculations.size-1);

  const lg=windowSize.width>=992;
  const sm=windowSize.width>=576;

  return (
    <>
      <Body>
        <ResultPage context={calculations.get(pageNumber)}/>
      </Body>
      <Footer>
        <Container fluid>
          <Row>
            <nav className="w-100">
              <ReactPaginate
                initialPage={calculations.size-1}
                onPageChange={({selected}) => {setPageNumber(selected)}}
                pageCount={calculations.size}
                previousLabel=
                {
                  <>
                    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-chevron-left" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    <label className="d-none d-md-inline-block m-0">Previous</label>
                  </>
                }
                nextLabel=
                {
                  <>
                    <label className="d-none d-md-inline-block m-0">Next</label>
                    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-chevron-right" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </>
                  
                }
                breakLabel={'...'}
                marginPagesDisplayed={sm ? 2 : 1}
                pageRangeDisplayed={sm ? lg ? 4 : 3 : 1}
                containerClassName={"pagination w-100 d-flex"}
                pageClassName={"page-item w-100 text-center nowrap no-select"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item w-100 text-center nowrap no-select"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item w-100 text-center nowrap no-select"}
                nextLinkClassName={"page-link"}
                breakClassName={"page-item w-100 text-center nowrap no-select"}
                breakLinkClassName={"page-link"}
                activeClassName={'active'}
              />
            </nav>
          </Row>
        </Container>
      </Footer>
    </>
  )
})


export default Results;  