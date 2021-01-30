import * as Immutable from 'immutable';

import { createAction } from "@reduxjs/toolkit";
import { getComponentToSpecies } from "../species/speciesSelectors";

const removeComponentsWithSpecies=createAction("removeComponentsWithSpecies");

const removeComponents=(components) => {
  return (dispatch, getState) => {
    const componentToSpecies=getComponentToSpecies(getState());
    const species={aqs: Immutable.Set(), solids: Immutable.Set(), gases: Immutable.Set()};
    for(const component of components) {
      species.aqs=species.aqs.union(componentToSpecies.aqs.get(component) ?? []);
      species.solids=species.solids.union(componentToSpecies.solids.get(component) ?? []);
      species.gases=species.gases.union(componentToSpecies.gases.get(component) ?? []);
    }
    dispatch(removeComponentsWithSpecies({components, species}));
  }
}

export {removeComponentsWithSpecies, removeComponents}