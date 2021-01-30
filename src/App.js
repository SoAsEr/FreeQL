import React, { Suspense } from 'react';

import './App.scss';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import CenteringDiv from './reusable_components/CenteringDiv.js';
import useWindowSize from './utils/useWindowSize.js';

const FreeQL = React.lazy(() => import("./FreeQL.js"));

function App() {
  const windowSize=useWindowSize();
  const headerHeight=56;
  const footerHeight=windowSize.width>=768 ? 120 : 72;
  return (
    <>
      <Navbar expand="sm" bg="dark" variant="dark">
        <CenteringDiv end="sm">
          <Navbar.Brand href="/">
            <img src={process.env.PUBLIC_URL+"/assets/img/logo.svg"} width="65" alt="FreeQL"/>
          </Navbar.Brand>
        </CenteringDiv>
        <Navbar.Brand href="/">FreeQL</Navbar.Brand>
        <CenteringDiv end="sm"/>
        <Navbar.Collapse id="navbarTogglerDemo02">
          <Nav className="mr-auto" style={{"fontSize": "1.025rem"}}>
            <Nav.Link href="https://stephmorel8910.gitbook.io/freeql/" target="_blank">Help</Nav.Link>
            <Nav.Link href="https://github.com/SoAsEr/FreeQL/blob/master/README.md" target="_blank">README</Nav.Link>
            <Nav.Link href="https://github.com/SoAsEr/FreeQL/" target="_blank">Github</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Suspense fallback={<div style={{"height" : "calc(100vh - "+(headerHeight+footerHeight)+"px)"}}/>}>
        <FreeQL headerHeight={headerHeight} footerHeight={footerHeight}/>
      </Suspense>
      <footer className="bg-dark p-4 p-md-5 text-center">
        <Container>
          <Row>
            <Col>
              <span className="text-light">Created by Stephane Morel</span>
            </Col>
          </Row>
        </Container>
      </footer>
    </>

  );
}

export default App;
