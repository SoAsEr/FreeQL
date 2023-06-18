import React, { useContext, useId, useState } from "react";

const SectionContext = React.createContext();

const TableSection = ({ children }) => {
  return (
    <SectionContext.Provider value={useId()}>
      {children}
    </SectionContext.Provider>
  );
};

const sectionRowHelper = ({ sectionContext }, trChildren) => {
  const trChild = React.Children.only(trChildren);
  return React.cloneElement(trChild, {
    children: React.Children.map(trChild.props.children, (child, i) =>
      React.cloneElement(child, {
        headers: undefined,
      })
    ),
  });
};

export { TableSection, sectionRowHelper, SectionContext };
