import is_number from 'is-number';
import { createSelector } from 'reselect';
import { hPlusOptions } from './componentsSlice';

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

export { getComponentsPresent, getComponentsConc, getComponentsAtEquilibrium, getWaterValue, isComponentAtEquilibrium, getComponentDB, getHPlusOption }
