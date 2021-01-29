import { createSlice } from '@reduxjs/toolkit'
import { getNewComponentDB } from './components/componentsSlice.js';
import { getNewSpeciesDB } from './species/speciesSlice.js';

const pending="pending";
const fulfilled="fulfilled";
const rejected="rejected";

const isAsyncAction=({type})=> {
  return type.endsWith("/pending") ||  type.endsWith("/fulfilled")|| type.endsWith("/rejected");
}

const getNameFromAsyncThunk=(thunk) => thunk.pending.type.substring(0, thunk.pending.type.lastIndexOf("/"));
const actionToName={
  [getNameFromAsyncThunk(getNewComponentDB)] : "componentDB",
  [getNameFromAsyncThunk(getNewSpeciesDB)] : "speciesDB",
}

const loadingSlice=createSlice({
  name: "loading",
  initialState: {
    componentDB: pending,
    speciesDB: pending,
  },
  extraReducers: builder => {
    builder
      .addMatcher(isAsyncAction, (state, {type})=>{
        state[actionToName[type.substring(0, type.lastIndexOf("/"))]]=type.substring(type.lastIndexOf("/")+1);
      })
  }
});
export {pending, fulfilled, rejected};

export default loadingSlice.reducer;