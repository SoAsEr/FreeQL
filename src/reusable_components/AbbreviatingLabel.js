import React from "react";
import classNames from "classnames";
const AbbreviatingLabel=({className, children, abbr, breakpoint}) => (
  <>
    <label className={classNames(className, breakpoint+":block", "hidden")}>
      {children}
    </label>
    <label className={classNames(className, breakpoint+":hidden", "block")}>
      {abbr}
    </label>
  </>
);

export default AbbreviatingLabel;