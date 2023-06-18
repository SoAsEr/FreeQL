import React from "react";
import * as jsonpointer from "jsonpointer";
import FormattedChemicalCompound from "../../reusable_components/formatting/FormattedChemicalCompound";
import validate_form from "../../validation/validate_eq_form";

const errorPriority = [
  { instancePath: /^\/species\/.*\/replacedComponent$/, keyword: /^type$/ },
  {
    instancePath: /^\/components\/.*\/concentrationType$/,
    keyword: /^replacement$/,
  },
  {
    instancePath: /^\/species\/.*\/replacedComponent$/,
    keyword: /^replacement$/,
  },
  { instancePath: /^\/ionicStrength\/value$/ },
  { instancePath: /^\/components\/.*?\/concentration$/ },
  { instancePath: /^\/species\/aqs\/.*?\/equilibriumConcentration$/ },
  { instancePath: /^\/species\/gases\/.*?\/partialPressure$/ },
  {
    instancePath: /^\/components\/.*?\/concentrationType$/,
    keyword: /^contains$/,
  },
];

const validate = (values) => {
  console.log(values);
  const replacementMap = {};
  const replacementIdentities = {};

  const addItemToMaps = (replacedComponent, item) => {
    replacementMap[replacedComponent.id] =
      (replacementMap[replacedComponent.id] ?? 0) + 1;
    if (replacementIdentities[replacedComponent.id]) {
      replacementIdentities[replacedComponent.id].push(item);
    } else {
      replacementIdentities[replacedComponent.id] = [item];
    }
  };

  for (const component of values.components) {
    if (
      component.concentrationType === "pH" ||
      component.concentrationType === "equilibrium"
    ) {
      addItemToMaps(component.dbData, component.dbData);
    }
  }
  for (const aqSpecie of values.species.aqs) {
    if (aqSpecie.knownEquilibriumConcentration && aqSpecie.replacedComponent) {
      addItemToMaps(aqSpecie.replacedComponent, aqSpecie.dbData);
    }
  }
  for (const solidSpecie of values.species.solids) {
    if (solidSpecie.forcedEquilibrium && solidSpecie.replacedComponent) {
      addItemToMaps(solidSpecie.replacedComponent, solidSpecie.dbData);
    }
  }
  for (const gasSpecie of values.species.gases) {
    if (gasSpecie.replacedComponent) {
      addItemToMaps(gasSpecie.replacedComponent, gasSpecie.dbData);
    }
  }
  const valid = validate_form({ ...values, replacementMap });
  if (valid) {
    return {};
  }
  let allErrors = [];
  const errors = {};
  validate_form.errors.forEach((errorMessage) => {
    console.log(errorMessage);
    if (errorMessage.keyword !== "errorMessage") {
      if (errorMessage.keyword !== "if" && errorMessage.keyword !== "$merge") {
        console.log(errorMessage);
        throw new Error("internal validation error");
      }
      //jsonpointer.set(errors, error.instancePath, errorMessage.message);
      //allErrors.push({ ...error, message: errorMessage.message });
    } else {
      console.log(errorMessage);
      if (errorMessage.instancePath === "/components") {
        console.log("hit");
        errorMessage.params.errors = values.components
          .filter((comp) => comp.concentrationType == "alk")
          .map((val, index) => {
            return {
              ...errorMessage.params.errors[0],
              instancePath: `/components/${index}/concentrationType`,
            };
          });
      }
      if (errorMessage.message === "__REPLACE__") {
        errorMessage.params.errors.forEach((error) => {
          let newPath = error.instancePath;
          if (error.instancePath.match(/^\/species\//)) {
            newPath = error.instancePath.replace(/\/id$/, "");
          } else if (error.instancePath.match(/^\/components\//)) {
            error.instancePath.replace(/dbData\/id$/, "concentrationType");
          } else {
            console.error(error.toString());
            throw new Error("invalid replace path");
          }
          const newMessage = {
            toString: () => (
              <span>
                Conflicting component replacement:{" "}
                {replacementIdentities[
                  jsonpointer.get(values, error.instancePath)
                ].map((item, index, arr) => (
                  <React.Fragment key={item.id}>
                    <FormattedChemicalCompound>
                      {item.name}
                    </FormattedChemicalCompound>
                    {index !== arr.length - 1 && ", "}
                  </React.Fragment>
                ))}
              </span>
            ),
            message: "Conflicting component replacement: ",
            components:
              replacementIdentities[
                jsonpointer.get(values, error.instancePath)
              ],
          };
          jsonpointer.set(errors, newPath, newMessage);
          allErrors.push({
            ...error,
            instancePath: newPath,
            message: newMessage,
          });
        });
      } else {
        errorMessage.params.errors.forEach((error) => {
          jsonpointer.set(errors, error.instancePath, errorMessage.message);
          allErrors.push({ ...error, message: errorMessage.message });
        });
      }
    }
  });
  errors.highestPriority = [];
  for (const priorityItem of errorPriority) {
    allErrors = allErrors.filter((errorMessage) => {
      if (
        Object.keys(priorityItem).every((key) =>
          priorityItem[key].test(errorMessage[key])
        )
      ) {
        errors.highestPriority.push(errorMessage);
        return false;
      }
      return true;
    });
  }
  console.log(errors);
  if (allErrors.length === 0) {
    return errors;
  }
  console.log(allErrors);
  throw new Error("Some errors match nothing in priority order");
};

export default validate;
