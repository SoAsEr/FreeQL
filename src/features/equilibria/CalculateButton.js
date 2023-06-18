import React from "react";

import TooltipButton from "../../reusable_components/TooltipButton";

import { useLoadingContext } from "../EquilibriumForm/EquilibriumForm";
import { useFormikContext } from "formik";

const CalculateButton = ({
  onClick,
  focusOnClick,
  disabled,
  ...otherProps
}) => {
  const loadingContext = useLoadingContext();
  const { errors } = useFormikContext();

  if (
    loadingContext.components ||
    loadingContext.species.aqs ||
    loadingContext.species.solids ||
    loadingContext.species.gases
  ) {
    return (
      <TooltipButton
        disabled
        disableMessage="Getting Database..."
        children="Calculate"
        {...otherProps}
      />
    );
  }
  if (
    focusOnClick &&
    errors.highestPriority &&
    errors.highestPriority.length !== 0
  ) {
    return (
      <TooltipButton
        disabled
        disableMessage={errors.highestPriority[0].message.toString()}
        onClick={(e) => {
          const nameQueryString = `[name="${errors.highestPriority[0].instancePath
            .substring(1)
            .replaceAll("/", ".")}"]`;
          const queryString = `input[type="radio"]${nameQueryString}:checked,input:not([type="radio"])${nameQueryString}`;
          const element = e.target.closest("form").querySelector(queryString);
          element.focus();
        }}
        children="Calculate"
        {...otherProps}
      />
    );
  } else if (disabled) {
    return (
      <TooltipButton
        children="Calculate"
        disableMessage="Please Return to Input Page"
        disabled
        {...otherProps}
      />
    );
  } else {
    return (
      <TooltipButton children="Calculate" onClick={onClick} {...otherProps} />
    );
  }
};

export default CalculateButton;
