import React, { useEffect, useCallback, useLayoutEffect, useRef } from 'react';

import memoize from 'fast-memoize';

import useModalStack from './utils/useModalStack.js';
import CalculateButton from './features/equilibria/CalculateButton';
import ReduxSuspense from './features/loading/ReduxSuspense';
import { getNewComponentDB, hPlusOptionChanged, hPlusOptions } from './features/components/componentsSlice';
import { getNewSpeciesDB } from './features/species/speciesSlice';

import { useDispatch, useSelector } from 'react-redux';

import SpinnerComponentRow from './reusable_components/SpinnerRow';

import {componentDBDefaultParams, speciesDBDefaultParams} from "./features/fetchDBs.js"


import PlusCircle from './reusable_components/svgs/plus-circle.js';
import PlusCircleFilled from './reusable_components/svgs/plus-circle-filled.js';
import { getComponentsPresent, getHPlusOption } from './features/components/componentsSelectors.js';
import Select  from 'react-select';
import ListHeader from './reusable_components/ListHeader.js';
import AbbreviatingLabel from './reusable_components/AbbreviatingLabel.js';
import { createFormatOptionLabel } from './utils/react-select-utils.js';


const Equilibria = React.lazy(() => import('./features/equilibria/Equilibria.js'));
const ComponentList = React.lazy(() => import("./features/components/ComponentList.js"));

const HPlusRow = React.lazy(() => import('./features/components/HPlusRow.js'));

const ComponentSelectModal = React.lazy(() => import("./features/components/ComponentSelectModal.js"))
const ComponentSelect = React.lazy(() => import("./features/components/ComponentSelect.js"))

const SpeciesList = React.lazy(() => import('./features/species/SpeciesList.js'));
const TableauTable = React.lazy(() => import('./features/species/tableau/Tableau.js'));


const centerSelectStyles = {
  option: styles => ({ ...styles, width: '100%', textAlign : "center" }),
  singleValue: styles => ({ ...styles, width: '100%', textAlign : "center" }),
};



const FreeQL=(props) => {
  const dispatch=useDispatch();
  useEffect(() => {
    dispatch(getNewComponentDB(componentDBDefaultParams));
    dispatch(getNewSpeciesDB(speciesDBDefaultParams));
  }, [dispatch])
  
  const [currentModal, openModal, closeModal]=useModalStack();

  const createModalOpenCallback=useCallback(memoize((params) => {
    return () => openModal(params);
  }), [openModal]);
  const createModalCloseCallback=useCallback(memoize((params) => {
    return () => closeModal(params);
  }), [closeModal]);

  return(
    <div className="flex flex-col h-full">
      <div className="flex flex-grow min-h-0">
        <div className="h-full flex-grow">
          <div className="overflow-auto max-h-full select-dropdown:max-h-component px-3">
            <ListHeader
              label=""
              inputLabel={
                <label className="w-full">
                  <Select
                    menuPosition="fixed"
                    className="w-full"
                    isSearchable={false}
                    isClearable={false}
                    options={Object.values(hPlusOptions)} 
                    styles={centerSelectStyles} 
                    value={useSelector(getHPlusOption)}
                    onChange={(option) => {
                      dispatch(hPlusOptionChanged(option));
                    }} 
                  />
                </label>
              }
            />
            <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
              <HPlusRow />
            </ReduxSuspense>
            <ListHeader
              label={
                <AbbreviatingLabel abbr="Comp" breakpoint="sm">Components</AbbreviatingLabel>
              }
              inputLabel={<label>Conc.</label>}
            />
            <ReduxSuspense fallback="" subscribedItems={["componentDB"]}>
              <ComponentList />
            </ReduxSuspense>
            <div className="flex select-dropdown:hidden w-full">
              <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
                <div className="group w-1/6 mx-auto max-w-16" onClick={createModalOpenCallback("addComponents")}>
                  <PlusCircle className="w-full block group-hover:hidden"/>
                  <PlusCircleFilled className="w-full hidden group-hover:block"/>
                </div>
                <ComponentSelectModal show={currentModal==="addComponents"} close={createModalCloseCallback("addComponents")}/>
              </ReduxSuspense>
            </div>
          </div>
          <div className="hidden select-dropdown:block mt-4 w-full px-3">
            <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
              <ComponentSelect/>
            </ReduxSuspense>
          </div>
        </div>
        <div className="overflow-auto relative hidden md:block h-full w-5/12 px-3">
          <div>
            <div className="flex mt-2 w-full">
              <label className="text-lg text-gray-500 mx-auto">
                Species
              </label>
            </div>
            <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB", "speciesDB"]}>
              <SpeciesList openTableauModal={createModalOpenCallback("tableau")} />
            </ReduxSuspense>
          </div>
        </div>
      </div>
      <div className="my-3">
        <CalculateButton onClick={createModalOpenCallback("equilibria")}/>
        {
          //<button className="flex-grow md:hidden" variant="primary" onClick={createModalOpenCallback("species")}>Select Species</button>
        }
      </div>
      {/*
      <Modal show={currentModal==="species"} onHide={createModalCloseCallback("species")} backdrop="static" scrollable>
        <Modal.Header closeButton>
          Species
        </Modal.Header>
        <Modal.Body>
          <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB", "speciesDB"]}>
            <SpeciesList openTableauModal={createModalOpenCallback("tableau")}/>
          </ReduxSuspense>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={createModalCloseCallback("species")}>
            Close
          </Button>
          <CalculateButton onClick={createModalOpenCallback("equilibria")} className="ml-auto" variant="primary" />
        </Modal.Footer>
      </Modal>
      <Modal size="xl" show={currentModal==="tableau"} onHide={createModalCloseCallback("tableau")} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Tableau</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB", "speciesDB"]}>
            <TableauTable windowWidth={windowSize.width} />
          </ReduxSuspense>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={createModalCloseCallback("tableau")}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal size="xl" show={currentModal==="equilibria"} onHide={createModalCloseCallback(["equilibria", "species"])} backdrop="static" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Equilibria</Modal.Title>
        </Modal.Header>
        <ReduxSuspense fallback={<><Modal.Body><SpinnerComponentRow/></Modal.Body><Modal.Footer></Modal.Footer></>} subscribedItems={["componentDB", "speciesDB"]}>
          <Equilibria Body={Modal.Body} Footer={Modal.Footer}/>
        </ReduxSuspense>
      </Modal>
      */}
    </div>
  );
};

export default FreeQL;