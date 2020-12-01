import React, { useCallback } from 'react';


import VirtualizedSelect from "react-select-virtualized";

import useComponentSearchFilter from "./hooks/useComponentSearchFilter.js"

import { createFormatOptionLabel } from '../../utils/react-select-utils.js';

import FormattedChemicalCompound from "../../formatting/FormattedChemicalCompound.js";

const ComponentSelect=React.memo((props) => {
  const {componentsPresent, componentsDB, addComponents}=props;
  const availableComponents=Array.from(componentsDB().components
    .filter((componentData, componentId) => !componentsPresent.includes(componentId)))
    .map(([componentId, componentData]) => ({value: componentId, label: componentData.name}));
  const searchFilter=useComponentSearchFilter(componentsDB);

  return(
    <VirtualizedSelect options={Array.from(availableComponents)} filterOption={(option, searchValue) => searchFilter(option.value, searchValue)} formatOptionLabel={createFormatOptionLabel(FormattedChemicalCompound)} onChange={useCallback((e) => {if(e) {addComponents([e.value])}}, [addComponents])} value=""/>
  )
});

export default ComponentSelect;