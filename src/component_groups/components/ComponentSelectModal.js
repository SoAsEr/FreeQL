
import React, { useState, useMemo } from 'react';

import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

import * as Immutable from 'immutable';

import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import useComponentSearchFilter from "./hooks/useComponentSearchFilter.js"

import FormattedChemicalCompound from "../../formatting/FormattedChemicalCompound.js";


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

export default ComponentSelectModal;