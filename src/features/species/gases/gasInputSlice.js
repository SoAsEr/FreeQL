import * as Immutable from 'immutable';
import is_number from 'is-number';

import { createSlice, createSelector } from '@reduxjs/toolkit'

const setGasPartialPressureReducer=(state, gas, value) => {
  state.partialPressures=state.partialPressures.set(gas,  is_number(value) ? Number(value) : null);
}

const setGasReplacementReducer=(state, gas, component) => {
  state.gasReplacements=state.gasReplacements.set(gas, component);
}

const deleteGasReducer=(state, gas) => {
  state.gasReplacements=state.gasReplacements.delete(gas);
  state.partialPressures=state.partialPressures.delete(gas);
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
    removeEnabledGas: (state, action) => {
      deleteGasReducer(state, action.payload.gas)
    }
  },
});

export const { setGasPartialPressure, setGasReplacement, removeEnabledGas } = gasInputSlice.actions;

export { getPartialPressures, getComponentToGases, getGasReplacements, getErroredGases }

export default gasInputSlice.reducer;