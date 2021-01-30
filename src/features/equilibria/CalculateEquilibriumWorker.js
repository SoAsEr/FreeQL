/* eslint-disable */
import * as Comlink from "comlink";
import * as Immutable from "immutable";
importScripts( process.env.PUBLIC_URL+"/static/js/JS_AQSystemSolver.js");
import { graphql, buildSchema } from 'graphql';


const zip= rows=>rows[0].map((_,c)=>rows.map(row=>row[c]));

class MemoryManagerStack{
  constructor(onComplete){
    console.log("please ensure there there is no leak spelled out below this");
    this.stack=[]
    this.onComplete=onComplete;
  }
  pushRefs(extraArgs) {
    let numRefs=null
    for(const field of extraArgs.fieldNodes){
      if(field.name.value==extraArgs.fieldName){
        numRefs=field.selectionSet.selections.length;
      }
    }
    this.stack.push(numRefs);
  }
  removeRef(){
    this.stack[this.stack.length-1]-=1;
    if(this.stack[this.stack.length-1]===0){
      if(this.stack.length>1){
        this.stack.pop();
        this.removeRef();
      } else {
        this.onComplete();
      }
    }
  }
}

const root = {
  equilibrium: ({components, totalConcentrations, componentsAtEquilibrium, aqueousSpecies, solidsCouldBePresent, solidsAtEquilibrium, gases}, _, extraArgs) => Module().then(Module => {
    let tableauWithTotals={
      tableau: {
        coefficients: [],
        constants: [],
      },
      totals: new Array(components.length).fill(0),
    };

    const componentToTableauColumn=Immutable.Map().withMutations((aqueousSpecieToTableauRow) => {
      for(const [i, componentId] of components.entries()){
        aqueousSpecieToTableauRow.set(componentId, i);
      }
    });
    
    const createComponentRow=(componentId) => {
      const column=componentToTableauColumn.get(componentId);
      let coefficients=new Array(components.length).fill(0);
      coefficients[column]={componentId, coefficient: 1};
      return {coefficients, constant: 1};
    }


    const fillTableauAndCreateRowMap=(tableau, species) => {
      const specieToRow=Immutable.Map().withMutations((specieToRow) => {
        const origTableauLength=tableau.constants.length;
        for(const [i, {id}] of species.entries()){
          specieToRow.set(id, i+origTableauLength);
        }
      });
      for(const {id, row} of species){
        const rowIndex=specieToRow.get(id);
        tableau.coefficients[rowIndex]=new Array(components.length).fill(0);
        tableau.constants[rowIndex]=row.constant;
        for(const {componentId, coefficient} of row.coefficients){
          if(componentToTableauColumn.has(componentId)){
            tableau.coefficients[rowIndex][componentToTableauColumn.get(componentId)]=coefficient;
          }
        }
      }
      return specieToRow;
    }
    
    const componentSpecieToTableauRow=fillTableauAndCreateRowMap(tableauWithTotals.tableau, components.map(id => ({
      id,
      get row() {
        return createComponentRow(id);
      }
    })))


    for(const {componentId, total} of totalConcentrations){
      tableauWithTotals.totals[componentToTableauColumn.get(componentId)]=total;
    }
    const aqueousSpecieToTableauRow=fillTableauAndCreateRowMap(tableauWithTotals.tableau, aqueousSpecies);
    

    let solids={
      tableau: {
        coefficients: [],
        constants: [],
      },
      initialGuess: []
    };
    let solidSpecieToTableauRow=null; 
    if(solidsCouldBePresent){
      solidSpecieToTableauRow=fillTableauAndCreateRowMap(solids.tableau, solidsCouldBePresent);
      for(const {id, initialGuess} of solidsCouldBePresent){
        if(initialGuess){
          solids.initialGuess.push(solidSpecieToTableauRow.get(id));
        }
      }
    }
    let replacements={
      tableau: {
        coefficients: [],
        constants: [],
      },
      columns: [],
    }
    const fillReplacement=(species, factor) => {
      console.log(species);
      const rowMap=fillTableauAndCreateRowMap(replacements.tableau, species);
      for(const {id, componentReplacing, [factor]: factorValue} of species){
        replacements.columns[rowMap.get(id)]=componentToTableauColumn.get(componentReplacing);
        if(factor){
          replacements.tableau.constants[rowMap.get(id)]*=1/factorValue;
        }
      }
    }
    if(gases) {
      fillReplacement(gases, "partialPressure");
    }
    if(solidsAtEquilibrium) {
      fillReplacement(solidsAtEquilibrium);
    }
    console.log(replacements);
    if(componentsAtEquilibrium){
      for(const {componentId, concentration} of componentsAtEquilibrium){
        replacements.tableau.coefficients.push(tableauWithTotals.tableau.coefficients[componentSpecieToTableauRow.get(componentId)]);
        replacements.tableau.constants.push(1/concentration);
        replacements.columns.push(componentToTableauColumn.get(componentId));
      }
    }
    const flattenTableau=(tableau)=> {
      tableau.coefficients=tableau.coefficients.flat();
    }
    flattenTableau(tableauWithTotals.tableau);
    flattenTableau(solids.tableau);
    flattenTableau(replacements.tableau);
    
    
    const equilibrium=Module.calculateEquilibrium(components.length, tableauWithTotals, solids, replacements);
    let memManager=new MemoryManagerStack(() => {console.log("no leak"); equilibrium.delete()});
    memManager.pushRefs(extraArgs)

    return {
      species: (_, __, extraArgs2) => {
        memManager.pushRefs(extraArgs2);
        const tableauConcentrations=Module.getTableauConcentrations(equilibrium);
        return {
          component: () => {
            const ret=Array.from(componentSpecieToTableauRow).map(([specie, row]) => ({componentId: specie, concentration: tableauConcentrations[row]}))
            memManager.removeRef();
            return ret;
          },
          aqueous: () => {
            const ret=Array.from(aqueousSpecieToTableauRow).map(([specie, row]) => ({id: specie, concentration: tableauConcentrations[row]}))
            memManager.removeRef();
            return ret
          },
          solid: (_, __, extraArgs3) => {
            let ret=null;
            if(solidsCouldBePresent){
              memManager.pushRefs(extraArgs3);
              ret={};
              const tableauRowToSolidSpecie=solidSpecieToTableauRow.flip();
              return {
                present: () => {
                  const solidsPresent=Module.getSolidsPresent(equilibrium);
                  let ret=null;
                  if(solidsPresent.rows.length){
                    ret=[]
                    for(const [row, concentration] of zip([solidsPresent.rows, solidsPresent.concentrations])){
                      ret.push({id: tableauRowToSolidSpecie.get(row), concentration});
                    }
                  }
                  memManager.removeRef();
                  return ret;
                },
                notPresent: () => {
                  const solidsNotPresent=Module.getSolidsNotPresent(equilibrium);
                  let ret=null;
                  if(solidsNotPresent.rows.length){
                    ret=[]
                    for(const [row, solubilityProduct] of zip([solidsNotPresent.rows, solidsNotPresent.solubilityProducts])){
                      ret[row]={id: tableauRowToSolidSpecie.get(row), solubilityProduct, __typename: "SolidNotPresent"};
                    }
                  }
                  memManager.removeRef();
                  return ret;
                }
              }
                
              
            }
            return ret;
          },
        }
      },
      totalConcentrations: () => {
        const totals=Module.getTotalConcentrations(equilibrium);
        const ret=Array.from(componentToTableauColumn).map(([component, column]) => ({componentId: component, total: totals[column]}));
        memManager.removeRef();
        return ret;
      },
      extraSolubilityProducts: ({species}) => {
        let ret=null;
        if(species){
          let tableau={
            coefficients: [],
            constants: [],
          };
          const tableauRowToSpecie=fillTableauAndCreateRowMap(tableau, species).flip();
          flattenTableau(tableau);
          ret=Module.getExtraSolubilityProducts(equilibrium, tableau).map((solubilityProduct, row) => ({id: tableauRowToSpecie.get(row), solubilityProduct}));
        }
        memManager.removeRef();
        return ret;
      },
    }
  }),
};
const schema=buildSchema(
`
schema {
  query: Query,
}
type Query {
    equilibrium(components: [ID!]!, totalConcentrations: [TotalConcentrationInput!]!, componentsAtEquilibrium: [ComponentAtEquilibriumInput!], aqueousSpecies: [SpecieInput!]!, solidsCouldBePresent: [SolidCouldBePresentInput!], solidsAtEquilibrium: [SolidAtEquilibriumInput], gases: [GasInput!]): Equilibrium,
}
type Equilibrium {
    species: AllSpecies!
    totalConcentrations: [TotalConcentration!]!,
    extraSolubilityProducts(species: [SpecieInput!]): [SolubilityProduct!],
}
type AllSpecies {
  component: [ComponentSpecie!]!,
  aqueous: [Specie!]!,
  solid: Solids,
}
type Solids{
  present: [SolidPresent!],
  notPresent: [SolidNotPresent!],
}
type Specie {
    id: ID!,
    concentration: Float!,
}
type ComponentSpecie {
    componentId: ID!,
    concentration: Float!,
}
type TotalConcentration {
    componentId: ID!,
    total: Float!,
}
type SolubilityProduct {
    id: ID,
    solubilityProduct: Float!,
}
type SolidPresent {
    id: ID!,
    concentration: Float!,
}
type SolidNotPresent {
    id: ID!,
    solubilityProduct: Float!,
}
input TotalConcentrationInput {
  componentId: ID!,
  total: Float!,
}
input CoefficientInput {
    componentId: ID!,
    coefficient: Float!,
}
input Row {
    coefficients: [CoefficientInput!]!,
    constant: Float!,
}
input SpecieInput {
    id: ID!,
    row: Row!,
}
input SolidCouldBePresentInput {
    id: ID!,
    row: Row!,
    initialGuess: Boolean=false,
}
input SolidAtEquilibriumInput {
    id: ID!,
    componentReplacing: ID!,
    row: Row!,
}
input GasInput {
    id: ID!,
    componentReplacing: ID!,
    partialPressure: Float!,
    row: Row!,
}
input ComponentAtEquilibriumInput {
    componentId: ID!,
    concentration: Float!
}
`
);

const calculate=({query, variables}) => {
  console.log(variables)
  return graphql(schema, query, root, undefined, variables);
};
Comlink.expose(calculate); 

