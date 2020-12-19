import * as Immutable from 'immutable';

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { getComponentsPresent, getWaterValue } from '../components/componentsSlice.js';
import { createStructuredSelector } from 'reselect';
import { createDiffSelector } from '../../utils/createDiffSelector.js';
import { fetchSpeciesDB } from '../fetchDBs.js';

const indexSort=(db) => (specie) => db.get(specie).index;

const enableSpeciesReducer=(state, type, species) => {
  state.speciesEnabled[type]=state.speciesEnabled[type].union(species);
}
const disableSpeciesReducer=(state, type, species) => {
  state.speciesEnabled[type]=state.speciesEnabled[type].subtract(species);
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
    aqs: Immutable.Set(),
    solids: Immutable.Set(),
    gases: Immutable.Set(),
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

const getSpeciesDB=(state) => state.species.speciesDB;

const getComponentsToSpeciesOfTypeFactory= (type) => createSelector(
  [getSpeciesDB],
  (speciesDB) => {
    return Immutable.Map().withMutations(componentToSpecies => {
      for(const [speciesId, {components}] of speciesDB[type]) {
        for(const [component] of components) {
          componentToSpecies.update(component, (oldSet=Immutable.Set()) => oldSet.add(speciesId));
        }
      }
    });
  }
)

const getSpeciesPresent=(state) => state.species.speciesEnabled;

const getSpeciesOfTypeFactory=(type) => (state) => state.species.speciesDB[type];

const getSpeciesCouldBePresentOfTypeFactory=(type) => createDiffSelector(
  [getComponentsPresent, getSpeciesOfTypeFactory(type), getComponentsToSpeciesOfTypeFactory(type), getWaterValue], //deps
  {speciesOccurences: Immutable.Map(), speciesCouldBePresent: Immutable.OrderedSet()}, //initial of reducer
  ({speciesOccurences, speciesCouldBePresent}, componentToAdd, speciesOfType, componentToSpeciesOfType, waterValue) => {  //addReducer
    let newSpeciesOccurences;
    let newSpeciesCouldBePresent;
    newSpeciesOccurences=speciesOccurences.withMutations(speciesOccurences => {
      newSpeciesCouldBePresent=speciesCouldBePresent.withMutations(speciesCouldBePresent => {
        for(const specie of componentToSpeciesOfType.get(componentToAdd) ?? []) {
          speciesOccurences.update(specie, (num=0)=>num+1);
          if(speciesOfType.get(specie).components.delete(waterValue).size===speciesOccurences.get(specie)){
            speciesCouldBePresent.add(specie);
          }
        }
      })
    })
    return {speciesOccurences: newSpeciesOccurences, speciesCouldBePresent: newSpeciesCouldBePresent};
  },
  ({speciesOccurences, speciesCouldBePresent}, componentToRemove, speciesOfType, componentToSpeciesOfType) => {  //removeReducer
    let newSpeciesOccurences;
    let newSpeciesCouldBePresent;
    newSpeciesOccurences=speciesOccurences.withMutations(speciesOccurences => {
      newSpeciesCouldBePresent=speciesCouldBePresent.withMutations(speciesCouldBePresent => {
        for(const specie of componentToSpeciesOfType.get(componentToRemove) ?? []) {
          speciesOccurences.update(specie, (num=0)=>num-1);
          speciesCouldBePresent.remove(specie);
        }
      })
    })
    return {speciesOccurences: newSpeciesOccurences, speciesCouldBePresent: newSpeciesCouldBePresent};
  },
  ({speciesCouldBePresent}, speciesOfType) => speciesCouldBePresent.sortBy(indexSort(speciesOfType)) //final function
);

const speciesFactoryFactory=(typeFactory) => createStructuredSelector({
  aqs: typeFactory("aqs"),
  solids: typeFactory("solids"),
  gases: typeFactory("gases"),
})

const getSpeciesCouldBePresent=speciesFactoryFactory(getSpeciesCouldBePresentOfTypeFactory);


const getLogKChanges=(state) => state.species.logKChanges;
const getLogKChange=(state, {type, specie}) => state.species.logKChanges[type].get(specie);


const getIfSpecieEnabled=(state, {type, specie}) => state.species.speciesEnabled[type].has(specie);


const speciesSlice=createSlice({
  name: "species",
  initialState,
  reducers: {
    enableSpecies: (state, action) => {
      state=enableSpeciesReducer(state, action.payload.type, action.payload.species);
    },
    disableSpecies: (state, action) => {
      state=disableSpeciesReducer(state, action.payload.type, action.payload.species);
    },
    addLogKChange: (state, action) => {
      state=addLogKChangeReducer(state, action.payload.type, action.payload.specie, action.payload.value);
    },
    removeLogKChange: (state, action) => {
      state=removeLogKChangeReducer(state, action.payload.type, action.payload.specie);
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
  },
});

export const { enableSpecies, disableSpecies, addLogKChange, removeLogKChange } = speciesSlice.actions;
export { getSpeciesCouldBePresent, getSpeciesPresent, getSpeciesDB, getLogKChanges, getIfSpecieEnabled, getLogKChange };
export { getNewSpeciesDB };
export default speciesSlice.reducer;