import React, { useState, useRef, useLayoutEffect } from "react";

import ConstantValidationTextInput from "./ConstantValidationTextInput";

const EditDefault = React.memo(({constantValidation, onSubmitValidation, warnValidation, onResetToDefault, onEdit, defaultValue, changedValue, inputProps, disabled }) => {
  const showDefault = !changedValue;
  const [editing, setEditing] = useState(false);
  const [editBoxVal, setEditBoxVal] = useState("");

  const editBoxRef=useRef();

  useLayoutEffect (() => {
    if(editing){
      editBoxRef.current.focus();
    }
  }, [editing, editBoxRef]);

  const onCancelEdit=(e) => {
    setEditing(false);
    setEditBoxVal("");
  };
  const onSubmitEdit=(e) => {
    e.preventDefault();
    if(onSubmitValidation(editBoxVal)) {
      onEdit(editBoxVal);
    }
    onCancelEdit(e);
  }
  const beginEdit=(e) => {
    setEditing(true);
  }
  const resetToDefault=(e) => {
    onResetToDefault();
  }

  if(editing){
    return (
      <form onSubmit={onSubmitEdit}>
        <ConstantValidationTextInput 
          validation={constantValidation} 
          onChange={(e) => {
            setEditBoxVal(e.target.value);
          }} 
          onBlur={onSubmitEdit}
        >
          <input 
            {...inputProps}
            ref={editBoxRef} 
            onKeyDown={(e) => {
              if(e.key==="Escape"){
                e.preventDefault();
                e.stopPropagation();
                onCancelEdit(e);
              }
            }}/>
        </ConstantValidationTextInput>
      </form>
    )
  } else if(showDefault) {
    return (
      <span className="flex">
        {defaultValue}
        <button onClick={beginEdit} className="mt-0.5" disabled={disabled}>
          <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <title>Edit</title>
            <path fillRule="evenodd" d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.39.242l-3 1a1 1 0 0 1-1.266-1.265l1-3a1 1 0 0 1 .242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"></path>
            <path fillRule="evenodd" d="M12.146 6.354l-2.5-2.5.708-.708 2.5 2.5-.707.708zM3 10v.5a.5.5 0 0 0 .5.5H4v.5a.5.5 0 0 0 .5.5H5v.5a.5.5 0 0 0 .5.5H6v-1.5a.5.5 0 0 0-.5-.5H5v-.5a.5.5 0 0 0-.5-.5H3z"></path>
          </svg>
        </button>
      </span>
    )
  } else {
    return (
      <span className="flex">
        {changedValue}
        {
          !warnValidation(changedValue) &&
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle ml-0.5 mt-0.5 text-yellow-500" viewBox="0 0 16 16">
            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
            <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
          </svg>
        }
        <button onClick={resetToDefault} className="ml-0.5 mt-0.5" disabled={disabled}>
          <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <title>Reset</title>
            <path fillRule="evenodd" d="M12.83 6.706a5 5 0 0 0-7.103-3.16.5.5 0 1 1-.454-.892A6 6 0 1 1 2.545 5.5a.5.5 0 1 1 .91.417 5 5 0 1 0 9.375.789z"></path>
            <path fillRule="evenodd" d="M7.854.146a.5.5 0 0 0-.708 0l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 1 0 .708-.708L5.707 3 7.854.854a.5.5 0 0 0 0-.708z"></path>
          </svg>
        </button>
      </span>
    )
  }
});

export default EditDefault;