import * as Immutable from 'immutable';
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import {stringify, parse} from "../../utils/serialize-immutable-deep.js";

//eslint-disable-next-line import/no-webpack-loader-syntax
import ConcentrationCalculator from 'worker-loader!./CalculateResultWorker.js'
import { getComponentDB, getComponentsAtEquilibrium, getComponentsConc, getNewComponentDB } from '../components/componentsSlice';
import { getLogKChanges, getSpeciesDB, getNewSpeciesDB, getSpeciesPresent } from '../species/speciesSlice';

import * as Comlink from "comlink";
import { createStructuredSelector } from 'reselect';

const getCurrentContext=createStructuredSelector(
  {
    componentsConc: getComponentsConc,
    componentsAtEquilibrium: getComponentsAtEquilibrium,
    speciesPresent: getSpeciesPresent,
    logKChanges: getLogKChanges,
    speciesDB: getSpeciesDB,
    componentDB: getComponentDB,
  }
)

const worker=Comlink.wrap(new ConcentrationCalculator());

const calculateNewResult=createAsyncThunk(
  "calculateNewResult",
  async (context, {getState}) => {
    const {speciesDB, componentDB, ...args}=context;
    const result=getResult(getState(), {context}) ?? parse(await worker.calculate(stringify(args)));
    return {result};
  }
);

const initialState={
  calculations: Immutable.List(),
  results: Immutable.Map(),
}

const getResults=state=> state.results.results;
const getCalculations=state=> state.results.calculations;


const getResult=createSelector(
  [getResults,(_, {context}) => context],
  (results, context) => {
    return results.get(Immutable.fromJS(context));
  }
)

const resultsSlice=createSlice({
  name: "results",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(calculateNewResult.pending, (state, action) => {
        state.calculations=state.calculations.push(action.meta.arg);
      })
      .addCase(calculateNewResult.fulfilled, (state, action) => {
        state.results=state.results.set(Immutable.fromJS(action.meta.arg), action.payload.result);
      })   
      .addCase(calculateNewResult.rejected, (state, action) => {
        console.log(action.error);
        state.results=state.results.set(Immutable.fromJS(action.meta.arg), action.error);
      })
      .addCase(getNewComponentDB.pending, (state, action) => {
        worker.changeComponentDB(action.meta.arg)
      })   
      .addCase(getNewSpeciesDB.pending, (state, action) => {
        worker.changeSpeciesDB(action.meta.arg)
      })   
  }
});

export {calculateNewResult};
export {getResult, getCurrentContext, getCalculations};
export default resultsSlice.reducer;