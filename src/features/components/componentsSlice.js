import * as Immutable from 'immutable';
import is_number from 'is-number';

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

import {fetchComponentDB} from "../fetchDBs.js";

const addComponentsReducer=(state, components) => {
  state.present=state.present.union(components);
};

const removeComponentsReducer=(state, components) => {
  state.present=state.present.subtract(components);
  state.conc=state.conc.deleteAll(components);

};
const setComponentConcReducer=(state, component, value) => {
  const numberValue = is_number(value) ? Number(value) : null;
  state.conc=state.conc.set(component, numberValue);
};

const putComponentsAtEquilibriumReducer=(state, component) => {
  state.atEquilibrium=state.atEquilibrium.union(component);
};
const removeComponentsFromEquilibriumReducer=(state, component) => {
  state.atEquilibrium=state.atEquilibrium.subtract(component);
};

const hPlusOptions={
  totalH: { value: "unique_1", label: 'totalH' },
  ph: { value: "unique_2", label: 'pH' },
  alk: { value: "unique_3", label: 'Alkalinity^1' },
  otherAlk: { value: "unique_4", label: 'Other Alkalinity' },
};

const hPlusOptionChangedReducer=(state, val) => {
  state.hPlusOption=val;
};

const getNewComponentDB=createAsyncThunk(
  "getNewComponentDB",
  async (args, thunkAPI) => {
    return fetchComponentDB(args);
  }
);

const initialState = {
  present: Immutable.OrderedSet(),
  conc: Immutable.Map(),
  atEquilibrium: Immutable.Set(),
  componentDB: {
    components: null,
    hPlusValue: null,
    waterValue: null,
  },
  hPlusOption: hPlusOptions.totalH, 
};

const getComponentsPresent = (state) => state.components.present;
const getComponentDB = (state) => state.components.componentDB;
const getHPlusOption = (state) => state.components.hPlusOption;
const getWaterValue = (state) => getComponentDB(state).waterValue;

const getComponentsConc = createSelector(
  [
    (state) => state.components.conc,
    getComponentDB,
    getHPlusOption,
  ],
  (concs, componentDB, hPlusOption) => {
    if(hPlusOption===hPlusOptions.ph){
      return concs.update(componentDB.hPlusValue, ph => is_number(ph) ? Math.pow(10, -ph) : ph);
    } else {
      return concs;
    }
  }
);

const getComponentsAtEquilibrium = createSelector(
  [
    (state) => state.components.atEquilibrium,
    getComponentDB,
    getHPlusOption,
  ],
  (equilComponents, componentDB, hPlusOption) => {
    if(hPlusOption===hPlusOptions.ph) {
      return equilComponents.add(componentDB.hPlusValue);
    } else {
      return equilComponents;
    }
  }
);

const isComponentAtEquilibrium=createSelector(
  [
    getComponentsAtEquilibrium,
    (state, {component}) => component,
  ],
  (componentsAtEquilibrium, component) => componentsAtEquilibrium.has(component)
);



const componentsSlice= createSlice({
  name: "components",
  initialState,
  reducers: {
    addComponents: (state, action) => {
      addComponentsReducer(state, action.payload)
    },
    removeComponents: (state, action) => {
      removeComponentsReducer(state, action.payload)
    },
    componentValueChanged: (state, action) => {
      setComponentConcReducer(state, action.payload.component, action.payload.value)
    },
    putComponentsAtEquilibrium: (state, action) => {
      putComponentsAtEquilibriumReducer(state, action.payload)
    },
    removeComponentsFromEquilibrium: (state, action) => {
      removeComponentsFromEquilibriumReducer(state, action.payload)
    },
    hPlusOptionChanged: (state, action) => {
      hPlusOptionChangedReducer(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNewComponentDB.pending, (state, action) => {
        Object.assign(state, initialState);
      })
      .addCase(getNewComponentDB.fulfilled, (state, action) => {
        const db = action.payload;
        state.componentDB=db;
        addComponentsReducer(state, [db.hPlusValue]);
      })
  }
});

export const { addComponents, removeComponents, componentValueChanged, putComponentsAtEquilibrium, removeComponentsFromEquilibrium, hPlusOptionChanged } = componentsSlice.actions;
export { getComponentsPresent, getComponentsConc, getComponentsAtEquilibrium, getWaterValue, isComponentAtEquilibrium, getComponentDB, getHPlusOption }
export { getNewComponentDB };
export { hPlusOptions };
export default componentsSlice.reducer;
