import * as Immutable from 'immutable';
import is_number from 'is-number';

import { createSlice, createSelector } from '@reduxjs/toolkit'
import { disableSpecies } from '../speciesSlice';
import { removeComponentsWithSpecies } from '../../common/actions';

const setGasPartialPressureReducer=(state, gas, value) => {
  state.partialPressures=state.partialPressures.set(gas,  is_number(value) ? Number(value) : null);
}

const setGasReplacementReducer=(state, gas, component) => {
  state.gasReplacements=state.gasReplacements.set(gas, component);
}

const deleteGasReducer=(state, gases) => {
  state.gasReplacements=state.gasReplacements.deleteAll(gases);
  state.partialPressures=state.partialPressures.deleteAll(gases);
}

const initialState={
  partialPressures: Immutable.Map(),
  gasReplacements: Immutable.Map(),
}

const getPartialPressures=(state) => state.gasInput.partialPressures;
const getGasReplacements=(state) => state.gasInput.gasReplacements;

const getComponentToGases=createSelector(
  [getGasReplacements],
  (gasReplacements) => gasReplacements.reduce(
    (componentToSpecies, component, specie) => componentToSpecies.update(component, (species=Immutable.Set()) => species.add(specie)), Immutable.Map()
  )
)
const getErroredGases=createSelector(
  [getComponentToGases],
  (componentToGases) => componentToGases.filter(species => species.size>1).reduce(
    (erroredSpecies, species) => erroredSpecies.union(species), Immutable.Set()
  )
);

const gasInputSlice = createSlice({
  name: "gasInput",
  initialState,
  reducers: {
    setGasPartialPressure: (state, action) => {
      setGasPartialPressureReducer(state, action.payload.gas, action.payload.value)
    },
    setGasReplacement: (state, action) => {
      setGasReplacementReducer(state, action.payload.gas, action.payload.component)
    },
  },
  extraReducers: (builder) =>{
    builder
    .addCase(removeComponentsWithSpecies, (state, action) => {
      deleteGasReducer(state, action.payload.species.gases)
    })
    .addCase(disableSpecies, (state, action) => {
      deleteGasReducer(state, action.payload.gases)
    })
  }
});

export const { setGasPartialPressure, setGasReplacement } = gasInputSlice.actions;

export { getPartialPressures, getComponentToGases, getGasReplacements, getErroredGases }

export default gasInputSlice.reducer;