import React, { useEffect } from 'react';

import CenteringDiv from '../../utils/CenteringDiv.js';
import FormattedChemicalCompound from '../../reusable_components/formatting/FormattedChemicalCompound.js';

import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useDispatch, useSelector } from 'react-redux';
import { disableSpecies, enableSpecies, getSpeciesCouldBePresent, getSpeciesDB, getIfSpecieEnabled } from './speciesSlice.js';
import { getComponentDB, getComponentsPresent } from '../components/componentsSlice.js';

const CheckListItem=React.memo((props) => {
  const {label, enabled, onEnable}=props;
  const extraCheckProps = onEnable ? {onChange: onEnable, disabled: false} : {disabled : true, readOnly: true};
  return (
    <ListGroup.Item className={"d-flex "+(enabled ? "" : "disabled-look")}>
      <CenteringDiv start="lg">
        <Form.Check checked={enabled} {...extraCheckProps} />
      </CenteringDiv>
      <span className="m-auto d-lg-none"/>
      {label}
      <CenteringDiv start="lg"/>
    </ListGroup.Item>
  )
});

const SpeciesListItem=React.memo(({specie, type}) => {
  const enabled=useSelector(state => getIfSpecieEnabled(state, {specie, type}));
  const speciesDB=useSelector(getSpeciesDB);
  const dispatch=useDispatch();
  useEffect(() => {
    if(type==="aqs") {
      dispatch(enableSpecies({type, species: [specie]}))
    }
    return () => dispatch(disableSpecies({type, species: [specie]}));
  }, [type, specie, dispatch])
  return (
    <CheckListItem
      label={
        <FormattedChemicalCompound className="mx-2 mx-lg-0 text-right">{speciesDB[type].get(specie).name}</FormattedChemicalCompound>
      }
      enabled={enabled}
      onEnable={(e) => {
        if(e.target.checked) {
          dispatch(enableSpecies({type, species: [specie]}))
        } else {
          dispatch(disableSpecies({type, species: [specie]}))
        }
      }} 
    />
  )
});

const ComponentListItem=React.memo(({component}) => {
  const componentDB=useSelector(getComponentDB);
  return (
    <CheckListItem
      label={
        <FormattedChemicalCompound className="mx-2 mx-lg-0 text-right">{componentDB.components.get(component).name}</FormattedChemicalCompound>
      }
      enabled={true}
    />
  )
});

const SpeciesListGroup=React.memo(() => { 
  const componentsPresent=useSelector(getComponentsPresent);
  const speciesCouldBePresent=useSelector(getSpeciesCouldBePresent);
  return(
    <ListGroup>
      {componentsPresent
        .map((component) => 
          <ComponentListItem 
            key={component} 
            id={component} 
            component={component}
          />
        )
      }
      {
        speciesCouldBePresent.aqs
          .map((specie) => 
            <SpeciesListItem 
            key={specie} 
            id={specie} 
            type={"aqs"}
            specie={specie}
          />
        )
      }
      {
        speciesCouldBePresent.solids
          .map((specie) => 
            <SpeciesListItem 
            key={specie} 
            id={specie} 
            type={"solids"}
            specie={specie}
          />
        )
      }
      {
        speciesCouldBePresent.gases
          .map((specie) => 
            <SpeciesListItem 
            key={specie} 
            id={specie} 
            type={"gases"}
            specie={specie}
          />
        )
      }
    </ListGroup>
  )
});

const ViewTableauText=React.memo((props) => {
  const {openTableauModal, disabled} = props;
  return(
    <span onClick={openTableauModal} style={{"fontSize" : "0.875rem"}} className={disabled ? "text-muted" : "border-hover-underline"}>View Tableau
      <svg style={{"marginBottom" : "0.1rem"}} className="bi bi-chevron-double-right" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M3.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L9.293 8 3.646 2.354a.5.5 0 010-.708z" clipRule="evenodd"></path>
        <path fillRule="evenodd" d="M7.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L13.293 8 7.646 2.354a.5.5 0 010-.708z" clipRule="evenodd"></path>
      </svg>
    </span>
  );
});

const SpeciesList=React.memo((props) => {
  const {openTableauModal, ...restProps}=props;
  return(
    <>
      <Row>
        <Col className="center-items">
          <ViewTableauText openTableauModal={openTableauModal}/>
        </Col>
      </Row>
      <Row>
        <Col>
          <SpeciesListGroup {...restProps}/>
        </Col>
      </Row>
    </>
  )
});

export default SpeciesList;