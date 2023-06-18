const componentDefault = (componentData) => ({
  id: componentData.id,
  hPlus: componentData.hPlus,
  concentration: "",
  concentrationType: "total",
  dbData: componentData,
});
const aqSpecieDefault = (specieData) => ({
  enabled: true,
  logK: specieData.logK,
  logKChanged: false,
  knownEquilibriumConcentration: false,
  equilibriumConcentration: "",
  replacedComponent:
    specieData.components.length === 1 ? specieData.components[0].data : null,
  dbData: specieData,
});
const solidSpecieDefault = (specieData) => ({
  enabled: false,
  logK: specieData.logK,
  logKChanged: false,
  forcedEquilibrium: false,
  probablyPresent: false,
  replacedComponent:
    specieData.components.length === 1 ? specieData.components[0].data : null,
  dbData: specieData,
});
const gasSpecieDefault = (specieData) => ({
  enabled: false,
  logK: specieData.logK,
  logKChanged: false,
  partialPressure: "",
  replacedComponent:
    specieData.components.length === 1 ? specieData.components[0].data : null,
  dbData: specieData,
});

const specieDefault = {
  aqs: aqSpecieDefault,
  solids: solidSpecieDefault,
  gases: gasSpecieDefault,
};

export {
  specieDefault,
  solidSpecieDefault,
  gasSpecieDefault,
  aqSpecieDefault,
  componentDefault,
};
