
import React, { useState, useMemo, useCallback } from 'react';

import memoize from 'fast-memoize';

import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

import VirtualizedSelect from "react-select-virtualized";
import Select from 'react-select';


import * as Immutable from 'immutable';

import { stringMatchAllReplace } from './utils/string-utils';
import { createFormatOptionLabel } from './utils/react-select-utils';

import ConstantValidationTextInput from './utils/ConstantValidationTextInput';

import FormattedChemicalCompound from './Components/FormattedChemicalCompound';
import FormattedSupSub from './Components/FormattedSupSub';

import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import is_number from 'is-number';


const chargeSignRegex=/(?<Charge>(?<ChargeSign>[+-])(?:(?:1|(?<ChargeValue>[2-9]))|(?<EndMatcher>$|[:\s])))/g;
const chargeSignSwitcher=(match) => match.groups.ChargeValue+match.groups.ChargeSign;
const memoizedStringMatchAllReplace=memoize(stringMatchAllReplace);
const useComponentSearchFilter=(componentsDB) => {
  return useCallback((componentId, inputValue) => {
    const componentName=componentsDB().components.get(componentId).name;
    return componentName.toLowerCase().includes(inputValue.toLowerCase()) || memoizedStringMatchAllReplace(componentName, chargeSignRegex, chargeSignSwitcher).toLowerCase().includes(inputValue.toLowerCase());
  },[componentsDB]);
};

const ComponentSelect=React.memo((props) => {
  const {componentsPresent, componentsDB, addComponents}=props;
  const availableComponents=Array.from(componentsDB().components
    .filter((componentData, componentId) => !componentsPresent.includes(componentId)))
    .map(([componentId, componentData]) => ({value: componentId, label: componentData.name}));
  const searchFilter=useComponentSearchFilter(componentsDB);

  return(
    <VirtualizedSelect options={Array.from(availableComponents)} filterOption={(option, searchValue) => searchFilter(option.value, searchValue)} formatOptionLabel={createFormatOptionLabel(FormattedChemicalCompound)} onChange={useCallback((e) => {if(e) {addComponents([e.value])}}, [addComponents])} value=""/>
  )
});

const ComponentSelectModal=React.memo((props) => {
  const {componentsPresent, componentsDB, addComponents, windowHeight}=props;
  const [modalIsOpen, setModalIsOpen]=useState(false);
  const [componentsStaged, setComponentsStaged]=useState(Immutable.Set([]));
  const [searchValue, setSearchValue]=useState("");
  const searchFilter=useComponentSearchFilter(componentsDB);
  const componentsFiltered=useMemo(() => Array.from(componentsDB().components.filter((componentData, component) =>  {
      return !componentsPresent.includes(component) && searchFilter(component, searchValue);
  })), [componentsPresent, componentsDB, searchValue, searchFilter]);
  const reset=() => {
    setSearchValue("");
    setComponentsStaged(Immutable.Set([]));
  }
  return(
    <>
      <div className="hover-switch" style={{"width" : "15%"}} onClick={() => setModalIsOpen(true)}>
        <svg width="100%" viewBox="0 0 16 16" className="bi bi-plus-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
          <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"></path>
        </svg>
        <svg width="100%" viewBox="0 0 16 16" className="bi bi-plus-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
        </svg>
      </div>
      <Modal show={modalIsOpen} onHide={() =>{reset(); setModalIsOpen(false)}}>
        <Modal.Header closeButton>
          Add Components
        </Modal.Header>
        <Modal.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
                  <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                 </svg>
                </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control placeholder="Search" value={searchValue} onChange={(e) => {setSearchValue(e.target.value)}} className="sticky-top"/>
            {searchValue && <svg onClick={() => {setSearchValue("")}} width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x-circle-fill search-clearer" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>}
          </InputGroup>
          <AutoSizer disableHeight>
            {({width}) => <List 
              width={width}
              height={windowHeight-120-80-16}
              rowHeight={43}
              overscanRowCount={10}
              rowRenderer={({index, key, style}) => {
                const component=componentsFiltered[index];
                const isStaged=componentsStaged.includes(component[0]);
                return (
                  <div key={component[0]} style={style} className="p-2 d-flex align-items-center">
                    <span className="d-inline-block mr-auto"><FormattedChemicalCompound>{component[1].name}</FormattedChemicalCompound></span>
                    <Button onClick={() => {
                        if(isStaged){
                          setComponentsStaged(componentsStaged.delete(component[0]));
                        } else {
                          setComponentsStaged(componentsStaged.add(component[0]));
                        }
                      }}
                      variant={isStaged ? "secondary" : "primary"} size="sm">{isStaged ? "Cancel" : "Add"}
                    </Button>
                   
                  </div>
                )
              }}
              rowCount={componentsFiltered.length}
            />}
          </AutoSizer>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {reset(); addComponents(Array.from(componentsStaged)); setModalIsOpen(false);}}>
            {componentsStaged.size ? "Apply" : "Cancel"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});


const centerSelectStyles = {
  singleValue: styles => ({ ...styles, width: '100%', textAlign : "center" }),
  option: styles => ({ ...styles, width: '100%', textAlign : "center" }),
};

const ComponentListHeader=React.memo((props) => {
  const {hPlusOptionsRef, defaultVal, onChange}=props;
  return (
    <Row className="mt-4 mb-3">
      <Col xs="3" sm="5" className="center-items">
        <label className="w-100 d-none d-sm-block text-muted text-center">
          Components
        </label>
        <label className="w-100 d-block d-sm-none text-muted text-center">
          Comp.
        </label>
      </Col>
      <Col xs="7" sm="5">
        <Select isSearchable={false} options={hPlusOptionsRef.current} formatOptionLabel={createFormatOptionLabel(FormattedSupSub)} styles={centerSelectStyles} onChange={onChange} value={defaultVal}/>
      </Col>
      <Col xs="2" className="center-items">
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip>
              Equilibrium Concentration
            </Tooltip>
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="0.875rem" version="1.1" id="Layer_1" viewBox="0 0 139 119.177" overflow="visible" enableBackground="new 0 0 139 119.177">
            <line fill="none" stroke="#000000" strokeWidth="7" x1="139" y1="63.308" x2="0" y2="63.308"></line>
            <line fill="none" stroke="#000000" strokeWidth="6" x1="30.646" y1="92.308" x2="2.189" y2="65.308"></line>
            <line fill="none" stroke="#000000" strokeWidth="7" x1="3" y1="30.308" x2="133" y2="30.308"></line>
            <line fill="none" stroke="#000000" strokeWidth="6" x1="99.296" y1="2.308" x2="130.953" y2="28.608"></line>
            <path fill="none" stroke="#FFFFFF" strokeWidth="2" d="M53,118.177c2.333,0,4.667,0,7,0"></path>
          </svg>
        </OverlayTrigger>
      </Col>
    </Row>
  )
});


const ComponentRow=React.memo((props) => {
  const {component, updateConc, toggleChecked, noClose, disableCheck, removeComponents, controlChecked, componentsDB}=props;
  
  const [checked, setChecked]=useState(false);

  const onInputChange=(e) => {
    if(is_number(e.target.value)){
      updateConc(component, Number(e.target.value));
    } else {
      updateConc(component, null);
    }
  }

  const onCheckToggle=(e) => {
    setChecked(!checked);
    toggleChecked(component);
  }

  return(
    <Row className="mb-3 p-0">
      <Col xs="3" sm="5" className="w-100 justify-content-end d-flex flex-wrap">
        {!noClose && <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" className="bi bi-x lighten-hover mr-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg" onClick={() => removeComponents([component])}>
          <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>}
        <FormattedChemicalCompound>{componentsDB().components.get(component).name}</FormattedChemicalCompound>
      </Col>
      <Col xs="7" sm="5" className="d-flex align-items-center">
        <ConstantValidationTextInput validation={(input) => input.match(/^-?\d*\.?\d*e?-?\d*$/)} onChange={onInputChange}>
          <Form.Control className="text-center"/>
        </ConstantValidationTextInput>
      </Col>
      <Col xs="2" className="d-flex center-items">
        <Form.Check style={{"paddingLeft": "1.7rem"}} type="checkbox" checked={controlChecked ?? checked} disabled={disableCheck} onChange={onCheckToggle}/>
      </Col>
    </Row>
  );
});


const HPlusComponent=React.memo((props) => {
  const {componentsDB, updateConc, componentsInputState, pH}=props;
  return(
    <ComponentRow  component={componentsDB().hPlusValue} componentsDB={componentsDB} updateConc={pH ? useCallback((component, amt) => updateConc(component, Math.pow(10, -amt)), [updateConc]) : updateConc} disableCheck={true} controlChecked={componentsInputState.get(componentsDB().hPlusValue)?.get("equilChecked")} noClose/>
  );
});

const ComponentsList=React.memo((props) => {
  const {componentsDB, componentsPresent}=props;
  return (
    <>
      {componentsPresent.delete(componentsDB().hPlusValue).delete(componentsDB().waterValue).map(id => {
        return <ComponentRow {...props} key={id} component={id} componentsDB={componentsDB}/>
      })}
    </>
  )
});

export { ComponentSelect, ComponentSelectModal, ComponentsList, ComponentListHeader, HPlusComponent };