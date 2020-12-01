
import React, { useState } from 'react';

import ConstantValidationTextInput from '../../utils/ConstantValidationTextInput.js';

import FormattedChemicalCompound from '../../formatting/FormattedChemicalCompound.js';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import is_number from 'is-number';


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





export default ComponentRow;