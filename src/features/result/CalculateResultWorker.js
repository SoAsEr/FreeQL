/* eslint-disable */
import * as Immutable from "immutable";
import {stringify, parse} from "../../utils/serialize-immutable-deep.js";
import * as Comlink from "comlink";
import { fetchComponentDB, fetchSpeciesDB } from "../fetchDBs";
importScripts( process.env.PUBLIC_URL+"/static/js/TableauSolver.js");

const fillSpecieTypeTypedArrays=(speciesPresent, componentToColumn, logKChanges, speciesDB, tableau, logKs) => {
  const numComponents=componentToColumn.size;
  tableau.resize(numComponents*speciesPresent.size, 0);
  logKs.resize(speciesPresent.size, 0);
  speciesPresent.toIndexedSeq().forEach((specie, index) => {
    const specieData=speciesDB.get(specie);
    componentToColumn.forEach((column, component) => {
      tableau.set(index*numComponents+column, specieData.components.get(component) ?? 0);
    });
    logKs.set(index, Math.pow(10, logKChanges.get(specie) ?? specieData.logK));
  });
}

const fillReplacementArrayWithComponents=(componentsAtEquilibrium, componentsConc, componentToColumn, replacementColumns, replacementTableau, replacementConstants) => {
  const numComponents=componentToColumn.size;
  replacementColumns.resize(componentsAtEquilibrium.size, 0);
  replacementTableau.resize(componentsAtEquilibrium.size*numComponents, 0);
  replacementConstants.resize(componentsAtEquilibrium.size, 0);
  componentsAtEquilibrium.toIndexedSeq().forEach((component, index) => {
    replacementColumns.set(index, componentToColumn.get(component));
    replacementTableau.set(index*numComponents+componentToColumn.get(component), 1);
    replacementConstants.set(index, 1/componentsConc.get(component));
  })
}

const fillTotalConcentrations=(componentsConc, componentsAtEquilibrium, totalConcentrations) => {
  const componentToColumn=Immutable.OrderedMap(Immutable.Seq(componentsConc.keys()).toIndexedSeq().map((value, index) => [value, index]));
  totalConcentrations.resize(componentToColumn.size, 0);
  componentToColumn.forEach((index, component) => {
    if(!componentsAtEquilibrium.has(component)) {
      totalConcentrations.set(index, componentsConc.get(component));
    }
  });
  return componentToColumn;
}

const addComponentsToAqs=(componentToColumn, aqueousSpeciesTableau, aqueousSpeciesLogKs) => {
  const originalTableauSize=aqueousSpeciesTableau.size();
  const numComponents=componentToColumn.size;
  
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

let componentDBPromise;
let speciesDBPromise;

const finshedVectorInitialization=
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
  })
const expose={
  changeComponentDB(params){
    componentDBPromise=fetchComponentDB(params);
  },
  changeSpeciesDB(params) {
    speciesDBPromise=fetchSpeciesDB(params);
  },
  calculate(serializedParameters) {
    const parameters=parse(serializedParameters);
    const {componentsConc, componentsAtEquilibrium, speciesPresent, logKChanges}=parameters;
    return Promise.all([finshedVectorInitialization, componentDBPromise, speciesDBPromise]).then(([Module, componentDB, speciesDB]) => {
      totalConcentrations.resize(0,0);
      aqueousSpeciesTableau.resize(0,0);
      aqueousSpeciesLogKs.resize(0,0);
      solidSpeciesTableau.resize(0,0);
      solidSpeciesLogKs.resize(0,0);
      replacementColumns.resize(0,0);
      replacementTableau.resize(0,0);
      replacementConstants.resize(0,0);

      const componentToColumn=fillTotalConcentrations(componentsConc, componentsAtEquilibrium, totalConcentrations);
      //console.log("here0")
      fillSpecieTypeTypedArrays(speciesPresent.aqs, componentToColumn, logKChanges.aqs, speciesDB.aqs, aqueousSpeciesTableau, aqueousSpeciesLogKs);
      //console.log("here1")
      addComponentsToAqs(componentToColumn, aqueousSpeciesTableau, aqueousSpeciesLogKs);
      //console.log("here2")
      fillReplacementArrayWithComponents(componentsAtEquilibrium, componentsConc, componentToColumn, replacementColumns, replacementTableau, replacementConstants);
      //console.log("here3")
      fillSpecieTypeTypedArrays(speciesPresent.solids, componentToColumn, logKChanges.solids, speciesDB.solids, solidSpeciesTableau, solidSpeciesLogKs);
      //console.log("here4")
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
        

      const ret={
        aqs: Immutable.OrderedMap().withMutations((aqsMap) => {
          for(const [i, specie] of speciesPresent.aqs.toIndexedSeq().entries()) {
            aqsMap.set(specie, {
              conc: aqConcResult.get(i),
            });
          }
        }),
        components: Immutable.OrderedMap().withMutations((components) => {
          for(const [i, component] of Immutable.Seq(componentsConc.keys()).toIndexedSeq().entries()) {
            components.set(component, {
              conc: aqConcResult.get(i+speciesPresent.aqs.size),
              totalConc: totConcResult.get(componentToColumn.get(component)),
            });
          }
        }),
        solidsPresent: Immutable.OrderedMap().withMutations((solidSpeciesPresentMap) => {
          const numPresent=solidsPresentResult.size();
          for(let i=0; i<numPresent; i++) {
            const solid=speciesPresent.solids.toIndexedSeq().get(solidsPresentResult.get(i));
            solidSpeciesPresentMap.set(solid, {
              conc: solidConcResult.get(i),
            });
          }
        }),
        solidsNotPresent: Immutable.OrderedMap().withMutations((solidSpeciesNotPresentMap) => {
          const numPresent=solidsNotPresentResult.size();
          for(let i=0; i<numPresent; i++) {
            const solid=speciesPresent.solids.toIndexedSeq().get(solidsNotPresentResult.get(i));
            solidSpeciesNotPresentMap.set(solid, {
              solubilityProduct: solidSolubilityProductResult.get(i)
            });
          }
        }),
      };
      return stringify(ret);
    });
  },
}
Comlink.expose(expose); 