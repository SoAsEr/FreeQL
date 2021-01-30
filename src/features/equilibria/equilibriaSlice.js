import * as Immutable from 'immutable';
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";

//eslint-disable-next-line import/no-webpack-loader-syntax
import ConcentrationCalculator from 'worker-loader!./CalculateEquilibriumWorker.js'
import { getComponentDB, getComponentsAtEquilibrium, getComponentsConc } from '../components/componentsSelectors';
import { getLogKChanges, getSpeciesCouldBePresent, getSpeciesDB, getSpeciesPresent } from '../species/speciesSelectors';

import * as Comlink from "comlink";
import { createStructuredSelector } from 'reselect';
import { pending } from '../loading/loadingSlice';
import update from "immutability-helper";
import { getGasReplacements, getPartialPressures } from '../species/gases/gasInputSlice';


const getCurrentCalculationArguments=createStructuredSelector(
  {
    componentsConc: getComponentsConc,
    componentsAtEquilibrium: getComponentsAtEquilibrium,
    speciesPresent: getSpeciesPresent,
    speciesCouldBePresent: getSpeciesCouldBePresent,
    logKChanges: getLogKChanges,
    speciesDB: getSpeciesDB,
    componentDB: getComponentDB,
    partialPressures: getPartialPressures,
    gasReplacements: getGasReplacements,
  }
)

const calculateEquilibriumQuery=`
query getResults($components: [ID!]!, $totalConcentrations: [TotalConcentrationInput!]!, $componentsAtEquilibrium: [ComponentAtEquilibriumInput!], $aqueousSpecies: [SpecieInput!]!, $solidsCouldBePresent: [SolidCouldBePresentInput!], $solidsAtEquilibrium: [SolidAtEquilibriumInput], $gases: [GasInput!], $extraSolubilityProductsToCheck: [SpecieInput!]){
  equilibrium(components: $components, totalConcentrations: $totalConcentrations, componentsAtEquilibrium: $componentsAtEquilibrium, aqueousSpecies: $aqueousSpecies, solidsCouldBePresent: $solidsCouldBePresent, solidsAtEquilibrium: $solidsAtEquilibrium, gases: $gases){
    species {
      component{
        componentId,
        concentration,
      },
      aqueous{
        id,
        concentration,
      },
      solid{
        present{
          id,
          concentration
        },
        notPresent{
          id,
          solubilityProduct
        }
      }
    },
    totalConcentrations{
      componentId,
      total
    },
    extraSolubilityProducts(species: $extraSolubilityProductsToCheck){
      id,
      solubilityProduct
    }
  }
}
`
const calculateEquilibriumWorker=Comlink.wrap(new ConcentrationCalculator());

const calculateEquilibrium=createAsyncThunk(
  "calculateEquilibrium",
  async (context) => {
    const {componentsConc, componentsAtEquilibrium, speciesPresent, speciesCouldBePresent, logKChanges, speciesDB, partialPressures, gasReplacements, componentDB}=context;
    console.log(context);
    const args={
      query: calculateEquilibriumQuery,
      variables: {
        components: Array.from(componentsConc.keys()),
        totalConcentrations: Array.from(componentsConc.filter((_, component) => !componentsAtEquilibrium.has(component) && !gasReplacements.includes(component))).map(([component, conc]) => ({componentId: component, total: conc})),
        componentsAtEquilibrium: Array.from(componentsAtEquilibrium.keys()).map(component => ({componentId: component, concentration: componentsConc.get(component)})),
        aqueousSpecies: Array.from(speciesPresent.aqs).map(specie => ({id: specie, row: {constant: Math.pow(10, logKChanges.aqs.get(specie) ?? speciesDB.aqs.get(specie).logK), coefficients: Array.from(speciesDB.aqs.get(specie).components).map(([component, amt]) => ({componentId: component, coefficient: amt}))}})),
        solidsCouldBePresent: Array.from(speciesPresent.solids).map(specie => ({id: specie, row: {constant: Math.pow(10, logKChanges.solids.get(specie) ?? speciesDB.solids.get(specie).logK), coefficients: Array.from(speciesDB.solids.get(specie).components).map(([component, amt]) => ({componentId: component, coefficient: amt}))}})),
        gases: Array.from(speciesPresent.gases).map(specie => ({id: specie, partialPressure: partialPressures.get(specie), componentReplacing: gasReplacements.get(specie), row: {constant: Math.pow(10, logKChanges.gases.get(specie) ?? speciesDB.gases.get(specie).logK), coefficients: Array.from(speciesDB.gases.get(specie).components).map(([component, amt]) => ({componentId: component, coefficient: amt}))}})),
        extraSolubilityProductsToCheck: Array.from(speciesCouldBePresent.solids.filter(solid => !speciesPresent.solids.has(solid))).map(specie => ({id: specie, row: {constant: Math.pow(10, logKChanges.solids.get(specie) ?? speciesDB.solids.get(specie).logK), coefficients: Array.from(speciesDB.solids.get(specie).components).map(([component, amt]) => ({componentId: component, coefficient: amt}))}})),
      }
    };
    const ret=await calculateEquilibriumWorker(
      args
    );
    return ret;
  }
);

const initialState={
  equilibria: Immutable.List(),
}

const getEquilibria=state=> state.equilibria.equilibria;

const equilibriaSlice=createSlice({
  name: "equilibria",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(calculateEquilibrium.pending, (state, action) => {
        state.equilibria=state.equilibria.push({context: action.meta.arg, result: pending});
      })
      .addCase(calculateEquilibrium.fulfilled, (state, action) => {
        const index=state.equilibria.findLastIndex(equilibrium => equilibrium.context===action.meta.arg);
        console.log(index);
        let result={};
        if(action.payload.data?.equilibrium){
          result.equilibrium=action.payload.data.equilibrium;
        } else if(action.payload.errors){
          result.errors=action.payload.errors
        }
        state.equilibria=state.equilibria.update(index, equilibrium => update(equilibrium, {result: {$set: result}}));
      })
      .addCase(calculateEquilibrium.rejected, (state, action) => {
        const index=state.equilibria.findLastIndex(equilibrium => equilibrium.context===action.meta.arg);
        console.log(index);
        console.log(action.error);
        state.equilibria=state.equilibria.update(index, equilibrium => update(equilibrium, {result: {$set: { errors: [action.error]}}}))
      })
  }
});

export {calculateEquilibrium};
export {getCurrentCalculationArguments, getEquilibria};
export default equilibriaSlice.reducer;