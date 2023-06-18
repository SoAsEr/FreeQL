import React from "react";
import {
  AqSpecieListItem,
  GasSpecieListItem,
  SolidSpecieListItem,
  SpecieList,
} from "./SpecieList";
import IndeterminateCheckbox from "../../../reusable_components/IndeterminateCheckbox";
import ListItem from "../ListItem";
import CollapseButton from "../CollapseButton";
import { Panel } from "../../../reusable_components/LazySimplePanel/Panel";
import { useFormikContext } from "formik";

const createSpecieListHeader =
  (name, type) =>
  ({ expanded, toggleCollapse, borderRadius }) => {
    const { values, setFieldValue } = useFormikContext();
    const species = values.species[type];
    const numEnabled = species.filter((specie) => specie.enabled).length;
    const checkboxValue =
      numEnabled === 0
        ? false
        : numEnabled === species.length
        ? true
        : "indeterminate";
    return (
      <ListItem
        header
        borderAnimation={{
          borderBottomRightRadius: borderRadius,
          borderBottomLeftRadius: borderRadius,
        }}
        last={!expanded}
        className="grid grid-cols-2 gap-x-2 gap-y-1 justify-between items-center"
      >
        <>
          <label className="justify-self-start">
            <IndeterminateCheckbox
              onChange={(e) => {
                setFieldValue(
                  `species.${type}`,
                  values.species[type].map((specie) => ({
                    ...specie,
                    enabled: e.target.checked,
                  }))
                );
              }}
              className="mr-2 mt-0.5"
              disabled={species.length === 0}
              checked={checkboxValue}
              aria-label={
                checkboxValue === true ? "Deselect all" : "Select all"
              }
            />
            {name} {"("}
            {numEnabled}/{species.length}
            <span className="hidden sm:inline">&nbsp;selected</span>
            {")"}
          </label>
          <CollapseButton toggleCollapse={toggleCollapse} expanded={expanded} />
        </>
      </ListItem>
    );
  };

const AqHeader = createSpecieListHeader("Aqueous", "aqs");
const SolidHeader = createSpecieListHeader("Solids", "solids");
const GasHeader = createSpecieListHeader("Gases", "gases");

const createSpecieList =
  (type, Header, ListItem) =>
  ({ initiallyExpanded }) => {
    return (
      <ul className="w-full">
        <Panel
          Header={Header}
          className="pb-0.5"
          initiallyExpanded={initiallyExpanded}
        >
          <SpecieList type={type} SpecieListItemComponent={ListItem} />
        </Panel>
      </ul>
    );
  };

const AqList = createSpecieList("aqs", AqHeader, AqSpecieListItem);
const SolidList = createSpecieList("solids", SolidHeader, SolidSpecieListItem);
const GasList = createSpecieList("gases", GasHeader, GasSpecieListItem);

export { AqList, SolidList, GasList };
