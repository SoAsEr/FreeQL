import React, { useMemo, useState } from "react";
import classNames from "classnames";
import LabeledConcentration from "../LabeledConcentration";
import ReplacementPicker from "./ReplacementPicker";
import ListItem from "../ListItem";
import SpecieContent from "./SpecieContent";
import { cumulativeSum } from "../../../utils/array-utils";
import chemicalNameSearch from "../chemicalNameSearch";
import Spinner from "../../../reusable_components/Spinner/Animated.js";
import { useLoadingContext } from "../../EquilibriumForm/EquilibriumForm";
import { useFormikContext } from "formik";
import CheckboxField from "../../../reusable_components/Formik/CheckboxField";
import BooleanFormikRadio from "../../../reusable_components/Formik/BooleanFormikRadio";

const AqSpecieListItem = ({ path, dbData, enabledStates }) => {
  return (
    <fieldset
      className={classNames(
        "col-span-2 grid gap-y-2 gap-x-4 grid-cols-2 text-current",
        { "text-opacity-60": !enabledStates.knownEquilibriumConcentration }
      )}
      disabled={!enabledStates.knownEquilibriumConcentration}
    >
      <legend>
        <label className="pl-4 flex justify-between items-center">
          <CheckboxField
            name={`${path}.knownEquilibriumConcentration`}
            className="mt-0.5 mr-3"
          />
          <span className="pointer-events-none inline xs:hidden">
            Known <abbr title="Equilibrium">Equil.</abbr>{" "}
            <abbr title="Concentration">Conc</abbr>:
          </span>
          <span className="pointer-events-none hidden xs:inline sm:hidden">
            Known <abbr title="Equilibrium">Equil.</abbr> Concentration:
          </span>
          <span className="pointer-events-none hidden sm:inline">
            Known Equilibrium Concentration:
          </span>
        </label>
      </legend>
      <LabeledConcentration
        path={`${path}.equilibriumConcentration`}
        label="Equilibrium Concentration"
      />
      <ReplacementPicker
        disabled={!enabledStates.knownEquilibriumConcentration}
        dbData={dbData}
        path={path}
        offset
      />
    </fieldset>
  );
};
const SolidSpecieListItem = ({ path, dbData, enabledStates }) => {
  return (
    <fieldset className={classNames("ml-4 col-span-2")}>
      <legend>Presence:</legend>
      <fieldset
        className={classNames("ml-4 col-span-2 text-current", {
          "text-opacity-60": enabledStates.forcedEquilibrium,
        })}
        disabled={enabledStates.forcedEquilibrium}
      >
        <legend>
          <label className="flex flex-wrap">
            <BooleanFormikRadio
              name={`${path}.forcedEquilibrium`}
              className="mr-2 mt-1.5"
              value={false}
            />
            Possible
          </label>
        </legend>
        <label className="ml-4 flex flex-wrap">
          <CheckboxField
            name={`${path}.probablyPresent`}
            className="mr-2 mt-1.5"
          />
          Probably Present
        </label>
      </fieldset>
      <fieldset
        className={classNames("ml-4 col-span-2 text-current", {
          "text-opacity-60": !enabledStates.forcedEquilibrium,
        })}
        disabled={!enabledStates.forcedEquilibrium}
      >
        <legend>
          <label className="flex flex-wrap">
            <BooleanFormikRadio
              name={`${path}.forcedEquilibrium`}
              className="mr-2 mt-1.5"
              value={true}
            />
            Force Equilibrium
          </label>
        </legend>
        <ReplacementPicker
          disabled={!enabledStates.forcedEquilibrium}
          path={path}
          dbData={dbData}
          offset
        />
      </fieldset>
    </fieldset>
  );
};
const GasSpecieListItem = ({ path, dbData }) => {
  return (
    <>
      <LabeledConcentration path={`${path}.partialPressure`}>
        <label className="justify-self-end">Partial Pressure:</label>
      </LabeledConcentration>
      <ReplacementPicker path={path} dbData={dbData} />
    </>
  );
};

const SpecieListItem = ({
  filteredOut,
  value,
  last,
  path,
  dbData,
  SpecieListItemComponent,
}) => {
  const enabledStates = useMemo(
    () => ({
      present: value.enabled,
      knownEquilibriumConcentration: value.knownEquilibriumConcentration,
      forcedEquilibrium: value.forcedEquilibrium,
    }),
    [
      value.enabled,
      value.knownEquilibriumConcentration,
      value.forcedEquilibrium,
    ]
  );
  return (
    <>
      <ListItem
        className="grid grid-cols-2 gap-x-4 items-center"
        filteredOut={filteredOut}
        disabled={!enabledStates.present}
        last={last}
      >
        {useMemo(
          () => (
            <>
              <SpecieContent
                path={path}
                dbData={dbData}
                enabledStates={enabledStates}
              />
              {enabledStates.present && (
                <div className="col-span-2 pt-2 grid grid-cols-2 gap-y-2 gap-x-4 items-center">
                  <SpecieListItemComponent
                    path={path}
                    dbData={dbData}
                    enabledStates={enabledStates}
                  />
                </div>
              )}
            </>
          ),
          [path, dbData, enabledStates]
        )}
      </ListItem>
    </>
  );
};

const SpecieList = React.memo(({ type, SpecieListItemComponent }) => {
  const [search, setSearch] = useState("");
  const { values } = useFormikContext();
  const loading = useLoadingContext().species[type];

  const species = values.species[type];

  if (!loading && !species.length) {
    return (
      <ListItem last>
        <p className="text-current text-opacity-50 w-full text-center">
          Nothing here yet...
        </p>
      </ListItem>
    );
  }
  const numNotFiltered = cumulativeSum(
    species.map((specie) =>
      chemicalNameSearch(specie.dbData.name, search.toLowerCase()) ? 1 : 0
    )
  );
  return (
    <>
      <ListItem className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-5 top-1/2 -translate-y-1/2 transform"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
        {search && (
          <button
            type="button"
            //className="outline-none"
            onClick={() => setSearch("")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-x-circle block sm:hidden absolute right-5 top-1/2 -translate-y-1/2 transform"
              viewBox="0 0 16 16"
            >
              <title>Clear searchbar</title>
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        )}
        <input
          placeholder="Search..."
          className={classNames(
            "w-full p-1 outline-none border-transparent focus:border-blue-400 border rounded-md",
            { "pl-8": !search, "pl-10": !!search }
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </ListItem>
      {species.map((specie, i) => {
        const filteredOut = numNotFiltered[i] === (numNotFiltered[i - 1] ?? 0);
        return (
          <SpecieListItem
            key={specie.dbData.id}
            path={`species.${type}.${i}`}
            dbData={specie.dbData}
            value={values.species[type][i]}
            filteredOut={filteredOut}
            last={
              !filteredOut &&
              numNotFiltered[i] === numNotFiltered[numNotFiltered.length - 1]
            }
            SpecieListItemComponent={SpecieListItemComponent}
          />
        );
      })}
      {loading ? (
        <ListItem last>
          <Spinner className="mx-auto" />
        </ListItem>
      ) : numNotFiltered[numNotFiltered.length - 1] === 0 ? (
        <ListItem last>
          <p className="text-current text-opacity-50 w-full text-center">
            No results, maybe try the common name
          </p>
        </ListItem>
      ) : null}
    </>
  );
});

export { SpecieList, AqSpecieListItem, SolidSpecieListItem, GasSpecieListItem };
