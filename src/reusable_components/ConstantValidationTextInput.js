import React, { useState, useRef, useEffect } from 'react';
import { mergeRefs } from '../utils/ref-utils';

const ConstantValidationTextInput=React.memo((props) => {
  const child=React.Children.only(props.children);
  const [value, setValue]=useState("");
  const [selection, setSelection]=useState([0,0]);
  const [validationMisfired, setValidationMisfire]=useState(false);
  const selectRef=useRef(null);
  const onBlur=(e) => {
    props.onBlur(e, setValue);
  }

  const onChange=(e) => {
    if(props.validation(e.target.value)){
      props.onChange(e);
      setValue(e.target.value);
      setSelection([e.target.selectionStart, e.target.selectionEnd]);
    } else {
      setValidationMisfire(true);
    }
  }
  const onSelect=(e) => {
    if(!validationMisfired){
      setSelection([e.target.selectionStart, e.target.selectionEnd]);
    }
  }
  useEffect(() => {
    if(validationMisfired) {
      selectRef.current.selectionStart=selection[0];
      selectRef.current.selectionEnd=selection[1];
      setValidationMisfire(false);
    }
  }, [validationMisfired, selection]);
  return(
    <>
      {React.cloneElement(child, { value: value, onSelect: onSelect, onChange: onChange, onBlur: onBlur, ref: mergeRefs(child.ref, selectRef)})}
    </>
  )
});
ConstantValidationTextInput.defaultProps={
  onChange: () => {},
  onBlur: () => {},
};

export default ConstantValidationTextInput;