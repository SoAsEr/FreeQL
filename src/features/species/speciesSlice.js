import * as Immutable from 'immutable';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { fetchSpeciesDB } from '../fetchDBs.js';

import { removeComponentsWithSpecies } from '../common/actions.js';


const enableSpeciesOfTypeReducer=(state, type, species) => {
  if(!species){
    return;
  }
  state.speciesEnabled[type].map=state.speciesEnabled[type].map.withMutations(speciesEnabled => {
    for(const specie of species){
      speciesEnabled.set(specie, true);
    }
  });
}
const disableSpeciesOfTypeReducer=(state, type, species) => {
  if(!species){
    return;
  }
  state.speciesEnabled[type].map=state.speciesEnabled[type].map.withMutations(speciesEnabled => {
    for(const specie of species){
      speciesEnabled.set(specie, false);
    }
  });
}

const addLogKChangeReducer=(state, type, specie, value) => {
  state.logKChanges[type]=state.logKChanges[type].set(specie, value);
}

const removeLogKChangeReducer=(state, type, specie) => {
  state.logKChanges[type]=state.logKChanges[type].delete(specie);
}


const getNewSpeciesDB=createAsyncThunk(
  "getNewSpeciesDB",
  async (args, thunkAPI) => {
    return fetchSpeciesDB(args);
  }
);

const initialState={
  speciesEnabled: {
    aqs: {map: Immutable.Map(), default: true},
    solids: {map: Immutable.Map(), default: false},
    gases: {map: Immutable.Map(), default: false},
  },
  logKChanges: {
    aqs: Immutable.Map(),
    solids: Immutable.Map(),
    gases: Immutable.Map(),
  },
  speciesDB: {
    aqs: null,
    solids: null,
    gases: null,
  }
};


const speciesSlice=createSlice({
  name: "species",
  initialState,
  reducers: {
    enableSpecies: (state, action) => {
      enableSpeciesOfTypeReducer(state, "aqs", action.payload.aqs);
      enableSpeciesOfTypeReducer(state, "solids", action.payload.solids);
      enableSpeciesOfTypeReducer(state, "gases", action.payload.gases);
    },
    disableSpecies: (state, action) => {
      disableSpeciesOfTypeReducer(state, "aqs", action.payload.aqs);
      disableSpeciesOfTypeReducer(state, "solids", action.payload.solids);
      disableSpeciesOfTypeReducer(state, "gases", action.payload.gases);
    },
    addLogKChange: (state, action) => {
      addLogKChangeReducer(state, action.payload.type, action.payload.specie, action.payload.value);
    },
    removeLogKChange: (state, action) => {
      removeLogKChangeReducer(state, action.payload.type, action.payload.specie);
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(getNewSpeciesDB.pending, (state, action) => {
      Object.assign(state, initialState);
    })
    .addCase(getNewSpeciesDB.fulfilled, (state, action) => {
      const db = action.payload;
      state.speciesDB = db;
    })
    .addCase(removeComponentsWithSpecies, (state, action) => {
      state.speciesEnabled.aqs.map=state.speciesEnabled.aqs.map.deleteAll(action.payload.species.aqs);
      state.speciesEnabled.solids.map=state.speciesEnabled.solids.map.deleteAll(action.payload.species.solids);
      state.speciesEnabled.gases.map=state.speciesEnabled.gases.map.deleteAll(action.payload.species.gases);
    })
  },
});


export const { enableSpecies, disableSpecies, addLogKChange, removeLogKChange } = speciesSlice.actions;
export { getNewSpeciesDB };
export default speciesSlice.reducer;