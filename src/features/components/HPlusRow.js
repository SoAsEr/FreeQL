import React from 'react';

import { ComponentRow } from './ComponentList.js';
import { getComponentDB } from './componentsSelectors.js';

import { useSelector } from "react-redux";

const HPlusRow=React.memo(() => {
  const { hPlusValue } = useSelector(getComponentDB);
  return <ComponentRow component={hPlusValue} disableCheck/>
  
});

export default HPlusRow;