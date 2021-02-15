import React, { useCallback, useState } from "react";
import * as Immutable from "immutable";

const Collapse=({children}) => {
  const childrenArray=React.Children.toArray(children);
  const [expanded, setExpanded]=useState(() => Immutable.Map(childrenArray.map(({key, props: {expanded}}) => [key, !!expanded])));
  return (
    <>
      {
        childrenArray.map(child => React.cloneElement(child, {toggleCollapse: () => {setExpanded((expanded) => expanded.update(child.key, val => !val))}, expanded: expanded.get(child.key)}))
      }
    </>
  )
}

const Accordion=({children}) => {
  const childrenArray=React.Children.toArray(children);
  const [expanded, setExpanded]=useState(() => childrenArray.find(({props: {expanded}}) => expanded).key);
  return (
    <>
      {
        childrenArray.map(child => React.cloneElement(child, {toggleCollapse: () => {setExpanded(child.key)}, expanded: expanded===child.key}))
      }
    </>
  )
}

const Panel=({header, toggleCollapse, expanded, children}) => {
  return (
    <>
      {header({toggleCollapse, expanded})}
      {expanded && children}
    </>
  );
};

export {Collapse, Accordion, Panel};