import React, { useEffect, useCallback, useLayoutEffect, useRef } from 'react';

import memoize from 'fast-memoize';

import useWindowSize from './utils/useWindowSize.js';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Collapse from 'react-bootstrap/Collapse';

import useModalStack from './utils/useModalStack.js';
import CalculateButton from './features/equilibria/CalculateButton';
import ReduxSuspense from './features/loading/ReduxSuspense';
import { getNewComponentDB } from './features/components/componentsSlice';
import { getNewSpeciesDB } from './features/species/speciesSlice';

import { useDispatch, useSelector } from 'react-redux';

import SpinnerComponentRow from './reusable_components/SpinnerRow';

import {componentDBDefaultParams, speciesDBDefaultParams} from "./features/fetchDBs.js"

import {ComponentListHeader, HPlusHeader} from "./features/components/ComponentHeaders.js";

import PlusCircle from './reusable_components/svgs/plus-circle.js';
import PlusCircleFilled from './reusable_components/svgs/plus-circle-filled.js';
import { getComponentsPresent } from './features/components/componentsSelectors.js';


const Equilibria = React.lazy(() => import('./features/equilibria/Equilibria.js'));
const ComponentList = React.lazy(() => import("./features/components/ComponentList.js"));
const GasList = React.lazy(() => import('./features/species/gases/GasList'));

const HPlusRow = React.lazy(() => import('./features/components/HPlusRow.js'));

const ComponentSelectModal = React.lazy(() => import("./features/components/ComponentSelectModal.js"))
const ComponentSelect = React.lazy(() => import("./features/components/ComponentSelect.js"))

const SpeciesList = React.lazy(() => import('./features/species/SpeciesList.js'));
const TableauTable = React.lazy(() => import('./features/species/tableau/Tableau.js'));

const usePreviousRef=(value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

const FreeQL=(props) => {
  const dispatch=useDispatch();
  useEffect(() => {
    dispatch(getNewComponentDB(componentDBDefaultParams));
    dispatch(getNewSpeciesDB(speciesDBDefaultParams));
  }, [dispatch])

  const windowSize=useWindowSize();

  const [currentModal, openModal, closeModal]=useModalStack();

  const createModalOpenCallback=useCallback(memoize((params) => {
    return () => openModal(params);
  }), [openModal]);
  const createModalCloseCallback=useCallback(memoize((params) => {
    return () => closeModal(params);
  }), [closeModal]);

  const componentSelect=useRef();
  const numComponents=useSelector((state) => getComponentsPresent(state).size);
  const previousNumComponentsRef=usePreviousRef(numComponents);

  useLayoutEffect(() => { 
    if(componentSelect.current && previousNumComponentsRef.current<numComponents){
      componentSelect.current.scrollIntoView(false);
    }
  }, [componentSelect, numComponents, previousNumComponentsRef]);

  return(
    <>
      <div>
        <div className="overflow-auto">
          <HPlusHeader />
          <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
            <HPlusRow />
          </ReduxSuspense>
          <ComponentListHeader />
          <ReduxSuspense fallback="" subscribedItems={["componentDB"]}>
            <ComponentList />
          </ReduxSuspense>
          {
            windowSize.height<700 &&
            <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
              <div className="flex center-items w-100" ref={componentSelect}>
                <div className="hover-switch" style={{"width" : "15%"}} onClick={createModalOpenCallback("addComponents")}>
                  <PlusCircle className="w-100"/>
                  <PlusCircleFilled className="w-100"/>
                </div>
                <ComponentSelectModal show={currentModal==="addComponents"} close={createModalCloseCallback("addComponents")} windowHeight={windowSize.height}/>
              </div>
            </ReduxSuspense>
          }
          {
            windowSize.height>=700 &&
            <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
              <Row className="pt-2 pb-1">
                <Col>
                  <div ref={componentSelect}>
                    <ComponentSelect/>
                  </div>
                </Col>
              </Row>
            </ReduxSuspense>
          }
          <ReduxSuspense fallback="" subscribedItems={["componentDB", "speciesDB"]}>
            <GasList />
          </ReduxSuspense>
        </div>
        <div className="overflow-auto w-1/3">
          <div className="place-center mt-2">
            <label className="text-gray-500">
              Species
            </label>
          </div>
          <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB", "speciesDB"]}>
            <SpeciesList openTableauModal={createModalOpenCallback("tableau")} />
          </ReduxSuspense>
        </div>
      </div>
      <div className="my-3 w-full flex flex-row">
        <CalculateButton onClick={createModalOpenCallback("equilibria")} className="flex-grow" variant="primary"/>
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
    </>
  );
};

export default FreeQL;