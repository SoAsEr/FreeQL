import is_number from "is-number";
import React, { useCallback, useId } from "react";
import EditDefault from "../../../reusable_components/EditDefault";
import { FastField } from "formik";
import { numberRegex } from "../../../utils/string-utils";

const constantValidation = (input) => numberRegex.test(input);
const onSubmitValidation = (input) => is_number(input);

const LogKEditor = ({ dbData, path, disabled }) => {
  return (
    <FastField name={`${path}.logKChanged`}>
      {(logKChanged) => (
        <FastField name={`${path}.logK`}>
          {({ form, ...logK }) => (
            <div className="flex justify-around items-center w-full text-sm">
              <label className="mr-2">logK:</label>
              <EditDefault
                constantValidation={constantValidation}
                onSubmitValidation={onSubmitValidation}
                warnValidation={(input) =>
                  Math.sign(+input) === Math.sign(+dbData.logK)
                    ? false
                    : "Warning: the sign has changed"
                }
                isDefault={!logKChanged.field.value}
                value={logK.field.value}
                description="logK"
                onEdit={(value) => {
                  form.setFieldValue(`${path}.logK`, value);
                  form.setFieldValue(`${path}.logKChanged`, true);
                }}
                onResetToDefault={() => {
                  form.setFieldValue(`${path}.logK`, dbData.logK);
                  form.setFieldValue(`${path}.logKChanged`, false);
                }}
                inputProps={{
                  className: "text-control thin text-center w-full",
                }}
                disabled={disabled}
              />
            </div>
          )}
        </FastField>
      )}
    </FastField>
  );
};

export default LogKEditor;
