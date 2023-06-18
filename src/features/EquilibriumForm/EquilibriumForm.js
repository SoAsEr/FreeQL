import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Formik, FormikProvider } from "formik";
import ComponentList from "../InputLists/ComponentList/ComponentList";
import {
  AqList,
  GasList,
  SolidList,
} from "../InputLists/SpecieLists/SpecieLists";
import CalculateButton from "../equilibria/CalculateButton";
import Toolbar from "./Toolbar";
import { componentDefault, specieDefault } from "./elementDefaults";
import validate from "./validate";
import Spinner from "../../reusable_components/Spinner/Animated";
import { Tableau } from "./Tableau/Tableau";
import fetchCSV from "../../utils/fetchCSV";

const defaultQueryOptions = {
  alkalinity: {
    species: [
      "330", //H+
      "3301403", //CO2
      "3305801", //H2PO4-
      "3307302", //H2S
      "90", //H3BO3
      "490", //NH4+
    ],
  },
  component: {
    url: process.env.PUBLIC_URL + "/assets/defaultdb/comp.vdb",
    linesPerItem: 1,
    id: { row: 0, column: 0 },
    name: { row: 0, column: 1 },
    charge: { row: 0, column: 2 },
    hPlusValue: "330",
    waterValue: "2",
  },
  species: {
    url: process.env.PUBLIC_URL + "/assets/defaultdb/thermo.vdb",
    linesPerItem: 3,
    id: { row: 0, column: 0 },
    name: { row: 0, column: 1 },
    charge: { row: 0, column: 6 },
    logK: { row: 0, column: 3 },
    numComponents: { row: 0, column: 10 },
    components: { row: 1, column: 1, stride: 2 },
    componentAmts: { row: 1, column: 0, stride: 2 },
    waterValue: "2",
    labels: [
      {
        type: "solids",
        url: process.env.PUBLIC_URL + "/assets/defaultdb/type6.vdb",
        linesPerItem: 3,
        id: { row: 0, column: 0 },
      },
      {
        type: "gases",
        url: process.env.PUBLIC_URL + "/assets/defaultdb/gases.vdb",
        linesPerItem: 3,
        id: { row: 0, column: 0 },
      },
    ],
  },
};

const defaultFormState = {
  components: [],
  species: {
    aqs: [],
    solids: [],
    gases: [],
  },
  alkalinity: [],
  ionicStrength: { value: "", fixed: false },
};

const EquilbiriumLoadingContext = React.createContext();
const EquilibriumComponentsContext = React.createContext();
const EquilibriumAlkalinityContext = React.createContext();

const useComponentContext = () => {
  return useContext(EquilibriumComponentsContext);
};

const useLoadingContext = () => {
  return useContext(EquilbiriumLoadingContext);
};

const useAlkalinityContext = () => {
  return useContext(EquilibriumAlkalinityContext);
};

const getData = (item, options, property) => {
  return item[options[property].row][options[property].column];
};
const getDataWithStride = (item, options, property, i) => {
  return item[options[property].row][
    options[property].column + i * options[property].stride
  ];
};

const chunk = (arr, count) => {
  let ret = [];
  for (let i = 0; i <= arr.length - count; i += count) {
    ret.push(arr.slice(i, i + count));
  }
  return ret;
};

const changeComponents = (oldState, componentsToAdd, componentsToRemove) => {
  if (oldState.components.size === 0) {
    return oldState;
  }
  const { waterValue, hPlusValue } = oldState;
  componentsToAdd.forEach((component) => {
    if (!oldState.components.has(component)) {
      oldState.componentToSpecies.get(component)?.forEach((specieId) => {
        if (oldState.occurences.has(specieId)) {
          oldState.occurences.set(
            specieId,
            oldState.occurences.get(specieId) + 1
          );
        } else {
          oldState.occurences.set(specieId, 1);
        }
        if (oldState.speciesData.has(specieId)) {
          const specie = oldState.speciesData.get(specieId);
          let componentCount = specie.components.size;
          if (specie.components.has(waterValue)) {
            componentCount -= 1;
          }
          if (specie.components.has(hPlusValue)) {
            componentCount -= 1;
          }
          if (oldState.occurences.get(specieId) === componentCount) {
            oldState.speciesPresent.add(specieId);
          }
        }
      });
      oldState.components.add(component);
    }
  });
  componentsToRemove.forEach((component) => {
    if (oldState.components.has(component)) {
      oldState.componentToSpecies.get(component)?.forEach((specieId) => {
        if (oldState.occurences.get(specieId) > 1) {
          oldState.occurences.set(
            specieId,
            oldState.occurences.get(specieId) - 1
          );
        } else {
          oldState.occurences.delete(specieId);
        }
        oldState.speciesPresent.delete(specieId);
      });
      oldState.components.delete(component);
    }
  });
};

const checkForEmptySpecies = (oldState) => {
  const { hPlusValue, waterValue, componentToSpecies, speciesData } = oldState;
  if (!hPlusValue) {
    return;
  }
  const hPlusList = componentToSpecies.get(hPlusValue);
  const waterList = componentToSpecies.get(waterValue);
  hPlusList?.forEach((specieId) => {
    const specie = speciesData.get(specieId);
    if (
      specie?.components.size === 1 ||
      (specie?.components.size === 2 && waterList.has(specieId))
    ) {
      oldState.speciesPresent.add(specieId);
    }
  });
  waterList?.forEach((specieId) => {
    if (speciesData.get(specieId)?.components.size === 1) {
      oldState.speciesPresent.add(specieId);
    }
  });
};

const occurenceReducer = (oldState, { action, ...otherProps }) => {
  if (action === "changeComponents") {
    if (oldState.components.size === 0) {
      return oldState;
    }
    const { componentsToAdd, componentsToRemove } = otherProps;
    changeComponents(oldState, componentsToAdd, componentsToRemove);
    return {
      ...oldState,
      components: new Set(oldState.components),
      occurences: new Map(oldState.occurences),
      speciesPresent: new Set(oldState.speciesPresent),
    };
  } else if (action === "componentDataUpdate") {
    const { hPlusValue, waterValue, componentsData } = otherProps;
    if (hPlusValue !== oldState.hPlusValue) {
      oldState.components.delete(oldState.hPlusValue);
      oldState.components.delete(hPlusValue);
      oldState.occurences = new Map();
      oldState.speciesPresent = new Set();
      changeComponents(oldState, oldState.components, []);
      checkForEmptySpecies(oldState);
      oldState.components = new Set([
        hPlusValue,
        ...oldState.components.values(),
      ]);
    }
    oldState.hPlusValue = hPlusValue;
    oldState.waterValue = waterValue;
    oldState.componentsData = new Map(componentsData);
    return {
      ...oldState,
    };
  } else if (action === "speciesDataUpdate") {
    const { componentToSpecies, speciesData } = otherProps;
    oldState.componentToSpecies = new Map(componentToSpecies);
    oldState.speciesData = new Map(speciesData);

    oldState.occurences = new Map();
    oldState.speciesPresent = new Set();
    const oldComponents = new Set(oldState.components);
    oldState.components = new Set(oldComponents);
    oldComponents.delete(oldState.hPlusValue);
    changeComponents(oldState, oldComponents, []);
    checkForEmptySpecies(oldState);
    return {
      ...oldState,
    };
  } else if (action === "reset") {
    return {
      components: new Set(),
      occurences: new Map(),
      waterValue: null,
      hPlusValue: null,
      speciesData: new Map(),
      componentsData: new Map(),
      componentToSpecies: new Map(),
      speciesPresent: new Set(),
    };
  }
};

const formDataMerger = (createDefault, values, species) => {
  console.log(species);
  let change = false;
  let minLength = species.length;
  if (species.length !== values.length) {
    change = true;
    minLength = Math.min(species.length, values.length);
  }
  const newSpeciesFormValue = [];
  let speciesIndex = 0;
  let valueSpeciesIndex = 0;
  while (
    speciesIndex !== species.length &&
    valueSpeciesIndex !== values.length
  ) {
    if (species[speciesIndex].index < values[valueSpeciesIndex].dbData.index) {
      change = true;
      newSpeciesFormValue.push(createDefault(species[speciesIndex]));
      ++speciesIndex;
    } else if (
      species[speciesIndex].index > values[valueSpeciesIndex].dbData.index
    ) {
      change = true;
      ++valueSpeciesIndex;
    } else {
      newSpeciesFormValue.push(values[valueSpeciesIndex]);
      ++valueSpeciesIndex;
      ++speciesIndex;
    }
  }
  if (speciesIndex < species.length) {
    newSpeciesFormValue.push(
      ...species.slice(speciesIndex).map((specie) => createDefault(specie))
    );
  }
  if (change) {
    return newSpeciesFormValue;
  } else {
    return values;
  }
};

const useDBData = ({
  values,
  setValues,
  setFieldValue,
  dbOptions,
  resetForm,
}) => {
  const [componentsLoading, setComponentsLoading] = useState(true);
  const [speciesLoading, setSpeciesLoading] = useState(true);
  const [componentAndSpecieState, dispatchOccurenceChange] = useReducer(
    occurenceReducer,
    {
      components: new Set(),
      occurences: new Map(),
      waterValue: null,
      hPlusValue: null,
      speciesData: new Map(),
      componentsData: new Map(),
      componentToSpecies: new Map(),
      speciesPresent: new Set(),
    }
  );
  const [options, setOptions] = useState(defaultQueryOptions);

  useEffect(() => {
    fetchCSV(options.component.url, (componentLines) => {
      componentLines = chunk(componentLines, options.component.linesPerItem);
      const componentsData = new Map();
      for (let i = 0; i < componentLines.length; ++i) {
        let id = getData(componentLines[i], options.component, "id");
        if (id !== "0" && id !== "") {
          componentsData.set(id, {
            id,
            name: getData(componentLines[i], options.component, "name"),
            charge: Number.parseFloat(
              getData(componentLines[i], options.component, "charge")
            ),
            type: "component",
            index: i,
            hPlus: id === options.component.hPlusValue,
          });
        }
      }
      setComponentsLoading(false);
      dispatchOccurenceChange({
        action: "componentDataUpdate",
        hPlusValue: options.component.hPlusValue,
        waterValue: options.component.waterValue,
        componentsData,
      });
      const labelPromises = options.species.labels.map(
        (labelinfo) =>
          new Promise((resolve) => {
            fetchCSV(labelinfo.url, (labelLines) => {
              let labelSet = new Set();
              labelLines = chunk(labelLines, labelinfo.linesPerItem);
              for (let i = 0; i < labelLines.length; ++i) {
                labelSet.add(getData(labelLines[i], labelinfo, "id"));
              }
              resolve(labelSet);
            });
          })
      );
      const speciePromise = new Promise((resolve) => {
        fetchCSV(options.species.url, (speciesLines) => {
          resolve(speciesLines);
        });
      });
      Promise.all([speciePromise, ...labelPromises]).then((promiseResults) => {
        const specieLines = chunk(
          promiseResults[0],
          options.species.linesPerItem
        );
        const labelMaps = promiseResults.slice(1);

        const speciesData = new Map();
        const componentToSpecies = new Map();
        for (let i = 0; i < specieLines.length; ++i) {
          let type = "aqs";
          let id = getData(specieLines[i], options.species, "id");
          for (let j = 0; j < options.species.labels.length; ++j) {
            if (labelMaps[j].has(id)) {
              type = options.species.labels[j].type;
            }
          }
          let numComponents = getData(
            specieLines[i],
            options.species,
            "numComponents"
          );
          const components = new Map();
          for (let j = 0; j < numComponents; ++j) {
            components.set(
              getDataWithStride(
                specieLines[i],
                options.species,
                "components",
                j
              ),
              Number.parseFloat(
                getDataWithStride(
                  specieLines[i],
                  options.species,
                  "componentAmts",
                  j
                )
              )
            );
          }
          let specie = {
            id,
            name: getData(specieLines[i], options.species, "name"),
            charge: Number.parseFloat(
              getData(specieLines[i], options.species, "charge")
            ),
            logK: getData(specieLines[i], options.species, "logK"),
            type,
            index: i,
            components,
          };
          speciesData.set(specie.id, specie);
        }
        speciesData.forEach((specie, specieId) => {
          specie.components.forEach((_, componentId) => {
            if (componentToSpecies.has(componentId)) {
              componentToSpecies.get(componentId).add(specie.id);
            } else {
              componentToSpecies.set(componentId, new Set([specie.id]));
            }
          });
        });
        dispatchOccurenceChange({
          action: "speciesDataUpdate",
          componentToSpecies,
          speciesData,
        });
        setSpeciesLoading(false);
      });
    });

    return () => {
      // if options changed while we were loading this would break
      setComponentsLoading(true);
      setSpeciesLoading(true);
      dispatchOccurenceChange({ action: "reset" });
      resetForm();
    };
  }, [options]);

  const components = useMemo(() => {
    return [...componentAndSpecieState.components.values()].map((componentId) =>
      componentAndSpecieState.componentsData.get(componentId)
    );
  }, [
    componentAndSpecieState.components,
    componentAndSpecieState.componentsData,
  ]);

  useEffect(() => {
    const newComponents = formDataMerger(
      componentDefault,
      values.components,
      components
    );
    if (newComponents !== values.components) {
      setFieldValue("components", newComponents);
    }
  }, [components]);

  const species = useMemo(() => {
    const unsortedSpecies = [...componentAndSpecieState.speciesPresent.values()]
      .map((speciesId) => componentAndSpecieState.speciesData.get(speciesId))
      .map((specie) => {
        return {
          ...specie,
          components: [...specie.components.entries()]
            .filter(
              (compAndCount) =>
                compAndCount[0] !== componentAndSpecieState.waterValue
            )
            .map((compAndCount) => {
              return {
                data: componentAndSpecieState.componentsData.get(
                  compAndCount[0]
                ),
                amt: compAndCount[1],
              };
            }),
        };
      });

    const allLabels = [
      "aqs",
      ...options.species.labels.map((label) => label.type),
    ];
    const species = {};
    allLabels.forEach((type) => {
      species[type] = [];
    });
    unsortedSpecies.forEach((specie) => {
      species[specie.type].push(specie);
    });
    species.aqs.sort((specieA, specieB) => specieA.index - specieB.index);
    options.species.labels.forEach((opt) => {
      species[opt.type].sort(
        (specieA, specieB) => specieB.index - specieA.index
      );
    });
    return species;
  }, [
    componentAndSpecieState.speciesData,
    componentAndSpecieState.componentsData,
    componentAndSpecieState.speciesPresent,
    componentAndSpecieState.waterValue,
    options,
  ]);
  useEffect(() => {
    const allLabels = [
      "aqs",
      ...options.species.labels.map((label) => label.type),
    ];
    allLabels.forEach((type) => {
      const formDataSpeciesType = formDataMerger(
        specieDefault[type],
        values.species[type],
        species[type]
      );
      if (formDataSpeciesType !== values.species[type]) {
        setFieldValue(`species.${type}`, formDataSpeciesType);
      }
    });
  }, [species, options.species.labels]);

  const alkalinityContext = useMemo(() => {
    const newAlkComponents = new Set();
    values.alkalinity.species.forEach((id) => {
      if (componentAndSpecieState.componentsData.has(id)) {
        newAlkComponents.add(id);
      } else if (componentAndSpecieState.speciesData.has(id)) {
        componentAndSpecieState.speciesData
          .get(id)
          .components.forEach((value, key) => {
            newAlkComponents.add(key);
          });
      }
    });
    console.log("new alk comp");
    return { componentsMentioned: newAlkComponents };
  }, [
    values.alkalinity.species,
    componentAndSpecieState.componentsData,
    componentAndSpecieState.speciesData,
  ]);

  const loadingContext = useMemo(
    () => ({
      species: {
        aqs: speciesLoading,
        solids: speciesLoading,
        gases: speciesLoading,
      },
      components: componentsLoading,
    }),
    [componentsLoading, speciesLoading]
  );
  const componentContext = useMemo(
    () => ({
      componentList: [
        ...componentAndSpecieState.componentsData.values(),
      ].filter((comp) => comp.id !== componentAndSpecieState.waterValue),
      updateComponents: (componentsToAdd, componentsToRemove) => {
        dispatchOccurenceChange({
          action: "changeComponents",
          componentsToAdd: componentsToAdd
            .map((comp) => comp.id)
            .filter((comp) => comp !== componentAndSpecieState.waterValue),
          componentsToRemove: componentsToRemove
            .map((comp) => comp.id)
            .filter((comp) => comp !== componentAndSpecieState.hPlusValue),
        });
      },
    }),
    [
      componentAndSpecieState.componentsData,
      componentAndSpecieState.waterValue,
      componentAndSpecieState.hPlusValue,
    ]
  );
  return {
    loadingContext,
    componentContext,
    alkalinityContext,
  };
};

const InputForm = ({ dbOptions, values, setValues, setFieldValue }) => {
  return (
    <div className="w-full mb-2 flex flex-col gap-3 lg:grid lg:grid-cols-2 flex-grow min-h-0 px-3">
      <div className="contents lg:flex lg:flex-col lg:gap-3">
        <ComponentList initiallyExpanded={true} />
      </div>
      <div className="contents lg:flex lg:flex-col lg:gap-3">
        <AqList initiallyExpanded={true} />
        <GasList initiallyExpanded={false} />
        <SolidList initiallyExpanded={false} />
      </div>
    </div>
  );
};

const InternalEquilibriumForm = (props) => {
  const { handleSubmit, values, setValues } = props;
  const [showing, setShowing] = useState("INPUT");
  const [fileLoadingState, setFileLoadingState] = useState({
    loading: false,
    error: false,
  });

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [showing]);

  const { componentContext, loadingContext, alkalinityContext } =
    useDBData(props);
  return (
    <EquilibriumAlkalinityContext.Provider value={alkalinityContext}>
      <EquilbiriumLoadingContext.Provider value={loadingContext}>
        <EquilibriumComponentsContext.Provider value={componentContext}>
          <form onSubmit={handleSubmit} className="w-full" autoComplete="off">
            <fieldset className="w-full h-full pt-3 flex flex-col relative justify-between">
              <div className="grid grid-cols-3">
                <legend className="block col-start-2 justify-self-center ">
                  {fileLoadingState.loading ||
                    (fileLoadingState.error !== false && (
                      <div className="absolute w-full h-full z-50 bg-gray-300 bg-opacity-80 top-0 left-0">
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col align-middle">
                          {fileLoadingState.loading && <Spinner />}
                          {!fileLoadingState.loading &&
                            fileLoadingState.error !== false && (
                              <>
                                <div className="text-red-500 text-lg mb-2">
                                  !!!{fileLoadingState.error}!!!
                                </div>
                                <button
                                  className="btn-secondary"
                                  onClick={() => {
                                    setFileLoadingState({
                                      loading: false,
                                      error: false,
                                    });
                                  }}
                                >
                                  Undo
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    ))}
                </legend>
                <Toolbar
                  setValues={(newValues) => {
                    const oldids = values.components.map(
                      (component) => component.id
                    );
                    const newids = newValues.components.map(
                      (component) => component.id
                    );
                    componentContext.updateComponents([], values.components);
                    componentContext.updateComponents(newValues.components, []);
                    setValues(newValues);
                  }}
                  values={values}
                  setFileLoadingState={setFileLoadingState}
                  disabled={
                    loadingContext.components ||
                    loadingContext.species.aqs ||
                    loadingContext.species.solids ||
                    loadingContext.species.gases
                  }
                  className="col-start-3"
                />
              </div>

              {showing === "INPUT" && <InputForm {...props} />}
              {showing === "TABLEAU" && <Tableau {...props} />}
              <div className="mt-3 mb-6 px-3 grid grid-cols-2 gap-3 items-center w-full">
                <CalculateButton
                  className="btn-primary col-span-2 w-full"
                  type="submit"
                  disabled={showing !== "INPUT"}
                  focusOnClick={showing === "INPUT"}
                />
                {showing === "INPUT" && (
                  <button
                    type="button"
                    className="w-full btn-tertiary height-fit"
                    onClick={() => {
                      setShowing("TABLEAU");
                    }}
                    disabled={
                      loadingContext.components ||
                      loadingContext.species.aqs ||
                      loadingContext.species.solids ||
                      loadingContext.species.gases
                    }
                  >
                    Tableau
                  </button>
                )}
                {showing === "TABLEAU" && (
                  <button
                    type="button"
                    className="w-full btn-tertiary height-fit"
                    onClick={() => {
                      setShowing("INPUT");
                    }}
                  >
                    Input
                  </button>
                )}
                <button
                  type="button"
                  className="w-full btn-secondary height-fit"
                  onClick={() => {}}
                >
                  Past Results
                </button>
              </div>
            </fieldset>
          </form>
        </EquilibriumComponentsContext.Provider>
      </EquilbiriumLoadingContext.Provider>
    </EquilibriumAlkalinityContext.Provider>
  );
};

const EquilibriumForm = ({ dbOptions }) => {
  return (
    <Formik
      initialValues={defaultFormState}
      validate={validate}
      onSubmit={() => {
        console.log("submit");
      }}
    >
      {(props) => <InternalEquilibriumForm {...props} dbOptions={dbOptions} />}
    </Formik>
  );
};
export { useComponentContext, useLoadingContext, useAlkalinityContext };
export default EquilibriumForm;
