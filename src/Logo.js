import preval from "preval.macro";

import React from "react";

const fileData = preval`
  var fs = require('fs');
  var HtmlToReactParser = require('html-to-react').Parser;
  var parser=new HtmlToReactParser(); //this converts props to react props
  const rawHTML=fs.readFileSync("public/assets/img/logo.svg", "utf8");
  const parsed=parser.parse(rawHTML);
  const {children, ...otherProps} = parsed.props; //we use dangerouslySetInnerHTML rather than children
  module.exports={
    type: parsed.type,
    props: otherProps,
    innerHTML: require('node-html-parser').parse(rawHTML).firstChild.innerHTML
  }
`;
const Logo = (props) => {
  return React.createElement(fileData.type, {
    ...fileData.props,
    ...props,
    dangerouslySetInnerHTML: { __html: fileData.innerHTML },
  });
};

export default Logo;
