import React, { useEffect, useCallback } from 'react';

import memoize from 'fast-memoize';

import useWindowSize from './utils/useWindowSize.js';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import useModalStack from './utils/useModalStack.js';
import CalculateButton from './features/result/CalculateButton';
import ReduxSuspense from './utils/ReduxSuspense';
import { getNewComponentDB } from './features/components/componentsSlice';
import { getNewSpeciesDB } from './features/species/speciesSlice';

import { useDispatch } from 'react-redux';

import SpinnerComponentRow from './reusable_components/SpinnerRow';

import {componentDBDefaultParams, speciesDBDefaultParams} from "./features/fetchDBs.js"

import {ComponentListHeader, HPlusHeader} from "./features/components/ComponentHeaders.js";

import PlusCircle from './reusable_components/svgs/plus-circle.js';
import PlusCircleFilled from './reusable_components/svgs/plus-circle-filled.js';


const Results = React.lazy(() => import('./features/result/Results.js'));
const ComponentList = React.lazy(() => import("./features/components/ComponentList.js"));
const GasList = React.lazy(() => import('./features/species/gases/GasList'));

const HPlusRow = React.lazy(() => import('./features/components/HPlusRow.js'));

const ComponentSelectModal = React.lazy(() => import("./features/components/ComponentSelectModal.js"))
const ComponentSelect = React.lazy(() => import("./features/components/ComponentSelect.js"))

const SpeciesList = React.lazy(() => import('./features/species/SpeciesList.js'));
const TableauTable = React.lazy(() => import('./features/species/tableau/Tableau.js'));

const ScrollContainer=React.memo((props) => {
  return (
    <div className="w-100" style={{"maxHeight" : "calc(100vh - "+(props.headerHeight+props.footerHeight)+"px)", "overflowY" : "auto"}}>
      <div style={{"overflowX" : "hidden"}}>
        <Container fluid>
          {props.children}
        </Container>
      </div>
    </div>
  )
});

const FreeQL=(props) => {
  const dispatch=useDispatch();
  useEffect(() => {
    dispatch(getNewComponentDB(componentDBDefaultParams));
    dispatch(getNewSpeciesDB(speciesDBDefaultParams));
  }, [dispatch])

  const windowSize=useWindowSize();

  const outerAdderHeight=windowSize.height>=700 ? 54 : 0;
  const buttonsHeight=70;

  const [currentModal, openModal, closeModal]=useModalStack();

  const createModalOpenCallback=useCallback(memoize((params) => {
    return () => openModal(params);
  }), [openModal]);
  const createModalCloseCallback=useCallback(memoize((params) => {
    return () => closeModal(params);
  }), [closeModal]);

  return(
    <Form>
      <Container style={{"height" : "calc(100vh - "+(props.headerHeight+buttonsHeight+props.footerHeight)+"px)"}}>
        <Row>
          <Col className="p-0">
            <ScrollContainer headerHeight={props.headerHeight} footerHeight={props.footerHeight+buttonsHeight+outerAdderHeight}>
              <HPlusHeader />
              <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
                <HPlusRow />
              </ReduxSuspense>
              <ComponentListHeader />
              <ReduxSuspense fallback="" subscribedItems={["componentDB"]}>
                <ComponentList />
              </ReduxSuspense>
              <ReduxSuspense fallback="" subscribedItems={["componentDB", "speciesDB"]}>
                <GasList />
              </ReduxSuspense>
              {
                windowSize.height<700 &&
                <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
                  <Row>
                    <Col>
                      <div className="d-flex center-items w-100">
                        <div className="hover-switch" style={{"width" : "15%"}} onClick={createModalOpenCallback("addComponents")}>
                          <PlusCircle className="w-100"/>
                          <PlusCircleFilled className="w-100"/>
                        </div>
                        <ComponentSelectModal show={currentModal==="addComponents"} close={createModalCloseCallback("addComponents")} windowHeight={windowSize.height}/>
                      </div>
                    </Col>
                  </Row>
                </ReduxSuspense>
              }
            </ScrollContainer>
            {
              windowSize.height>=700 &&
              <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB"]}>
                <Container fluid>
                  <Row className="pt-3">
                    <Col>
                      <ComponentSelect />
                    </Col>
                  </Row>
                </Container>
              </ReduxSuspense>
            }
          </Col>
          <Col xs="4" className="d-none d-md-flex p-0">
            <ScrollContainer headerHeight={props.headerHeight} footerHeight={props.footerHeight+buttonsHeight}>
              <Row className="mt-4">
                <Col className="center-items">
                  <h5 className="text-muted text-center">
                    Species
                  </h5>
                </Col>
              </Row>
              <ReduxSuspense fallback={<SpinnerComponentRow/>} subscribedItems={["componentDB", "speciesDB"]}>
                <SpeciesList openTableauModal={createModalOpenCallback("tableau")} />
              </ReduxSuspense>
            </ScrollContainer>
          </Col>
        </Row>
      </Container>
      <Container>
        <Form.Row className="py-3">
          <Col className="d-none d-md-block">
            <CalculateButton onClick={createModalOpenCallback("results")} className="w-100" variant="primary"/>
          </Col>
          <Col className="d-block d-md-none">
            <Button className="w-100" variant="primary" onClick={createModalOpenCallback("species")}>Select Species</Button>
          </Col>
        </Form.Row>
      </Container>
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
          <CalculateButton onClick={createModalOpenCallback("results")} className="ml-auto" variant="primary" />
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
      <Modal size="xl" show={currentModal==="results"} onHide={createModalCloseCallback(["results", "species"])} backdrop="static" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Results</Modal.Title>
        </Modal.Header>
        <ReduxSuspense fallback={<><Modal.Body><SpinnerComponentRow/></Modal.Body><Modal.Footer></Modal.Footer></>} subscribedItems={["componentDB", "speciesDB", "calculateResult"]}>
          <Results Body={Modal.Body} Footer={Modal.Footer}/>
        </ReduxSuspense>
      </Modal>
    </Form>
  );
};

export default FreeQL;