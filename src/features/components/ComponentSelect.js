import React, { useCallback,  useMemo } from 'react';


import VirtualizedSelect from "react-select-virtualized";

import useComponentSearchFilter from "./useComponentSearchFilter.js"

import { createFormatOptionLabel } from '../../utils/react-select-utils.js';

import FormattedChemicalCompound from "../../reusable_components/formatting/FormattedChemicalCompound.js";

import { useDispatch, useSelector } from "react-redux";
import { getComponentDB, getComponentsPresent } from './componentsSelectors.js';
import { addComponents } from './componentsSlice.js';


const ComponentSelect=React.forwardRef((props, ref) => {  
  const dispatch=useDispatch();
  const componentsPresent=useSelector(getComponentsPresent);
  const componentDB=useSelector(getComponentDB);
  const availableComponents=useMemo(() => Array.from(componentDB.components
    .delete(componentDB.waterValue)
    .deleteAll(componentsPresent))
    .map(([componentId, componentData]) => ({value: componentId, label: componentData.name}))
  , [componentDB, componentsPresent]);
  const searchFilter=useComponentSearchFilter(componentDB);

  return(
    <VirtualizedSelect
      ref={ref}
      menuPosition="fixed"
      options={availableComponents}
      filterOption={(option, searchValue) => searchFilter(option.value, searchValue)}
      formatOptionLabel={createFormatOptionLabel(FormattedChemicalCompound)}
      onChange={useCallback((e) => {if(e) {dispatch(addComponents([e.value]))}}, [dispatch])} value=""
    />
  )
});

export default ComponentSelect;