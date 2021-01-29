import * as Immutable from 'immutable';
import is_number from 'is-number';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import {fetchComponentDB} from "../fetchDBs.js";
import { removeComponentsWithSpecies } from '../common/actions.js';

const addComponentsReducer=(state, components) => {
  state.present=state.present.union(components);
  state.conc=state.conc.withMutations(conc => {
    for(const component of components){
      conc.set(component,null);
    }
  })
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
  //alk: { value: "unique_3", label: 'Alkalinity^1' },
  //otherAlk: { value: "unique_4", label: 'Other Alkalinity' },
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

const componentsSlice= createSlice({
  name: "components",
  initialState,
  reducers: {
    addComponents: (state, action) => {
      addComponentsReducer(state, action.payload)
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
      .addCase(removeComponentsWithSpecies, (state, action) => {
        removeComponentsReducer(state, action.payload.components)
      })
  }
});

export const { addComponents, componentValueChanged, putComponentsAtEquilibrium, removeComponentsFromEquilibrium, hPlusOptionChanged } = componentsSlice.actions;
export { getNewComponentDB };
export { hPlusOptions };
export default componentsSlice.reducer;
