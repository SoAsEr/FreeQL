import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import FormattedChemicalCompound from "./formatting/FormattedChemicalCompound";

const RadioRow=React.memo(({options, chemicalName, isErroring, db, optionChecked, onChange, required}) => {
  return (
    <Row className="mb-2">
      <Col xs="3" sm="5" className="w-100 justify-content-end d-flex flex-wrap">
        {chemicalName && 
          <FormattedChemicalCompound>{chemicalName}</FormattedChemicalCompound>
        }
      </Col>
      <Col className="d-flex justify-content-around">
        {
          options.map(element => 
            <Form.Check
              key={element}
              onChange={() => onChange(element)}
              inline
              checked={optionChecked===element}
              isInvalid={(required && !optionChecked) || (optionChecked===element && isErroring)}
              type="radio"
              label={<FormattedChemicalCompound>{db.get(element).name}</FormattedChemicalCompound>}
            />
          )
        }
      </Col>
    </Row>
  )
})

export default RadioRow;