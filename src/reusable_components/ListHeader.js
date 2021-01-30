import React from 'react';



import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


const ListHeader=(props) => {
  const {label, inputLabel, checkLabel}=props;
  return (
    <>
      <Row className="mt-4">
        <Col xs="3" sm="5" className="center-items">
          {label && React.cloneElement(label, {className: "w-100 text-muted text-center"})}
        </Col>
        <Col xs="7" sm="5">
          {inputLabel && React.cloneElement(inputLabel, {className: "w-100 text-muted text-center"})}
        </Col>
        <Col xs="2" className="center-items">
          {checkLabel && React.cloneElement(checkLabel, {className: "w-100 text-muted text-center"})}
        </Col>
      </Row>
      <hr className="mt-0 mb-3"/>
    </>
  )
};

export default ListHeader