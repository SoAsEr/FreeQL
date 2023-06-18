import React, { useId } from "react";
import classNames from "classnames";
import FormattedChemicalCompound from "../../../reusable_components/formatting/FormattedChemicalCompound";
import { FastField } from "formik";
import ReplacementError from "../ReplacementError";

const ReplacementPicker = ({ dbData, path, disabled, className, offset }) => {
  const listId = useId();
  return (
    <fieldset
      className={classNames(
        "col-span-2 grid grid-cols-2 gap-4 justify-items-end items-center text-current",
        { "text-opacity-60": disabled },
        className
      )}
      disabled={disabled}
    >
      <legend>
        <h3 className={classNames("block sm:hidden", { "pl-4": offset })}>
          Total to Ignore:
        </h3>
        <h3 className={classNames("hidden sm:block", { "pl-3": offset })}>
          Total Concentration to Ignore:
        </h3>
      </legend>
      <div className="justify-self-center">
        {dbData.components.map((component) => (
          <FastField
            disabled={disabled}
            key={component.data.id}
            value={component.data}
            name={`${path}.replacedComponent`}
            type="radio"
          >
            {({ form, field, meta }) => (
              <ReplacementError meta={meta} field={field} dbData={dbData}>
                {(error) => (
                  <label
                    className={classNames("flex items-center", {
                      "text-red-500": error,
                    })}
                  >
                    <input
                      {...field}
                      onChange={(e) => {
                        if (e.target.checked) {
                          form.setFieldValue(field.name, field.value);
                        }
                      }}
                      type="radio"
                      id={`${listId}-${component.data.id}`}
                      className={classNames("mr-1 mt-0.5")}
                    />
                    <span>
                      <FormattedChemicalCompound>
                        {component.data.name}
                      </FormattedChemicalCompound>
                    </span>
                  </label>
                )}
              </ReplacementError>
            )}
          </FastField>
        ))}
      </div>
    </fieldset>
  );
};

export default ReplacementPicker;
