import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

import ConstantValidationTextInput from "../utils/ConstantValidationTextInput";
import FormattedChemicalCompound from "../formatting/FormattedChemicalCompound";
import useResizeObserver from '../utils/useResizeObserver.js';


import * as Immutable from "immutable";
import update from "immutability-helper";

import { Scrollbars } from 'react-custom-scrollbars';

import { useTable } from 'react-table';

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import is_number from 'is-number';

const LogKEditor=(props) => {
  const { logKChanges, setLogKChanges, specie, defaultVal } = props;
  const [newLogKVal, setNewLogVal] = useState(logKChanges.get(specie));
  const [editing, setEditing] = useState(false);
  const [editBoxVal, setEditBoxVal] = useState("");
  const editBoxRef=useRef(null);
  const showDefault = newLogKVal===undefined;
  useEffect(() => {
    if(showDefault){
      setLogKChanges(logKChanges.delete(specie));
    } else {
      setLogKChanges(logKChanges.set(specie, newLogKVal));
    }
  }, [logKChanges, setLogKChanges, newLogKVal, showDefault, specie]);
  useEffect(() => {
    if(editing){
      editBoxRef.current.focus();
    }
  }, [editing, editBoxRef]);

  const beginEditVal=(e) => {
    setEditing(true);
  }
  const submitEditVal=(e) => {
    e.preventDefault();
    setEditing(false);
    setEditBoxVal("");
    setNewLogVal(is_number(editBoxVal) ? Number(editBoxVal) : undefined);
  }
  const cancelEditVal=(e) => {
    if(e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      setEditing(false);
      setEditBoxVal("");
    }
  }
  const onChangeEditBox=(e) => {
    setEditBoxVal(e.target.value);
  }
  const resetVal=(e) => {
    setNewLogVal(undefined);
  }
  if(editing){
    return (
      <Form onSubmit={submitEditVal}>
        <ConstantValidationTextInput validation={(input) => input.match(/^-?\d*\.?\d*$/)} onChange={onChangeEditBox} onBlur={submitEditVal}>
          <Form.Control ref={editBoxRef} style={{"width": "80px"}} onKeyDown={cancelEditVal}/>
        </ConstantValidationTextInput>
      </Form>
    )
  } else if(showDefault) {
    return (
      <span className="text-nowrap">
        {defaultVal.toFixed(3).replace(/\.000$|0{0,2}$/, "")}
        <svg onClick={beginEditVal} className="logK-editor" style={{"marginTop": "-0.2rem"}} width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.39.242l-3 1a1 1 0 0 1-1.266-1.265l1-3a1 1 0 0 1 .242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"></path>
          <path fillRule="evenodd" d="M12.146 6.354l-2.5-2.5.708-.708 2.5 2.5-.707.708zM3 10v.5a.5.5 0 0 0 .5.5H4v.5a.5.5 0 0 0 .5.5H5v.5a.5.5 0 0 0 .5.5H6v-1.5a.5.5 0 0 0-.5-.5H5v-.5a.5.5 0 0 0-.5-.5H3z"></path>
        </svg>
      </span>
    )
  } else {
    return (
      <span className="text-nowrap">
        {newLogKVal.toFixed(3).replace(/\.000$|0{0,2}$/, "")}
        <svg onClick={resetVal} className="logK-reset" style={{"marginTop" : "-0.12rem"}} width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12.83 6.706a5 5 0 0 0-7.103-3.16.5.5 0 1 1-.454-.892A6 6 0 1 1 2.545 5.5a.5.5 0 1 1 .91.417 5 5 0 1 0 9.375.789z"></path>
          <path fillRule="evenodd" d="M7.854.146a.5.5 0 0 0-.708 0l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 1 0 .708-.708L5.707 3 7.854.854a.5.5 0 0 0 0-.708z"></path>
        </svg>
      </span>
    )
  }
}

const TableauTable=React.memo((props) => {
  const {componentsPresent, componentsInputState, speciesHere, speciesDB, componentsDB, logKChanges, setLogKChanges, windowWidth}=props;

  const setTypedLogKChanges=useCallback((type, newMap) => {
    setLogKChanges(update(logKChanges, {[type]: {$set: newMap}}));
  }, [setLogKChanges, logKChanges]);

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
  const dataColumns=useMemo(() => Immutable.List(componentsPresent.delete(componentsDB().waterValue)).map(component => {
    return {
      Header: () => (<FormattedChemicalCompound>{componentsDB().components.get(component).name}</FormattedChemicalCompound>),
      Footer: componentsInputState.getIn([component, "equilChecked"]) ? "TBC" : componentsInputState.getIn([component, "conc"]), 
      id: component,
      accessor: ([specie, {components}]) => { return components.get(component) ?? 0},
    }
  }), [componentsPresent, componentsInputState, componentsDB]);
  const logKColumn=useMemo(() => ({
    Header: "logK",
    Footer: "",
    id: "logK",
    accessor: ([specie, {logK, type, logKChanges}]) => {return <LogKEditor specie={specie} defaultVal={logK} logKChanges={logKChanges} setLogKChanges={setTypedLogKChanges.bind(null, type)}/>},
  }), [setTypedLogKChanges]);
  const columns=useMemo(() => {
    if(lg){
      return dataColumns.unshift(headerColumn).push(logKColumn);
    } else {
      return dataColumns.unshift(logKColumn).unshift(headerColumn);
    }
  }, [headerColumn, dataColumns, logKColumn, lg]);
  const data=useMemo(() => 
    Immutable.List([
      Immutable.List(speciesHere().aqs).map(specie => ([specie, {...speciesDB().aqs.species.get(specie), logKChanges: logKChanges.aqs, type: "aqs"}])),
      Immutable.List(speciesHere().solids).map(specie => ([specie, {...speciesDB().solids.species.get(specie), logKChanges: logKChanges.solids, type: "solids"}])),
      Immutable.List(speciesHere().gases).map(specie => ([specie, {...speciesDB().gases.species.get(specie), logKChanges: logKChanges.gases, type: "gases"}])),
    ]).flatten(true)
  , [speciesHere, speciesDB, logKChanges]);

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