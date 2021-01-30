import React from "react";
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const SpinnerComponentRow=React.memo(() => {
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

export default SpinnerComponentRow;