import React from 'react';

const CenteringDiv=(props) => {
  return (
    <div className={"flex-"+(props.start ? props.start+"-" : "")+"grow-1 "+(props.end ? "flex-"+props.end+"-grow-0" : "")}>
      {props.children}
    </div>
  );
}
export default CenteringDiv;