import classNames from "classnames";
import React, { useCallback, useState } from "react";

const HoverColContext = React.createContext();
const HoverCellContext = React.createContext();

const HoverSection = ({ excludeColumns, children }) => {
  const [hoveredColumn, setCol] = useState(null);
  return (
    <HoverColContext.Provider value={hoveredColumn}>
      <HoverCellContext.Provider
        value={useCallback(
          (col) =>
            excludeColumns.indexOf(col) === -1 ? setCol(col) : setCol(null),
          [setCol, excludeColumns]
        )}
      >
        {children}
      </HoverCellContext.Provider>
    </HoverColContext.Provider>
  );
};

const hoverRowHelper = ({ rowHover, colHover, cellContext }, trChildren) => {
  const trChild = React.Children.only(trChildren);
  return React.cloneElement(trChild, {
    className: classNames(trChild.props.className, {
      "[&>:first-child]:border-l-2 [&>:first-child]:border-l-transparent [&:hover>:first-child]:border-l-blue-400 [&:hover>:first-child]:text-blue-600 ":
        rowHover,
    }),
    children: React.Children.map(trChild.props.children, (child, i) =>
      React.cloneElement(child, {
        onMouseOver: () => colHover && cellContext(i),
        onMouseOut: () => colHover && cellContext(null),
      })
    ),
  });
};

const hoverHeaderRowHelper = ({ colContext, cellContext }, trChildren) => {
  const trChild = React.Children.only(trChildren);
  return React.cloneElement(trChild, {
    children: React.Children.map(
      trChild.props.children,
      (child, i) =>
        child &&
        React.cloneElement(child, {
          onMouseOver: () => cellContext(i),
          onMouseOut: () => cellContext(null),
          className: classNames(
            child.props.className,
            "first:border-l-2 first:border-l-transparent",
            {
              "children:border-t-2": i !== 0,
              "children:border-t-blue-400 text-blue-600": colContext === i,
              "children:border-t-transparent": colContext !== i,
            }
          ),
          children: <div>{child.props.children}</div>,
        })
    ),
  });
};

export {
  HoverSection,
  hoverHeaderRowHelper,
  hoverRowHelper,
  HoverColContext,
  HoverCellContext,
};
