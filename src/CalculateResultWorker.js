/* eslint-disable */
import * as Immutable from "immutable";
import * as transit from "transit-immutable-js";
import * as Comlink from "comlink";
import { componentDBDefaultParams, getComponentDB, getSpeciesDB, speciesDBDefaultParams } from "./getDBs";
importScripts("/static/js/TableauSolver.js");

const fillSpecieTypeTypedArrays=(speciesPresent, componentToColumn, logKChanges, speciesDB, componentsDB, tableau, logKs) => {
  const numComponents=componentToColumn.size;
  console.log(speciesPresent);
  console.log(tableau);
  tableau.resize(numComponents*speciesPresent.size, 0);
  logKs.resize(speciesPresent.size, 0);
  speciesPresent.forEach((specie, index) => {
    const specieData=speciesDB.species.get(specie);
    specieData.components.delete(componentsDB.waterValue).forEach((numComponent, component) => {
      tableau.set(index*numComponents+componentToColumn.get(component), numComponent);
    });
    logKs.set(index, Math.pow(10, logKChanges.get(specie) ?? specieData.logK));
  });
}

const fillReplacementArrayWithComponents=(componentsAtEquilibrium, componentsInputState, componentToColumn, replacementColumns, replacementTableau, replacementConstants) => {
  const numComponents=componentToColumn.size;
  replacementColumns.resize(componentsAtEquilibrium.size, 0);
  replacementTableau.resize(componentsAtEquilibrium.size*numComponents, 0);
  replacementConstants.resize(componentsAtEquilibrium.size, 0);
  console.log(componentsAtEquilibrium);
  componentsAtEquilibrium.forEach((component, index) => {
    console.log(component);
    replacementColumns.set(index, componentToColumn.get(component));
    replacementTableau.set(index*numComponents+componentToColumn.get(component), 1);
    replacementConstants.set(index, 1/componentsInputState.get(component).get("conc"));
  })
}

const fillTotalConcentrations=(componentsPresent, componentsInputState, totalConcentrations) => {
  const componentToColumn=Immutable.OrderedMap(componentsPresent.map((index, value) => [index, value]));
  totalConcentrations.resize(componentToColumn.size, 0);

  componentToColumn.forEach((index, component) => {
    if(!componentsInputState.get(component).get("equilChecked")) {
      totalConcentrations.set(index, componentsInputState.get(component).get("conc"));
    }
  });
  return componentToColumn;
}

const addComponentsToAqs=(componentToColumn, aqueousSpeciesTableau, aqueousSpeciesLogKs) => {
  const originalTableauSize=aqueousSpeciesTableau.size();
  const numComponents=componentToColumn.size;
  console.log(originalTableauSize);
  
  aqueousSpeciesLogKs.resize(aqueousSpeciesLogKs.size()+numComponents, 1);
  aqueousSpeciesTableau.resize(originalTableauSize+numComponents*numComponents, 0);
  componentToColumn.forEach((column, component) => {
    aqueousSpeciesTableau.set(originalTableauSize+numComponents*column+column, 1);
  });
}

let totalConcentrations;

let aqueousSpeciesTableau;
let aqueousSpeciesLogKs;

let solidSpeciesTableau;
let solidSpeciesLogKs;

let replacementColumns;
let replacementTableau;
let replacementConstants;

let aqConcResult;
let totConcResult;
let solidsPresentResult;
let solidConcResult;
let solidsNotPresentResult;
let solidSolubilityProductResult;

let componentsDB;
let speciesDB;

const finshedVectorInitialization=Promise.all([
  Module().then((Module) => {
    totalConcentrations  =new Module.VectorDouble();
    aqueousSpeciesTableau=new Module.VectorDouble();
    aqueousSpeciesLogKs  =new Module.VectorDouble();
    solidSpeciesTableau  =new Module.VectorDouble();
    solidSpeciesLogKs    =new Module.VectorDouble();
    replacementColumns   =new Module.VectorInt();
    replacementTableau   =new Module.VectorDouble();
    replacementConstants =new Module.VectorDouble();
    
    aqConcResult=new Module.VectorDouble();
    totConcResult=new Module.VectorDouble();
    solidsPresentResult=new Module.VectorInt();
    solidConcResult=new Module.VectorDouble();
    solidsNotPresentResult=new Module.VectorInt();
    solidSolubilityProductResult=new Module.VectorDouble();
    return Module;
  }),
  getComponentDB(componentDBDefaultParams()).then(db => {componentsDB=db}),
  getSpeciesDB(speciesDBDefaultParams()).then(db => {speciesDB=db}),
]);
finshedVectorInitialization.then(() => console.log("doneInits"));
const expose={
  changeComponentsDB(componentDBParams, speciesDBParams){
    return Promise.all([
      getComponentDB(componentDBParams).then(db => {componentsDB=db}),
      getSpeciesDB(speciesDBParams).then(db => {speciesDB=db}),
    ])
  },
  calculate(serializedParameters) {
    const parameters=transit.fromJSON(serializedParameters);
    const {componentsPresent, componentsInputState, speciesHere, logKChanges}=parameters;
    const componentsPresentMathematically=componentsPresent.filter(component => !componentsInputState.get(component).get("equilChecked"));
    const componentsAtEquilibrium=componentsPresent.filter(component => componentsInputState.get(component).get("equilChecked"));
    console.log(parameters);
    return finshedVectorInitialization.then(([Module]) => {
      console.log("in here");
      totalConcentrations.resize(0,0);
      aqueousSpeciesTableau.resize(0,0);
      aqueousSpeciesLogKs.resize(0,0);
      solidSpeciesTableau.resize(0,0);
      solidSpeciesLogKs.resize(0,0);
      replacementColumns.resize(0,0);
      replacementTableau.resize(0,0);
      replacementConstants.resize(0,0);

      const componentToColumn=fillTotalConcentrations(componentsPresent, componentsInputState, totalConcentrations);
      fillSpecieTypeTypedArrays(speciesHere.aqs, componentToColumn, logKChanges.aqs, speciesDB.aqs, componentsDB, aqueousSpeciesTableau, aqueousSpeciesLogKs);
      addComponentsToAqs(componentToColumn, aqueousSpeciesTableau, aqueousSpeciesLogKs);
      fillReplacementArrayWithComponents(componentsAtEquilibrium, componentsInputState, componentToColumn, replacementColumns, replacementTableau, replacementConstants);
      fillSpecieTypeTypedArrays(speciesHere.solids, componentToColumn, logKChanges.solids, speciesDB.solids, componentsDB, solidSpeciesTableau, solidSpeciesLogKs);
      try {
        Module.userInput(
          aqConcResult, totConcResult, solidsPresentResult, solidConcResult, solidsNotPresentResult, solidSolubilityProductResult
          , totalConcentrations 
          , aqueousSpeciesTableau, aqueousSpeciesLogKs
          , solidSpeciesTableau, solidSpeciesLogKs
          , replacementTableau, replacementConstants, replacementColumns
        );
      } catch (errorPtr) {
        const errorCode=Module.getValue(errorPtr, "i8");

        switch(errorCode){
          case Module.POSSIBLE_ERRORS.no_converge.value:
            throw new Error("Failed to converge, please check your numbers. If you're sure of your numbers, please feel free to submit a bug report");
          break;
          default:
            console.log(errorCode);
            console.log("EVERYTHING IS WRONG");
            throw new Error("Internal error, please submit a bug report");
        }
      }
        

      return transit.toJSON({
        aqs: Immutable.OrderedMap().withMutations((aqsMap) => {
          for(const [i, specie] of speciesHere.aqs.entries()) {
            aqsMap.set(specie, {
              ...speciesDB.aqs.species.get(specie),
              conc: aqConcResult.get(i),
            });
          }
        }),
        components: Immutable.OrderedMap().withMutations((components) => {
          for(const [i, component] of componentsPresent.entries()) {
            components.set(component, {
              ...componentsDB.components.get(component),
              conc: aqConcResult.get(i+speciesHere.aqs.size),
              totalConc: totConcResult.get(componentToColumn.get(component)),
            });
          }
        }),
        solidsPresent: new Immutable.OrderedMap().withMutations((solidSpeciesPresentMap) => {
          const numPresent=solidsPresentResult.size();
          for(let i=0; i<numPresent; i++) {
            const solid=speciesHere.solids.get(solidsPresentResult.get(i));
            solidSpeciesPresentMap.set(solid, {
              ...speciesDB.solids.species.get(solid),
              conc: solidConcResult.get(i),
            });
          }
        }),
        solidsNotPresent: new Immutable.OrderedMap().withMutations((solidSpeciesNotPresentMap) => {
          const numPresent=solidsNotPresentResult.size();
          for(let i=0; i<numPresent; i++) {
            const solid=speciesHere.solids.get(solidsNotPresentResult.get(i));
            solidSpeciesNotPresentMap.set(solid, {
              ...speciesDB.solids.species.get(solid),
              solubilityProduct: solidSolubilityProductResult.get(i)
            });
          }
        }),
      });
    });
  },
}
Comlink.expose(expose);