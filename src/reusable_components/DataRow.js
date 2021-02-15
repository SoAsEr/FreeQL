
import React, { useState } from 'react';

import ConstantValidationTextInput from './ConstantValidationTextInput.js';

import FormattedChemicalCompound from './formatting/FormattedChemicalCompound.js';

import classNames from "classnames";

import is_number from 'is-number';


const DataRow=React.memo(({id, onValueChange, disabled, noRemove, onRemove, db}) => {
  const [valid, setValid]=useState(false);
  return(
    <div className="mb-3 flex">
      <div className="w-4/12 sm:w-6/12 justify-end items-center flex flex-wrap pr-2">
        {!noRemove && <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" className="bi bi-x mt-0.5 cursor-pointer text-black hover:text-gray-500 mr-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg" onClick={onRemove}>
          <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>}
        <label><FormattedChemicalCompound>{db.get(id).name}</FormattedChemicalCompound></label>
      </div>
      <div className="w-8/12 sm:w-6/12 pl-4">
        <ConstantValidationTextInput 
          validation={(input) => input.match(/^-?\d*\.?\d*e?-?\d*$/)}
          onChange={(e) => {
            setValid(is_number(e.target.value));
            onValueChange(e.target.value);
          }}
        >
          <input disabled={disabled} className={classNames("text-center w-full text-control", {"invalid": !(valid || disabled)})}/>
        </ConstantValidationTextInput>
      </div>
    </div>
  );
});

export default DataRow;