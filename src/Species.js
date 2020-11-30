import React, { useCallback } from 'react';

import CenteringDiv from './utils/CenteringDiv';
import FormattedChemicalCompound from './Components/FormattedChemicalCompound';

import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import update from "immutability-helper"


const SpeciesListItem=React.memo((props) => {
  const {id, type, setSpecieEnabled, name, enabled}=props;
  const extraCheckProps = setSpecieEnabled ? {onChange: (e) => setSpecieEnabled(e, id, type), disabled: false} : {disabled : true, readOnly: true};
  return (
    <ListGroup.Item className="d-flex" style={enabled ? {} : {"color": "#6c757d", "backgroundColor": "#fff"}}>
      <CenteringDiv start="lg">
        <Form.Check style={{"pointerEvents" : "auto"}} checked={enabled} {...extraCheckProps} />
      </CenteringDiv>
      <span className="m-auto d-lg-none"/>
      <FormattedChemicalCompound className="mx-2 mx-lg-0 text-right">{name}</FormattedChemicalCompound>
      <CenteringDiv start="lg"/>
    </ListGroup.Item>
  )
});

const SpeciesListGroup=React.memo((props) => {
  const {componentsPresent, speciesEnabled, setSpeciesEnabled, speciesCouldBePresent, speciesDB, componentsDB}=props;

  const setSpecieEnabled=useCallback((e, id, type) =>{
    if(e.target.checked){
      setSpeciesEnabled(update(speciesEnabled, {[type]: {$set: speciesEnabled[type].add(id)}}));
    } else {
      setSpeciesEnabled(update(speciesEnabled, {[type]: {$set: speciesEnabled[type].delete(id)}}));    }
  }, [setSpeciesEnabled, speciesEnabled]);
  
  return(
    <ListGroup>
      {componentsPresent.delete(componentsDB().waterValue).map((id) => <SpeciesListItem key={id} id={id} enabled={true} name={componentsDB().components.get(id).name}/>)}
      {speciesCouldBePresent().aqs.map((id) => <SpeciesListItem key={id} id={id} type="aqs" enabled={speciesEnabled.aqs.includes(id)} setSpecieEnabled={setSpecieEnabled} name={speciesDB().aqs.species.get(id).name}/>)}
      {speciesCouldBePresent().solids.map((id) => <SpeciesListItem key={id} id={id} type="solids"  enabled={speciesEnabled.solids.includes(id)} setSpecieEnabled={setSpecieEnabled} name={speciesDB().solids.species.get(id).name}/>)}
      {speciesCouldBePresent().gases.map((id) => <SpeciesListItem key={id} id={id} type="gases" enabled={speciesEnabled.gases.includes(id)} setSpecieEnabled={setSpecieEnabled} name={speciesDB().gases.species.get(id).name}/>)}
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

export { SpeciesList }