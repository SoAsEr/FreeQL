import React from 'react';

import DataRow from "../../reusable_components/DataRow.js";

import { useSelector, useDispatch } from "react-redux";
import { getComponentDB, getComponentsPresent, getComponentsAtEquilibrium } from './componentsSelectors.js';
import { componentValueChanged, putComponentsAtEquilibrium, removeComponentsFromEquilibrium } from './componentsSlice.js';
import ListHeader from '../../reusable_components/ListHeader.js';
import AbbreviatingLabel from '../../reusable_components/AbbreviatingLabel.js';
import { getComponentToGases } from '../species/gases/gasInputSlice.js';
import { removeComponents } from '../common/actions.js';


const ComponentRow=React.memo(({component, disableCheck, noRemove}) => {
  const componentDB = useSelector(getComponentDB); 
  const atEquilibrium = useSelector(state => getComponentsAtEquilibrium(state).has(component));
  const replacedByGas = useSelector(state => getComponentToGases(state).has(component));

  const dispatch = useDispatch();

  return(
    <DataRow
      id={component}
      db={componentDB.components}
      disabled={replacedByGas} 
      disableCheck={disableCheck}
      noRemove={noRemove}
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