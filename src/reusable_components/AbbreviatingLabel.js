import React from "react";

const AbbreviatingLabel=(props) => (
  <>
    <label className={"w-100 d-none d-"+props.breakpoint+"-block "+props.className}>
      {props.children}
    </label>
    <label className={"w-100 d-block d-"+props.breakpoint+"-none "+props.className}>
      {props.abbr}
    </label>
  </>
);

export default AbbreviatingLabel;