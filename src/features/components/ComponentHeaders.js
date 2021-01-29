import React from 'react';


import ListHeader from '../../reusable_components/ListHeader.js';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import AbbreviatingLabel from '../../reusable_components/AbbreviatingLabel.js';

import Select from 'react-select';

import FormattedSupSub from '../../reusable_components/formatting/FormattedSupSub.js';

import { createFormatOptionLabel } from '../../utils/react-select-utils.js';
import { getHPlusOption, getComponentDB } from './componentsSelectors.js';
import { hPlusOptionChanged, hPlusOptions } from './componentsSlice.js';

import { useDispatch, useSelector } from "react-redux";


const EquilSymbol=React.memo(() => (
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
));

const centerSelectStyles = {
  singleValue: styles => ({ ...styles, width: '100%', textAlign : "center" }),
  option: styles => ({ ...styles, width: '100%', textAlign : "center" }),
};
const HPlusHeader=React.memo(() => {
  const dispatch=useDispatch();
  const selectValue=useSelector(getHPlusOption);
  return (
    <ListHeader
      label={
        <AbbreviatingLabel abbr="Comp" breakpoint="sm">Components</AbbreviatingLabel>
      }
      inputLabel={
        <label className="w-100">
          <Select
            menuPosition="fixed"
            isSearchable={false}
            options={Object.values(hPlusOptions)} 
            formatOptionLabel={createFormatOptionLabel(FormattedSupSub)} 
            styles={centerSelectStyles} 
            value={selectValue}
            onChange={(option) => {
              dispatch(hPlusOptionChanged(option));
            }} 
          />
        </label>
      }
      checkLabel={
        <EquilSymbol/>
      }
    />
  )
});


const ComponentListHeader=React.memo(() => {
  return (
    <ListHeader
      label={
        <AbbreviatingLabel abbr="Comp" breakpoint="sm">Components</AbbreviatingLabel>
      }
      inputLabel={<label>Conc.</label>}
    />
  )
});

export {HPlusHeader, ComponentListHeader};