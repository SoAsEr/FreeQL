import React, { useId, useState } from "react";
import FormattedChemicalCompound from "../../../reusable_components/formatting/FormattedChemicalCompound";
import LabeledConcentration from "../LabeledConcentration";
import ListItem from "../ListItem";
import ComponentSelect from "./ComponentSelect";
import { Panel } from "../../../reusable_components/LazySimplePanel/Panel";
import classNames from "classnames";
import CollapseButton from "../CollapseButton";
import {
  useAlkalinityContext,
  useComponentContext,
  useLoadingContext,
} from "../../EquilibriumForm/EquilibriumForm";
import { FastField, useFormikContext } from "formik";
import Spinner from "../../../reusable_components/Spinner/Animated.js";
import ReplacementError from "../ReplacementError";
import CheckboxField from "../../../reusable_components/Formik/CheckboxField";

const Remover = ({ dbData, invisible }) => {
  const { updateComponents } = useComponentContext();
  return (
    <div>
      <button
        type="button"
        onClick={() => updateComponents([], [dbData])}
        className={classNames("text-gray-700 hover:text-gray-400 mt-2", {
          "invisible": invisible,
        })}
        aria-label={"Remove " + dbData.name}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className="bi bi-x"
          viewBox="0 0 16 16"
        >
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>
    </div>
  );
};

const ComponentListItem = React.memo(
  ({ path, dbData, mentionedByAlkalinity }) => {
    const hPlus = dbData.hPlus;
    const radioId = useId();
    return (
      <ListItem className="grid gap-x-4 items-center grid-cols-2 sm:grid-rows-1 sm:component-item-columns">
        <legend>
          <div className="grid columns-three-center items-center col-span-2 sm:col-span-1">
            <Remover dbData={dbData} invisible={hPlus} />
            <h3
              className={classNames(
                "flex mx-auto flex-wrap pointer-events-none"
              )}
            >
              <FormattedChemicalCompound>
                {dbData.name}
              </FormattedChemicalCompound>
            </h3>
          </div>
        </legend>
        <fieldset
          aria-label="Concentration Type"
          className="block pl-1 sm:pl-0"
        >
          <div>
            <label>
              <FastField
                type="radio"
                value="total"
                name={`${path}.concentrationType`}
              >
                {({ field }) => (
                  <input
                    type="radio"
                    className="mr-2"
                    {...field}
                    id={`${radioId}-total`}
                  />
                )}
              </FastField>
              <span>
                Total <abbr title="Concentration">Conc</abbr>:
              </span>
            </label>
          </div>

          {mentionedByAlkalinity && (
            <div>
              <label>
                <FastField
                  type="radio"
                  value="alk"
                  name={`${path}.concentrationType`}
                >
                  {({ field, meta }) => (
                    <>
                      <input
                        type="radio"
                        className="mr-2"
                        {...field}
                        id={`${radioId}-alk`}
                      />
                      <span
                        className={classNames({
                          "text-red-500":
                            typeof meta.error === "string" && field.checked,
                        })}
                      >
                        Alkalinity:
                      </span>
                    </>
                  )}
                </FastField>
              </label>
            </div>
          )}
          <FastField
            type="radio"
            value={hPlus ? "pH" : "equilibrium"}
            name={`${path}.concentrationType`}
          >
            {({ field, meta }) => (
              <div>
                <ReplacementError field={field} meta={meta} dbData={dbData}>
                  {(error) => (
                    <label>
                      <input
                        type="radio"
                        className="mr-2"
                        {...field}
                        id={`${radioId}-equil`}
                      />
                      <span
                        className={classNames({
                          "text-red-500": meta.error && field.checked,
                        })}
                      >
                        {hPlus && "pH:"}
                        {!hPlus && (
                          <>
                            <span className="hidden sm:inline">
                              Equilibrium{" "}
                              <abbr title="Concentration">Conc</abbr>:
                            </span>
                            <span className="inline sm:hidden">
                              <abbr title="Equilibrium">Equil.</abbr>{" "}
                              <abbr title="Concentration">Conc</abbr>:
                            </span>
                          </>
                        )}
                      </span>
                    </label>
                  )}
                </ReplacementError>
              </div>
            )}
          </FastField>
        </fieldset>
        <LabeledConcentration path={`${path}.concentration`} />
      </ListItem>
    );
  }
);

const EditAlkalinity = React.memo(({}) => {
  return (
    <FastField name="alkalinity.species">
      {({ field }) => {
        return console.log(field);
      }}
    </FastField>
  );
});

const ExtraInfoItem = React.memo(({ ionicStrength }) => {
  const [showAlkalinityEdit, setShowAlkalinityEdit] = useState(false);
  return (
    <ListItem className="grid grid-cols-2">
      <button
        className="btn-secondary mx-3 h-min self-center"
        onClick={() => setShowAlkalinityEdit((show) => !show)}
      >
        {!showAlkalinityEdit && "Edit"}
        {showAlkalinityEdit && "Close"}{" "}
        <span className="inline xs:hidden">Alk.</span>
        <span className="hidden xs:inline">Alkalinity</span> Eq
      </button>
      <div className="mx-3 flex flex-wrap gap-x-4 gap-y-2 justify-content-center">
        <div className="mt-1.5 flex items-center">
          <CheckboxField
            name={`ionicStrength.fixed`}
            className="mr-2 mb-1.5"
            aria-label="Fix Ionic Strength"
          />
          <label className="mb-2.5">Fix Ionic Strength:</label>
        </div>
        <fieldset className="contents" disabled={!ionicStrength.fixed}>
          <LabeledConcentration
            path="ionicStrength.value"
            className="flex-grow w-16"
            label="Ionic Strength"
          />
        </fieldset>
      </div>
      {showAlkalinityEdit && <EditAlkalinity />}
    </ListItem>
  );
});

const ComponentListItems = React.memo(() => {
  const loading = useLoadingContext().components;
  const { values } = useFormikContext();
  const alkalinityContext = useAlkalinityContext();
  console.log(values);
  return (
    <>
      <ExtraInfoItem ionicStrength={values.ionicStrength} />
      {loading &&
        values.components.every((component) => !component.dbData.hPlus) && (
          <ListItem>
            <Spinner className="mx-auto" />
          </ListItem>
        )}
      {values.components.map((component, i, arr) => (
        <ComponentListItem
          key={component.dbData.id}
          path={`components.${i}`}
          dbData={component.dbData}
          mentionedByAlkalinity={alkalinityContext.componentsMentioned.has(
            component.dbData.id
          )}
        />
      ))}
    </>
  );
});

const ComponentHeader = React.memo(({ toggleCollapse, expanded, inMotion }) => (
  <ListItem
    className="flex justify-between items-center"
    header
    inMotion={inMotion}
    last={!expanded}
  >
    <label>Components</label>
    <CollapseButton toggleCollapse={toggleCollapse} expanded={expanded} />
  </ListItem>
));

const ComponentList = React.memo(({ initiallyExpanded }) => {
  return (
    <ul className="w-full">
      <Panel
        Header={ComponentHeader}
        className="pb-0.5"
        initiallyExpanded={initiallyExpanded}
      >
        <ComponentListItems />
        <ListItem last>
          <ComponentSelect />
        </ListItem>
      </Panel>
    </ul>
  );
});

export default ComponentList;
