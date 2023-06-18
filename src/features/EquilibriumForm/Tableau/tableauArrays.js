const specieForEach = (species, components, func) => {
  for (const specie of species) {
    if (!specie.enabled) {
      continue;
    }
    const row = [];
    const componentsPresent = new Map();
    for (const component of specie.dbData.components) {
      componentsPresent.set(component.data, component.amt);
    }
    for (const component of components) {
      row.push(
        componentsPresent.has(component.dbData)
          ? componentsPresent.get(component.dbData)
          : 0
      );
    }
    func(specie, row);
  }
};

const createTableauArrays = (values) => {
  const componentSpecieArray = [];
  const componentSpecieDataArray = [];
  const totals = [];
  const componentToColumnMap = new Map();
  const presentArray = [];
  const presentDataArray = [];
  const possiblyArray = [];
  const possiblyDataArray = [];
  const replacementArray = [];
  const replacementDataArray = [];
  const replacementIndexes = [];
  const replacementConstants = [];
  for (const component of values.components) {
    const row = [];
    for (let j = 0; j < values.components.length; ++j) {
      if (component === values.components[j]) {
        componentToColumnMap.set(component.dbData, j);
        row.push(1);
      } else {
        row.push(0);
      }
    }
    if (component.concentrationType !== "total") {
      totals.push(null);
      replacementArray.push(row);
      replacementDataArray.push(component.dbData);
      replacementIndexes.push(componentToColumnMap.get(component.dbData));
      replacementConstants.push(
        component.concentrationType === "pH"
          ? Math.pow(10, -component.concentration)
          : component.concentration
      );
    } else {
      totals.push(component.concentration);
      componentSpecieArray.push(row);
      componentSpecieDataArray.push(component.dbData);
    }
  }
  specieForEach(values.species.aqs, values.components, (specie, row) => {
    const newDbData = { ...specie.dbData };
    newDbData.logK = specie.logK;
    presentArray.push(row);
    presentDataArray.push(newDbData);
  });
  specieForEach(values.species.solids, values.components, (specie, row) => {
    const newDbData = { ...specie.dbData };
    newDbData.logK = specie.logK;
    if (specie.forcedEquilibrium) {
      presentArray.push(row);
      presentDataArray.push(newDbData);
      replacementArray.push(row);
      replacementDataArray.push(newDbData);
      replacementConstants.push(1);
      if (specie.replacedComponent) {
        replacementIndexes.push(
          componentToColumnMap.get(specie.replacedComponent)
        );
      } else {
        replacementIndexes.push(null);
      }
    } else {
      presentArray.push(row);
      possiblyArray.push(row);
      possiblyDataArray.push(newDbData);
      presentDataArray.push(newDbData);
    }
  });
  specieForEach(values.species.gases, values.components, (specie, row) => {
    const newDbData = { ...specie.dbData };
    newDbData.logK = specie.logK;
    presentArray.push(row);
    presentDataArray.push(newDbData);
    replacementArray.push(row);
    replacementDataArray.push(newDbData);
    replacementConstants.push(specie.partialPressure);
    if (specie.replacedComponent) {
      replacementIndexes.push(
        componentToColumnMap.get(specie.replacedComponent)
      );
    } else {
      replacementIndexes.push(null);
    }
  });
  const ret = {
    componentSpecieArray,
    componentSpecieDataArray,
    totals,
    presentArray,
    presentDataArray,
    possiblyArray,
    possiblyDataArray,
    replacementArray,
    replacementDataArray,
    replacementIndexes,
    replacementConstants,
  };
  console.log(ret);
  return ret;
};

export default createTableauArrays;
