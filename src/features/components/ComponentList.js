import React, { useEffect } from 'react';

import DataRow from "../../reusable_components/DataRow.js";

import { useSelector, useDispatch } from "react-redux";
import { componentValueChanged, getComponentDB, getComponentsPresent, getComponentsAtEquilibrium, putComponentsAtEquilibrium, removeComponentsFromEquilibrium, removeComponents } from './componentsSlice.js';
import ListHeader from '../../reusable_components/ListHeader.js';
import AbbreviatingLabel from '../../reusable_components/AbbreviatingLabel.js';
import { getComponentToGases } from '../species/gases/gasInputSlice.js';


const ComponentRow=React.memo(({component, disableCheck}) => {
  const componentDB = useSelector(getComponentDB); 
  const atEquilibrium = useSelector(state => getComponentsAtEquilibrium(state).has(component));
  const replacedByGas = useSelector(state => getComponentToGases(state).has(component));

  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(componentValueChanged({component, value: ""}));
  }, [component, dispatch]);

  return(
    <DataRow
      id={component}
      db={componentDB.components}
      disabled={replacedByGas} 
      disableCheck={disableCheck}
      checked={atEquilibrium || replacedByGas}
      onCheck={(checked) => {
        if(checked){
          dispatch(putComponentsAtEquilibrium([component]));
        } else {
          dispatch(removeComponentsFromEquilibrium([component]));
        }
      }}
      onValueChange={(value) => {
        dispatch(componentValueChanged({component, value}));
      }}
      onRemove={() => {
        dispatch(removeComponents([component]));
      }}
    />
  )
});

const ComponentList=React.memo(() => {
  const componentsPresent = useSelector(getComponentsPresent);
  const componentDB = useSelector(getComponentDB); 
  return (
    <>
      {
        componentsPresent.delete(componentDB.hPlusValue).map(
          component => 
          <ComponentRow 
            key={component}
            component={component} 
          />
        )
      }
    </>
  )
});
export {ComponentRow};

export default ComponentList;