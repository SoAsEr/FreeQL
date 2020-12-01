import React, { useState, useRef, useReducer, useCallback, unstable_useOpaqueIdentifier , Suspense } from 'react';

import memoize from 'fast-memoize';

import * as Immutable from 'immutable';
import * as transit from "transit-immutable-js";
import update from "immutability-helper"

import useResizeObserver from './utils/useResizeObserver.js';
import useWindowSize from './utils/useWindowSize.js';
import ResizeObserverWrapper from './utils/ResizeObserverWrapper.js';
import { useAsyncResourceWithBoolean } from "./utils/useAsyncResources.js";

import { componentDBDefaultParams, getComponentDB, getSpeciesDB, speciesDBDefaultParams } from './getDBs.js';

import ComponentListHeader from "./component_groups/components/ComponentListHeader.js"

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


import useComlinkWorker from './utils/useComlinkWorker.js';
//eslint-disable-next-line import/no-webpack-loader-syntax
import ConcentrationCalculator from 'worker-loader!./CalculateResultWorker.js'
import useModalStack from './utils/useModalStack.js';

const Results = React.lazy(() => import('./component_groups/Result.js'));

const HPlusComponent = React.lazy(() => import("./component_groups/components/HPlusComponent.js"));
const ComponentList = React.lazy(() => import("./component_groups/components/ComponentList.js"));

const ComponentSelectModal = React.lazy(() => import("./component_groups/components/ComponentSelectModal.js"))
const ComponentSelect = React.lazy(() => import("./component_groups/components/ComponentSelect.js"))

const SpeciesList = React.lazy(() => import('./component_groups/Species.js'));
const TableauTable = React.lazy(() => import('./component_groups/Tableau.js'));

const ScrollContainer=React.memo((props) => {
  return (
    <div style={{"maxHeight" : "calc(100vh - "+(props.headerHeight+props.footerHeight)+"px)", "overflowY" : "auto", "width": "100%"}}>
      <div style={{"overflowX" : "hidden"}}>
        <ResizeObserverWrapper>
          <Container fluid>
            {props.children}
          </Container>
        </ResizeObserverWrapper>
      </div>
    </div>
  )
});

const SpinnerComponentRow=React.memo((props) => {
  return (
    <Row className="mb-3" style={{"height": "38px"}}>
      <Col className="center-items">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Col>
    </Row>
  );
});

const CalculateButton=React.memo((props) => {
  const { calculateNewResult, disableMessage, onClick, ...restProps }=props;
  const disabled=!!disableMessage();
  const button=<Button {...restProps} onClick={(e) => {onClick(e); calculateNewResult();} } disabled={disabled}>Calculate</Button>;
  if(disabled) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            {disableMessage()}
          </Tooltip>
        }
      >
        <div className="disabled-button-wrapper">
          {button}
        </div>
      </OverlayTrigger>
    )
  } else {
    return button;
  }
});

const speciesOccurences=(componentToSpecies, componentsPresent) => Immutable.Map().withMutations((map) => {
  for(const componentId of componentsPresent) {
    if(componentToSpecies.has(componentId)){
      for(const specieId of componentToSpecies.get(componentId)) {
        map.update(specieId, (num=0)=>num+1);
      }
    }
  }
});

const speciesCouldBePresentOfType=(speciesDB, componentsPresent) => Immutable.OrderedSet().withMutations(ourSpeciesCouldBePresent => {
  console.log(speciesDB);
  const ourSpeciesOccurences=speciesOccurences(speciesDB.componentToSpecies, componentsPresent);
  for(const [specie, specieData] of speciesDB.species){
    if(ourSpeciesOccurences.get(specie)===specieData.components.size){
      ourSpeciesCouldBePresent.add(specie);
    } 
  }
})

const defaultRowInputValue=Immutable.Map({equilChecked: false, conc: ""});

const FreeQL=(props) => {
  const hPlusOptionsRef=useRef([
    { value: unstable_useOpaqueIdentifier(), label: 'totalH' },
    { value: unstable_useOpaqueIdentifier(), label: 'pH' },
    { value: unstable_useOpaqueIdentifier(), label: 'Alkalinity^1' },
    { value: unstable_useOpaqueIdentifier(), label: 'Other Alkalinity' },
  ]);
  const ConcentrationCalculatorWorker=useComlinkWorker(ConcentrationCalculator);
  const [totalHOption, pHOption, alkOption, alkOtherOption]=hPlusOptionsRef.current;
  const [hPlusOption, setHPlusOption]=useState(totalHOption);

  const [componentsInputState, componentsInputStateReducer]=useReducer(
    (oldState, action) => {
      switch(action.action){
        case "add":
          return oldState.withMutations((map) => {
            for(const componentToAdd of action.value.components){
              map.set(componentToAdd, defaultRowInputValue);
            }
          });
        case "remove":
          return oldState.removeAll(action.value.components);
        case "toggleEquilChecked":
          return oldState.updateIn([action.value.component, "equilChecked"], (val) => !val);
        case "setConc":
          return oldState.setIn([action.value.component, "conc"], action.value.conc);
        default:
          throw new Error();
      }
    }, 
    Immutable.Map()
  );
  const updateConc=useCallback((component, conc)=> {
    componentsInputStateReducer({action: "setConc", value : {component, conc}});
  }, [componentsInputStateReducer]);
  const toggleChecked=useCallback((component) => {
    componentsInputStateReducer({action: "toggleEquilChecked", value: {component}});
  }, [componentsInputStateReducer]);

  const [componentsPresent, setComponentsPresent]=useState(Immutable.OrderedSet());
  const addComponents=useCallback((components) => {
    componentsInputStateReducer({action: "add", value: {components}});
    setComponentsPresent(componentsPresent.union(components));
  }, [componentsPresent, setComponentsPresent, componentsInputStateReducer]);
  const removeComponents=useCallback((components) => {
    componentsInputStateReducer({action: "remove", value: {components}});
    setComponentsPresent(componentsPresent.subtract(components));
  }, [componentsPresent, setComponentsPresent, componentsInputStateReducer]);

  const [speciesEnabled, setSpeciesEnabled]=useState({
    aqs: Immutable.OrderedSet(),
    solids: Immutable.OrderedSet(),
    gases: Immutable.OrderedSet(),
  });
  const [logKChanges, setLogKChanges]=useState({
    aqs: Immutable.Map(),
    solids: Immutable.Map(),
    gases: Immutable.Map(),
  });

  const [componentsDB, getNewComponentsDB, gettingNewComponentsDB]=useAsyncResourceWithBoolean(getComponentDB, componentDBDefaultParams((db) => {
    console.log(db);
    addComponents([db.waterValue, db.hPlusValue]);
  }));
  const [speciesDB, getNewSpeciesDB, gettingNewSpeciesDB]=useAsyncResourceWithBoolean(getSpeciesDB, speciesDBDefaultParams((db) => {
    console.log(db);
    setSpeciesEnabled(update(speciesEnabled, {aqs : {$set: Immutable.Set(db.aqs.species.keys())}}));
  }));

  const speciesCouldBePresent=useCallback(memoize(() => ({
    aqs: speciesCouldBePresentOfType(speciesDB().aqs, componentsPresent),
    solids: speciesCouldBePresentOfType(speciesDB().solids, componentsPresent),
    gases: speciesCouldBePresentOfType(speciesDB().gases, componentsPresent),
  })), [speciesDB, componentsPresent]);

  const speciesHere=useCallback(memoize(() => {
    return {
      aqs: Immutable.List(speciesCouldBePresent().aqs.intersect(speciesEnabled.aqs)),
      solids: Immutable.List(speciesCouldBePresent().solids.intersect(speciesEnabled.solids)),
      gases: Immutable.List(speciesCouldBePresent().gases.intersect(speciesEnabled.gases)),
    }
  }), [speciesCouldBePresent, speciesEnabled]);

  const [resultMap, setResultMap]=useState(Immutable.Map());
  const [currentResult, calculateNewResult, calculatingNewResult]=useAsyncResourceWithBoolean(() => {
    const input={speciesHere: speciesHere(), componentsPresent: Immutable.List(componentsPresent.delete(componentsDB().waterValue)), logKChanges, componentsInputState};
    const inputImmutable=Immutable.fromJS(input);
    let result;
    if(!resultMap.has(inputImmutable)) {
      result=ConcentrationCalculatorWorker.calculate(transit.toJSON(input)).then(res => transit.fromJSON(res)).catch((error) => error);
      //setResultMap(resultMap.set(inputImmutable, result));
    } else {
      result=resultMap.get(inputImmutable);
    }
    return result; 
  });

  const calculateButtonMessage=useCallback(memoize(() => {
    if(calculatingNewResult){
      return "Calculating..."
    } else if(gettingNewComponentsDB || gettingNewSpeciesDB){
      return "Getting Databases..."
    } else if(componentsInputState.filter((componentData, component) => componentsDB().waterValue!==component && componentsPresent.has(component)).find((componentData, component) => {
      return typeof componentData.get("conc")!=="number";
    })) {
      return "At least one component is empty or invalid";
    } else {
      return false;
    }
  }), [componentsDB, componentsInputState, componentsPresent, gettingNewComponentsDB, gettingNewSpeciesDB, calculatingNewResult]);

  const windowSize=useWindowSize();
  const [buttonsHeight, setButtonsHeight]=useState(0);
  const outerAdderHeight=windowSize.height>=700 ? 54 : 0;
  const buttonsRef=useResizeObserver(useCallback(({ height }) => {setButtonsHeight(height);}, [setButtonsHeight]));
  const [currentModal, openModal, closeModal]=useModalStack();

  const createModalOpenCallback=useCallback(memoize((params) => {
    return () => openModal(params);
  }), [openModal]);
  const createModalCloseCallback=useCallback(memoize((params) => {
    return () => closeModal(params);
  }), [closeModal]);

  const onHPlusOptionChange=useCallback((val) => {
    if(hPlusOption===pHOption){
      toggleChecked(componentsDB().hPlusValue);
      updateConc(componentsDB().hPlusValue, -Math.log10(componentsInputState.get(componentsDB().hPlusValue).get("conc")))
    } else if(val===pHOption) {
      toggleChecked(componentsDB().hPlusValue);
      updateConc(componentsDB().hPlusValue, Math.pow(10, -componentsInputState.get(componentsDB().hPlusValue).get("conc")))
    }
    setHPlusOption(val);
  }, [setHPlusOption, updateConc, hPlusOption, componentsDB, componentsInputState]);

  return(
    <Form>
      <Container style={{"height" : "calc(100vh - "+(props.headerHeight+buttonsHeight+props.footerHeight)+"px)"}}>
        <Row>
          <Col className="p-0">
            <ScrollContainer headerHeight={props.headerHeight} footerHeight={props.footerHeight+buttonsHeight+outerAdderHeight}>
              <ComponentListHeader hPlusOptionsRef={hPlusOptionsRef} defaultVal={hPlusOption} onChange={onHPlusOptionChange}/>
              <Suspense fallback={<SpinnerComponentRow/>}>
                <HPlusComponent pH={pHOption===hPlusOption} componentsDB={componentsDB} componentsInputState={componentsInputState} updateConc={updateConc}/>
              </Suspense>
              <Row>
                <Col xs="3" sm="5" className="center-items">
                  <label className="w-100 d-none d-sm-block text-muted text-center">
                    Components
                  </label>
                  <label className="w-100 d-block d-sm-none text-muted text-center">
                    Comp.
                  </label>
                </Col>
                <Col xs={{span: 7, offset: 0}} sm={{span: 5, offset:0}}>
                  <label className="w-100 text-muted text-center">
                    Total Conc.
                  </label>
                </Col>
              </Row>
              <hr className="mt-0 mb-3"/>
              <Suspense fallback={<SpinnerComponentRow/>}>
                <ComponentList componentsDB={componentsDB} componentsPresent={componentsPresent} toggleChecked={toggleChecked} updateConc={updateConc} removeComponents={removeComponents}/>
              </Suspense>
              <Row>
                <Col>
                  {
                    windowSize.height<700 &&
                    <div className="d-flex center-items w-100">
                      <Suspense fallback="">
                        <ComponentSelectModal componentsPresent={componentsPresent} componentsDB={componentsDB} addComponents={addComponents} windowHeight={windowSize.height}/>
                      </Suspense>
                    </div>
                  }
                </Col>
              </Row>
            </ScrollContainer>
            <Container fluid>
              <Row className="pt-3">
                <Col>
                  {
                    windowSize.height>=700 &&
                    <Suspense fallback="">
                      <ComponentSelect componentsPresent={componentsPresent} componentsDB={componentsDB} addComponents={addComponents}/>
                    </Suspense>
                  }
                </Col>
              </Row>
            </Container>
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
              <Suspense fallback={<SpinnerComponentRow/>}>
                <SpeciesList openTableauModal={createModalOpenCallback("tableau")} speciesDB={speciesDB} componentsDB={componentsDB} componentsPresent={componentsPresent} speciesEnabled={speciesEnabled} speciesCouldBePresent={speciesCouldBePresent} setSpeciesEnabled={setSpeciesEnabled}/>
              </Suspense>
            </ScrollContainer>
          </Col>
        </Row>
      </Container>
      <ResizeObserverWrapper ref={buttonsRef}>
        <Container>
          <Form.Row className="py-3">
            <Col className="d-none d-md-block">
              <CalculateButton onClick={createModalOpenCallback("results")} disableMessage={calculateButtonMessage} className="w-100" variant="primary" calculateNewResult={calculateNewResult}/>
            </Col>
            <Col className="d-block d-md-none">
              <Button className="w-100" variant="primary" onClick={createModalOpenCallback("species")}>Select Species</Button>
            </Col>
          </Form.Row>
        </Container>
      </ResizeObserverWrapper>
      <Modal show={currentModal==="species"} onHide={createModalCloseCallback("species")} backdrop="static" scrollable>
        <Modal.Header closeButton>
          Species
        </Modal.Header>
        <Modal.Body>
          <Suspense fallback={<SpinnerComponentRow/>}>
            <SpeciesList openTableauModal={createModalOpenCallback("tableau")} speciesDB={speciesDB} componentsDB={componentsDB} componentsPresent={componentsPresent} speciesEnabled={speciesEnabled} speciesCouldBePresent={speciesCouldBePresent} setSpeciesEnabled={setSpeciesEnabled}/>
          </Suspense>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={createModalCloseCallback("species")}>
            Close
          </Button>
          <CalculateButton onClick={createModalOpenCallback("results")} disableMessage={calculateButtonMessage} className="ml-auto" variant="primary" calculateNewResult={calculateNewResult}/>
        </Modal.Footer>
      </Modal>
      <Modal size="xl" show={currentModal==="tableau"} onHide={createModalCloseCallback("tableau")} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Tableau</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Suspense fallback={<SpinnerComponentRow/>}>
            <TableauTable logKChanges={logKChanges} setLogKChanges={setLogKChanges} componentsPresent={componentsPresent} componentsInputState={componentsInputState} windowWidth={windowSize.width} speciesHere={speciesHere} speciesEnabled={speciesEnabled} speciesDB={speciesDB} componentsDB={componentsDB}/>
          </Suspense>
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
        <Modal.Body>
          <Suspense fallback={<SpinnerComponentRow/>}>
            <Results currentResult={currentResult}/>
          </Suspense>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={createModalCloseCallback(["results", "species"])}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
};

export default FreeQL;