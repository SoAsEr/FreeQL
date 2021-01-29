
import React, { useCallback } from 'react';

import * as Immutable from 'immutable';


import Modal from 'react-bootstrap/Modal';

import useComponentSearchFilter from "./useComponentSearchFilter.js"

import FormattedChemicalCompound from "../../reusable_components/formatting/FormattedChemicalCompound.js";

import { useDispatch, useSelector } from "react-redux";
import StagedAdder from '../../reusable_components/StagedAdder.js';
import {getComponentDB } from './componentsSelectors.js';
import { addComponents } from './componentsSlice.js';


const ComponentSelectModal=React.memo(({show, close, windowHeight}) => {
  const componentsPresent=useSelector(state => state.components.present);
  const dispatch=useDispatch();
  const componentDB=useSelector(getComponentDB);
  const searchFilter=useComponentSearchFilter(componentDB);

  return(
    <>
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          Add Components
        </Modal.Header>
        <StagedAdder 
          height={windowHeight-120-80-16} 
          items={Immutable.List(componentDB.components.delete(componentDB.waterValue).deleteAll(componentsPresent).keys())} 
          rowLabelCreator={(item) => {
            return <span className="d-inline-block mr-auto"><FormattedChemicalCompound>{componentDB.components.get(item).name}</FormattedChemicalCompound></span>
          }}
          onConfirm={useCallback((listAdded) => {
            dispatch(addComponents(listAdded));
            close();
          }, [dispatch, close])}
          onCancel={useCallback(() => {
            close();
          }, [close])}
          filterFn={searchFilter}
          Body={Modal.Body}
          Footer={Modal.Footer}
        />
      </Modal>
    </>
  );
});

export default ComponentSelectModal;