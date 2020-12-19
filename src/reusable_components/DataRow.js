
import React, { useState } from 'react';

import ConstantValidationTextInput from '../utils/ConstantValidationTextInput.js';

import FormattedChemicalCompound from './formatting/FormattedChemicalCompound.js';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import is_number from 'is-number';


const DataRow=React.memo(({id, onCheck, onValueChange, checked, disabled, disableCheck, noRemove, onRemove, db}) => {
  const [valid, setValid]=useState(false);
  return(
    <Row className={(disabled ? "disabled-look " : " ") + "mb-3 p-0"}>
      <Col xs="3" sm="5" className="w-100 justify-content-end d-flex flex-wrap">
        {!noRemove && <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" className="bi bi-x lighten-hover mr-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg" onClick={onRemove}>
          <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>}
        <FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound>
      </Col>
      <Col xs="7" sm="5" className="d-flex align-items-center">
        <ConstantValidationTextInput 
          validation={(input) => input.match(/^-?\d*\.?\d*e?-?\d*$/)}
          onChange={(e) => {
            setValid(is_number(e.target.value));
            onValueChange(e.target.value);
          }}
        >
          <Form.Control disabled={disabled} className={"text-center "+(valid || disabled ? "" : "is-invalid")}/>
        </ConstantValidationTextInput>
      </Col>
      <Col xs="2" className="d-flex center-items">
        <Form.Check style={{"paddingLeft": "1.7rem"}} type="checkbox" checked={checked} disabled={disableCheck || disabled} onChange={(e) => onCheck(e.target.checked)}/>
      </Col>
    </Row>
  );
});

export default DataRow;