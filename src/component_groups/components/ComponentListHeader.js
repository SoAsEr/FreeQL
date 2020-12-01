import React from 'react';

import Select from 'react-select';

import FormattedSupSub from '../../formatting/FormattedSupSub.js';

import { createFormatOptionLabel } from '../../utils/react-select-utils.js';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const centerSelectStyles = {
  singleValue: styles => ({ ...styles, width: '100%', textAlign : "center" }),
  option: styles => ({ ...styles, width: '100%', textAlign : "center" }),
};

const ComponentListHeader=React.memo((props) => {
  const {hPlusOptionsRef, defaultVal, onChange}=props;
  return (
    <Row className="mt-4 mb-3">
      <Col xs="3" sm="5" className="center-items">
        <label className="w-100 d-none d-sm-block text-muted text-center">
          Components
        </label>
        <label className="w-100 d-block d-sm-none text-muted text-center">
          Comp.
        </label>
      </Col>
      <Col xs="7" sm="5">
        <Select isSearchable={false} options={hPlusOptionsRef.current} formatOptionLabel={createFormatOptionLabel(FormattedSupSub)} styles={centerSelectStyles} onChange={onChange} value={defaultVal}/>
      </Col>
      <Col xs="2" className="center-items">
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip>
              Equilibrium Concentration
            </Tooltip>
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="0.875rem" version="1.1" id="Layer_1" viewBox="0 0 139 119.177" overflow="visible" enableBackground="new 0 0 139 119.177">
            <line fill="none" stroke="#000000" strokeWidth="7" x1="139" y1="63.308" x2="0" y2="63.308"></line>
            <line fill="none" stroke="#000000" strokeWidth="6" x1="30.646" y1="92.308" x2="2.189" y2="65.308"></line>
            <line fill="none" stroke="#000000" strokeWidth="7" x1="3" y1="30.308" x2="133" y2="30.308"></line>
            <line fill="none" stroke="#000000" strokeWidth="6" x1="99.296" y1="2.308" x2="130.953" y2="28.608"></line>
            <path fill="none" stroke="#FFFFFF" strokeWidth="2" d="M53,118.177c2.333,0,4.667,0,7,0"></path>
          </svg>
        </OverlayTrigger>
      </Col>
    </Row>
  )
});

export default ComponentListHeader;