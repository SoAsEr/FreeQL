import React, { useState, useRef, useEffect} from "react";

import Form from "react-bootstrap/Form";
import ConstantValidationTextInput from "../utils/ConstantValidationTextInput";

const EditDefault = React.memo(({constantValidation, onSubmitValidation, onResetToDefault, onEdit, defaultValue, changedValue }) => {
  const showDefault = !changedValue;
  const [editing, setEditing] = useState(false);
  const [editBoxVal, setEditBoxVal] = useState("");

  const editBoxRef=useRef();

  useEffect(() => {
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
      <Form onSubmit={onSubmitEdit}>
        <ConstantValidationTextInput 
          validation={constantValidation} 
          onChange={(e) => {
            setEditBoxVal(e.target.value);
          }} 
          onBlur={onSubmitEdit}
        >
          <Form.Control 
            ref={editBoxRef}
            style={{"width": "80px"}} 
            onKeyDown={(e) => {
              if(e.keyCode===27){
                e.preventDefault();
                e.stopPropagation();
                onCancelEdit(e);
              }
            }}/>
        </ConstantValidationTextInput>
      </Form>
    )
  } else if(showDefault) {
    return (
      <span className="text-nowrap">
        {defaultValue}
        <svg onClick={beginEdit} className="logK-editor" style={{"marginTop": "-0.2rem"}} width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.39.242l-3 1a1 1 0 0 1-1.266-1.265l1-3a1 1 0 0 1 .242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"></path>
          <path fillRule="evenodd" d="M12.146 6.354l-2.5-2.5.708-.708 2.5 2.5-.707.708zM3 10v.5a.5.5 0 0 0 .5.5H4v.5a.5.5 0 0 0 .5.5H5v.5a.5.5 0 0 0 .5.5H6v-1.5a.5.5 0 0 0-.5-.5H5v-.5a.5.5 0 0 0-.5-.5H3z"></path>
        </svg>
      </span>
    )
  } else {
    return (
      <span className="text-nowrap">
        {changedValue}
        <svg onClick={resetToDefault} className="logK-reset" style={{"marginTop" : "-0.12rem"}} width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12.83 6.706a5 5 0 0 0-7.103-3.16.5.5 0 1 1-.454-.892A6 6 0 1 1 2.545 5.5a.5.5 0 1 1 .91.417 5 5 0 1 0 9.375.789z"></path>
          <path fillRule="evenodd" d="M7.854.146a.5.5 0 0 0-.708 0l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 1 0 .708-.708L5.707 3 7.854.854a.5.5 0 0 0 0-.708z"></path>
        </svg>
      </span>
    )
  }
});

export default EditDefault;