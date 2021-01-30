import React from "react";

const FormattedSupSub=React.memo((props) => {
  return(
    <>
      {Array.from(props.children.matchAll(/([^_^]+)(?:\^(.)|_(.))?/g)).map((value) => <React.Fragment key={props.children.substring(0, value.index)}>{value[1]}<sup>{value[2]}</sup><sub>{value[3]}</sub></React.Fragment>)}
    </>
  );
});
export default FormattedSupSub;