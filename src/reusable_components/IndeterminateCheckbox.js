import React from "react";

const IndeterminateCheckbox=({checked, ...props}) => {
  return (
    <input type="checkbox" checked={checked===true} ref={checkbox => {if(checkbox){checkbox.indeterminate=(checked==="indeterminate")}}} {...props}/>
  )
}

export default IndeterminateCheckbox;