import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getComponentDB, getWaterValue } from '../../components/componentsSelectors.js';
import { getErroredGases, getGasReplacements, setGasPartialPressure, setGasReplacement } from './gasInputSlice.js';
import { getSpeciesDB, getSpeciesPresent } from '../speciesSelectors.js';
import { disableSpecies } from "../speciesSlice.js"
import DataRow from '../../../reusable_components/DataRow.js';
import RadioRow from '../../../reusable_components/RadioRow.js';
import AbbreviatingLabel from '../../../reusable_components/AbbreviatingLabel.js';
import ListHeader from '../../../reusable_components/ListHeader.js';


const GasListItem=React.memo(({gas}) => {
  const speciesDB=useSelector(getSpeciesDB);
  const componentDB=useSelector(getComponentDB);
  const waterValue=useSelector(getWaterValue);

  const gasReplacement=useSelector(state => getGasReplacements(state).get(gas));
  const isErrored=useSelector(state => getErroredGases(state).has(gas));

  const dispatch=useDispatch();

  return (
    <>
      <DataRow 
        id={gas}
        db={speciesDB.gases}
        disableCheck
        checked
        onValueChange={(value) => {
          dispatch(setGasPartialPressure({gas, value}));
        }}
        onRemove={() => {
          dispatch(disableSpecies({gases: [gas]}));
        }}
      />
      <RadioRow 
        onChange={(option) => {
          dispatch(setGasReplacement({gas, component: option}))
        }}
        required
        isErroring={isErrored}
        options={[...speciesDB.gases.get(gas).components.delete(waterValue).keys()]} 
        optionChecked={gasReplacement} 
        db={componentDB.components}
      />
    </>
  )
});


const GasListHeader=React.memo(() => {
  return (
    <ListHeader
      label={
        <AbbreviatingLabel abbr="Comp" breakpoint="sm">Gases</AbbreviatingLabel>
      }
      inputLabel={<label>Partial Pressure</label>}
    />
  )
});

const GasList = React.memo(() => {
  const gasesPresent=useSelector(state => getSpeciesPresent(state).gases);
  if(!gasesPresent.size){
    return <></>;
  }
  return (
    <>
      <GasListHeader />
      {
        gasesPresent.map(
          gas => <GasListItem key={gas} gas={gas} />
        )
      }
    </>
  );
});

export default GasList;