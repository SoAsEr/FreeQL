import React, { useCallback, useMemo, useState } from "react";
import * as Immutable from "immutable";

import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import { numberToExpWithTrailing } from "../../utils/string-utils.js"
import { cumulativeSum } from "../../utils/array-utils.js";
import FormattedChemicalCompound from "../../reusable_components/formatting/FormattedChemicalCompound.js";
import { useSelector } from "react-redux";

import ReactPaginate from 'react-paginate';
import useWindowSize from "../../utils/useWindowSize.js";
import { getEquilibria } from "./equilibriaSlice.js";
import { pending } from "../loading/loadingSlice.js";
import SpinnerComponentRow from "../../reusable_components/SpinnerRow.js";
import ReactTable from "../../reusable_components/ReactTable.js";
/*
7.7 ph
10^-3.5 
tic = 10^-3

*/



const ConcentrationTable=React.memo(({ context, equilibrium, style, className }) => {
  const columns=useMemo(() => [
    {
      Header: "Species",
      id: "name",
      accessor: ({id, db}) => <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
    },
    {
      Header: "Conc",
      id: "conc",
      accessor: ({concentration}) => numberToExpWithTrailing(concentration, 4)
    },
    {
      Header: () => <>&minus;log(Conc)</>,
      id: "negLogConc",
      accessor: ({concentration}) => numberToExpWithTrailing(-Math.log10(concentration), 4)
    },
  ], []);
  console.log(equilibrium);

  const data=useMemo(() => Immutable.List([
    Immutable.List(equilibrium.species.component.map(({componentId, concentration}) => ({id: componentId, concentration, db: context.componentDB.components }))),
    Immutable.List(equilibrium.species.aqueous.map(({id, concentration}) => ({id, concentration, db: context.speciesDB.aqs }))).sortBy(({id}) => context.speciesDB.aqs.get(id).index),
    Immutable.List(equilibrium.species?.solid?.present?.map(({id, concentration}) => ({id, concentration, db: context.speciesDB.solids }))).sortBy(({id}) => context.speciesDB.solids.get(id).index),
  ]).flatten(true), [equilibrium, context]);
  const borderLengths=useMemo(() => Immutable.Set(cumulativeSum([equilibrium.species.component.length, equilibrium.species.aqueous.length, equilibrium.solid?.present?.length ?? 0])).filter(item => item!==data.size && item!==0), [equilibrium, data.size]);
  console.log(borderLengths)
  return (
    <ReactTable
      columns={columns}
      data={data}
      headerColumn={"name"}
      getCellProps={useCallback((cell) => {return borderLengths.has(cell.row.index+1) ? {style : {"borderBottom": "3px solid #dee2e6"}} : {}})}
    />
  );
});

const TotalConcentrationTable=React.memo(({context, equilibrium, style, className}) => {

  const columns=useMemo(() => [
    {
      Header: "Component",
      id: "name",
      accessor: ({id, db}) => <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
    },
    {
      Header: "Calculated Total Conc",
      id: "totalConc",
      accessor: ({total}) => numberToExpWithTrailing(total, 4)
    },
  ], []);

  const data=useMemo(() => Immutable.List(equilibrium.totalConcentrations.map(({componentId, total}) => ({id: componentId, total, db: context.componentDB.components }))).sortBy(({id}) => context.componentDB.components), [context, equilibrium]);

  return (
    <ReactTable
      columns={columns}
      data={data}
      headerColumn={"name"}
    />
  );
  
});

const SolublilityProductTable=React.memo(({context, equilibrium, style, className}) => {
  if(!equilibrium.species.solid?.notPresent?.length){
    return <></>;
  }
  
  const columns=useMemo(() => [
    {
      Header: "Solid (considered)",
      id: "name",
      accessor: ({id, db}) => <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
    },
    {
      Header: "Solubility Product",
      id: "solubilityProduct",
      accessor: ({solubilityProduct}) => numberToExpWithTrailing(solubilityProduct, 4)
    },
  ], []);

  const data=useMemo(() => Immutable.List(equilibrium.species.solid.notPresent.map(({id, solubilityProduct}) => ({id, solubilityProduct, db: context.speciesDB.solids }))).sortBy(({id}) => context.speciesDB.solids.get(id).index), [equilibrium, context]);

  return (
    <ReactTable
      columns={columns}
      data={data}
      headerColumn={"name"}
    />
  );
});


const ExtraSolublilityProductTable=React.memo(({context, equilibrium, style, className}) => {
  if(!equilibrium?.extraSolubilityProducts.length){
    return <></>;
  }
  
  const columns=useMemo(() => [
    {
      Header: "Solid (not considered)",
      id: "name",
      accessor: ({id, db}) => <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
    },
    {
      Header: "Solubility Product",
      id: "solubilityProduct",
      accessor: ({solubilityProduct}) => numberToExpWithTrailing(solubilityProduct, 4)
    },
  ], []);

  const data=useMemo(() => Immutable.List(equilibrium.extraSolubilityProducts.map(({id, solubilityProduct}) => ({id, solubilityProduct, db: context.speciesDB.solids }))).sortBy(({solubilityProduct}) => solubilityProduct).reverse(), [equilibrium, context]);

  return (
    <ReactTable
      columns={columns}
      data={data}
      headerColumn={"name"}
      getRowProps={useCallback((row) => {return Number(row.values.solubilityProduct)>1 ? {style: {border: "red 4px solid"}} : {}})}
    />
  );
});

const ResultTables=React.memo((props) => {
  return (
    <>
      <ConcentrationTable {...props} className="mb-4 mb-lc-0"/>
      <TotalConcentrationTable {...props} className="mb-4 mb-lc-0"/>
      <SolublilityProductTable {...props} className="mb-4 mb-lc-0"/>
      <ExtraSolublilityProductTable {...props} className="mb-4 mb-lc-0"/>
    </>
  );
});

const ResultError=React.memo(({error}) => {
  return <>{"Error: "+error.toString()}</>;
});

const ResultErrors=React.memo(({errors}) => {
  return (
    <Row>
      <h3>The Following Errors were found:</h3>
      <p>{errors.map(error => <ResultError error={error}/>)}</p>
    </Row>
  )
});


const ResultPage = React.memo(({equilibrium}) => {
  if(equilibrium.result===pending){
    return <SpinnerComponentRow/>
  } else {
    return (
      <>
        {equilibrium.result.equilibrium && <ResultTables context={equilibrium.context} equilibrium={equilibrium.result.equilibrium}/>}
        {equilibrium.result.errors && <ResultErrors context={equilibrium.context} errors={equilibrium.result.errors}/>}
      </>
    )
  }
});

const Results = React.memo(({Footer, Body}) => {
  const windowSize=useWindowSize();

  const equilibria=useSelector(getEquilibria);
  console.log(equilibria);
  const [pageNumber, setPageNumber]=useState(equilibria.size-1);

  const lg=windowSize.width>=992;
  const sm=windowSize.width>=576;
  return (
    <>
      <Body>
        <ResultPage equilibrium={equilibria.get(pageNumber)}/>
      </Body>
      <Footer>
        <Container fluid>
          <Row>
            <nav className="w-100">
              <ReactPaginate
                initialPage={equilibria.size-1}
                onPageChange={({selected}) => {setPageNumber(selected)}}
                pageCount={equilibria.size}
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