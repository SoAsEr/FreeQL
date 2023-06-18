import React, { useCallback } from "react";

import { createFormatOptionLabel } from "../../../utils/react-select-utils.js";

import FormattedChemicalCompound from "../../../reusable_components/formatting/FormattedChemicalCompound.js";

import VirtualizedSelect from "../../../reusable_components/VirtualizedSelect.js";

import useMediaQuery from "../../../utils/useMediaQuery.js";
import {
  useComponentContext,
  useLoadingContext,
} from "../../EquilibriumForm/EquilibriumForm.js";
import chemicalNameSearch from "../chemicalNameSearch.js";

import { Field, FastField } from "formik";
import Spinner from "../../../reusable_components/Spinner/Animated.js";
import ComponentMobileSelect from "../../../reusable_components/VirtualizedMobileSelect.js";

const optionSearcher = (option, searchValue) => {
  return (
    option.value === "loading" ||
    chemicalNameSearch(option.value.name, searchValue)
  );
};
const chemicalFormatOptionLabel = createFormatOptionLabel(
  FormattedChemicalCompound
);

const formatOptionLabel = (props) => {
  if (props.value === "loading") {
    return <Spinner className="mx-auto" size="w-6 h-6 border-2" />;
  } else {
    return chemicalFormatOptionLabel(props);
  }
};

const ComponentSelectImpl = React.memo(({ components }) => {
  const { updateComponents, componentList } = useComponentContext();
  const floatInput = !useMediaQuery("(min-width: 690px)");
  const ComponentToUse = floatInput ? ComponentMobileSelect : VirtualizedSelect;
  const loading = useLoadingContext().components;

  const onChange = useCallback(
    (e) => {
      if (!e.action && e.value !== "loading") {
        updateComponents([e.value], []);
      }
    },
    [updateComponents]
  );
  const availableComponents = componentList
    .filter(
      (componentData) =>
        !components.some((component) => componentData === component.dbData)
    )
    .map((componentData) => ({
      value: componentData,
      label: componentData.name,
    }));
  if (loading) {
    availableComponents.push({ value: "loading" });
  }
  const noOptionsMessage = useCallback(
    () => (loading ? <Spinner /> : "No components found"),
    [loading]
  );
  return (
    <ComponentToUse
      menuShouldScrollIntoView={false}
      menuPosition="fixed"
      placeholder="Add Component..."
      noOptionsMessage={noOptionsMessage}
      options={availableComponents}
      filterOption={optionSearcher}
      formatOptionLabel={formatOptionLabel}
      onChange={onChange}
      value=""
    />
  );
});

const ComponentSelect = React.memo(() => {
  return (
    <FastField name="components">
      {(components) => (
        <ComponentSelectImpl components={components.field.value} />
      )}
    </FastField>
  );
});

export default ComponentSelect;
