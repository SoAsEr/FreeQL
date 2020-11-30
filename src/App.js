import React, { useState, useCallback } from 'react';
import './App.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CenteringDiv from './utils/CenteringDiv.js';
import useResizeObserver from './utils/useResizeObserver.js';
import ResizeObserverWrapper from './utils/ResizeObserverWrapper.js';
import FreeQL from "./FreeQL";


function App() {
  const [headerHeight, setHeaderHeight]=useState(0);
  const headerRef=useResizeObserver(useCallback(({height}) => {setHeaderHeight(height)}, [setHeaderHeight]));
  const [footerHeight, setFooterHeight]=useState(0);
  const footerRef=useResizeObserver(useCallback(({height}) => {setFooterHeight(height)}, [setFooterHeight]));
  return (
    <>
      <ResizeObserverWrapper ref={headerRef}>
        <Navbar expand="sm" bg="dark" variant="dark">
          <CenteringDiv end="sm">
            <Navbar.Brand href="/">
              <img src="assets/img/logo.png" width="65" alt="FreeQL"/>
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
      </ResizeObserverWrapper>

      <FreeQL headerHeight={headerHeight} footerHeight={footerHeight}>

      </FreeQL>
      <ResizeObserverWrapper ref={footerRef}>
        <footer className="bg-dark p-4 p-md-5 text-center">
          <Container>
            <Row>
              <Col>
                <span className="text-light">Created by Stephane Morel</span>
              </Col>
            </Row>
          </Container>
        </footer>
      </ResizeObserverWrapper>
    </>

  );
}

export default App;
