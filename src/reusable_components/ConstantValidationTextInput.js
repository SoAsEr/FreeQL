import React, { useState, useRef, useEffect } from "react";
import { mergeRefs } from "../utils/ref-utils";

const ConstantValidationTextInput = React.forwardRef(
  ({ validation, onChange, onSelect, ...props }, ref) => {
    const [selection, setSelection] = useState([0, 0]);
    const [validationMisfired, setValidationMisfire] = useState(false);
    const selectRef = useRef(null);

    const onChangeHandler = (e) => {
      if (validation(e.target.value)) {
        onChange(e);
        setSelection([e.target.selectionStart, e.target.selectionEnd]);
      } else {
        setValidationMisfire(true);
      }
    };
    const onSelectHandler = (e) => {
      if (!validationMisfired) {
        onSelect(e);
        setSelection([e.target.selectionStart, e.target.selectionEnd]);
      }
    };
    useEffect(() => {
      if (validationMisfired) {
        selectRef.current.selectionStart = selection[0];
        selectRef.current.selectionEnd = selection[1];
        setValidationMisfire(false);
      }
    }, [validationMisfired, selection]);
    return (
      <input
        onSelect={onSelectHandler}
        onChange={onChangeHandler}
        ref={mergeRefs(ref, selectRef)}
        {...props}
      />
    );
  }
);
ConstantValidationTextInput.defaultProps = {
  onChange: () => {},
  onBlur: () => {},
  onSelect: () => {},
};

export default ConstantValidationTextInput;
