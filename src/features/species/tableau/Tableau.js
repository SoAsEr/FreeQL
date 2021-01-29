import React, { useState, useMemo, useCallback } from 'react';

import useResizeObserver from '../../../utils/useResizeObserver.js';


import * as Immutable from "immutable";
import update from "immutability-helper";

import { Scrollbars } from 'react-custom-scrollbars';

import { useTable } from 'react-table';

import Table from 'react-bootstrap/Table';
import is_number from 'is-number';
import { useDispatch, useSelector } from 'react-redux';
import { addLogKChange, removeLogKChange } from '../speciesSlice';
import { getLogKChange, getSpeciesDB, getSpeciesPresent } from '../speciesSelectors';
import { getComponentDB, getComponentsAtEquilibrium, getComponentsConc, getComponentsPresent } from '../../components/componentsSelectors';
import EditDefault from '../../../reusable_components/EditDefault';
import FormattedChemicalCompound from '../../../reusable_components/formatting/FormattedChemicalCompound.js';
import { getGasReplacements } from '../gases/gasInputSlice.js';

const LogKEditor=React.memo((props) => {
  const { dbLogK, specie, type} = props;
  const dispatch=useDispatch();
  return  (
    <EditDefault
      constantValidation={(input) => input.match(/^-?\d*\.?\d*$/)}
      onSubmitValidation={is_number}
      defaultValue={dbLogK}
      changedValue={useSelector(state => getLogKChange(state, {specie, type}))}
      onEdit={(value) => {
        dispatch(addLogKChange({specie, type, value: Number(value)}));
      }}
      onResetToDefault={() => {
        dispatch(removeLogKChange({specie, type}));
      }}
    />
  )
});

const TableauTable=React.memo((props) => {
  const {windowWidth}=props;

  const componentsPresent=useSelector(getComponentsPresent);
  const componentsAtEquilibium=useSelector(getComponentsAtEquilibrium);
  const componentsConc=useSelector(getComponentsConc);
  const componentDB=useSelector(getComponentDB);
  const gasReplacements=useSelector(getGasReplacements);

  const speciesPresent=useSelector(getSpeciesPresent);
  const speciesDB=useSelector(getSpeciesDB);

  const [topLeftWidth, setTopLeftWidth]=useState(0);
  const [topLeftHeight, setTopLeftHeight]=useState(0);
  const [logKWidth, setLogKWidth]=useState(0);
  const lg=windowWidth>=992;
  const headerColumn=useMemo(() => ({
    Header: "",
    Footer: () => (<><span className="d-none d-xl-block">Total Concentration</span><span className="d-block d-xl-none">Total Conc.</span></>),
    id: "name",
    accessor: ([specie, {name}]) => (<FormattedChemicalCompound>{name}</FormattedChemicalCompound>),
  }), []);
  const dataColumns=useMemo(() => Immutable.List(componentsPresent).map(component => {
    return {
      Header: () => (<FormattedChemicalCompound>{componentDB.components.get(component).name}</FormattedChemicalCompound>),
      Footer: () => componentsAtEquilibium.get(component) || gasReplacements.includes(component) ? "TBC" : componentsConc.get(component) ?? "", 
      id: component,
      accessor: ([specie, {components}]) => { return components.get(component) ?? 0},
    }
  }), [componentsPresent, componentsAtEquilibium, componentsConc, gasReplacements, componentDB]);
  const logKColumn=useMemo(() => ({
    Header: "logK",
    Footer: "",
    id: "logK",
    accessor: ([specie, {logK, type}]) => {return <LogKEditor dbLogK={logK} type={type} specie={specie}/>},
  }), []);
  const columns=useMemo(() => {
    if(lg){
      return dataColumns.unshift(headerColumn).push(logKColumn);
    } else {
      return dataColumns.unshift(logKColumn).unshift(headerColumn);
    }
  }, [headerColumn, dataColumns, logKColumn, lg]);
  const data=useMemo(() => 
    Immutable.List([
      Immutable.List(speciesPresent.aqs).map(specie => ([specie, {...speciesDB.aqs.get(specie), type: "aqs"}])),
      Immutable.List(speciesPresent.solids).map(specie => ([specie, {...speciesDB.solids.get(specie), type: "solids"}])),
      Immutable.List(speciesPresent.gases).map(specie => ([specie, {...speciesDB.gases.get(specie), type: "gases"}])),
    ]).flatten(true)
  , [speciesPresent, speciesDB]);

  const tableInstance = useTable({ columns, data });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  const topLeftRef=useResizeObserver(useCallback(({width, height}) => {
    setTopLeftWidth(width);
    setTopLeftHeight(height);
  }, [setTopLeftHeight]));
  
  const logKRef=useResizeObserver(useCallback(({width}) => {
    setLogKWidth(width);
  }, [setLogKWidth]));
  
  return(
    <Scrollbars 
      autoHide
      style={{width: "100%"}}
      autoHeight
      autoHeightMax="calc(90vh - 63px - 71px - 2rem)"
      renderTrackHorizontal={props => {
        const finalStyle = update(props.style,{ $merge: {
          right: 2,
          bottom: 2,
          left: 2,
          borderRadius: 3,
          marginLeft: topLeftWidth,
          marginRight: lg ? logKWidth : 0,
        }});
        return <div {...props} style={finalStyle}/>;
        }
      }
      renderTrackVertical={props => {
        const finalStyle = update(props.style,{ $merge: {
          right: 2,
          bottom: 2,
          top: 2,
          borderRadius: 3,
          marginTop: topLeftHeight,
        }});
        return <div {...props} style={finalStyle}/>;
        }
      }
    >
      <Table striped bordered hover {...getTableProps({
        style: {}
      })}>
        <thead>
          {
            headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  headerGroup.headers.map(column => {
                    if(!column.Header){
                      return <th {...column.getHeaderProps({className: "sticky sticky-header-y sticky-header-x-lg bg-white"})} ref={topLeftRef} />
                    } else if(column.id==="logK"){
                      return (
                        <th {...column.getHeaderProps({
                          className: "vertical-align-middle sticky-header-y sticky-column-lg sticky",
                        })} ref={logKRef}>
                          {
                            column.render('Header')
                          }
                        </th>
                      )
                    } else {
                      return (
                        <th {...column.getHeaderProps({
                          className: "vertical-align-middle sticky-header-y sticky",
                        })}>
                          {
                            column.render('Header')
                          }
                        </th>
                      )
                    }
                  })
                }
              </tr>
            ))
          }
        </thead>
        
        <tbody {...getTableBodyProps()}>
          {
          rows.map(row => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {
                  row.cells.map(cell => {
                    if(cell.column.id==="name"){
                      return (
                        <th {...cell.getCellProps({
                          className: "vertical-align-middle sticky-header-lg sticky",
                        })}>
                          {
                            cell.render('Cell')
                          }
                        </th>
                      )
                    } else if(cell.column.id==="logK"){
                      return (
                        <td {...cell.getCellProps({
                          className: "vertical-align-middle sticky-column-lg sticky",
                        })}>
                          {
                            cell.render('Cell')
                          }
                        </td>
                      )
                    } else {
                      return (
                        <td {...cell.getCellProps({
                          className: "vertical-align-middle",
                        })}>
                          {
                            cell.render('Cell')
                          }
                        </td>
                      )
                    }
                  })
                }
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          {footerGroups.map(group => (
            <tr {...group.getFooterGroupProps()}>
              {
                group.headers.map(column => {
                  if(column.id==="name"){
                    return (
                      <th {...column.getFooterProps({
                        className: "vertical-align-middle sticky-header-lg sticky",
                      })}>
                        {
                          column.render('Footer')
                        }
                      </th>
                    );
                  } else if(column.id==="logK"){
                    return (
                      <th {...column.getFooterProps({
                        className: "vertical-align-middle crossed-out sticky-column-lg sticky",
                      })}>
                        {
                          column.render('Footer')
                        }
                      </th>
                    )
                  } else {
                    return (
                      <td {...column.getFooterProps({
                        className: "vertical-align-middle sticky",
                      })}>
                        {
                          column.render('Footer')
                        }
                      </td>
                    );
                  }
                  
                })
              }
            </tr>
          ))}
        </tfoot>
      </Table>
    </Scrollbars>
  )
});

export default TableauTable;