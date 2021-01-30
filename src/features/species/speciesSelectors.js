import * as Immutable from 'immutable';

import { getComponentsPresent, getWaterValue } from '../components/componentsSelectors.js';
import { createSelector, createStructuredSelector } from 'reselect';
import { createDiffSelector } from '../../utils/createDiffSelector.js';
import memoize from 'fast-memoize';

const indexSort=(db) => (specie) => db.get(specie).index;

const getSpeciesDB=(state) => state.species.speciesDB;

const getComponentToSpeciesOfTypeFactory=memoize((type) => createSelector(
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
))


const getSpeciesOfTypeFactory=memoize((type) => (state) => state.species.speciesDB[type]);

const getSpeciesCouldBePresentOfTypeFactory=memoize((type) => createDiffSelector(
  [getComponentsPresent, getSpeciesOfTypeFactory(type), getComponentToSpeciesOfTypeFactory(type), getWaterValue], //deps
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
));

const getSpeciesPresentOfTypeFactory=memoize((type) => createSelector(
  [
    (state) => state.species.speciesEnabled[type],
    getSpeciesCouldBePresentOfTypeFactory(type),
  ],
  (speciesEnabled, speciesCouldBePresent) => {
    return speciesCouldBePresent.filter(specie => speciesEnabled.map.get(specie) ?? speciesEnabled.default);
  }
));

const speciesFactoryFactory=(typeFactory) => createStructuredSelector({
  aqs: typeFactory("aqs"),
  solids: typeFactory("solids"),
  gases: typeFactory("gases"),
});

const getSpeciesCouldBePresent=speciesFactoryFactory(getSpeciesCouldBePresentOfTypeFactory);
const getComponentToSpecies=speciesFactoryFactory(getComponentToSpeciesOfTypeFactory);
const getSpeciesPresent=speciesFactoryFactory(getSpeciesPresentOfTypeFactory);

const getLogKChanges=(state) => state.species.logKChanges;
const getLogKChange=(state, {type, specie}) => state.species.logKChanges[type].get(specie);

const getIfSpecieEnabled=(state, {type, specie}) => state.species.speciesEnabled[type].map.get(specie) ?? state.species.speciesEnabled[type].default;


export { getSpeciesCouldBePresent, getSpeciesPresent, getSpeciesDB, getLogKChanges, getIfSpecieEnabled, getLogKChange, getComponentToSpecies, indexSort };
