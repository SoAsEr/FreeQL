import React, { useId } from "react";
import ConstantValidationTextInput from "../../reusable_components/ConstantValidationTextInput";
import classNames from "classnames";
import { FastField } from "formik";
import { numberRegex } from "../../utils/string-utils";

const LabeledConcentration = React.memo(
  ({ children, labeledBy, label, path, className }) => {
    const controlId = useId();
    return (
      <>
        {children &&
          React.cloneElement(React.Children.only(children), {
            htmlFor: controlId,
          })}
        <FastField name={path}>
          {({ field, meta }) => {
            return (
              <ConstantValidationTextInput
                {...field}
                id={controlId}
                className={classNames(
                  "text-control text-center height-fit",
                  {
                    "invalid": !!meta.error,
                  },
                  className
                )}
                validation={(input) => numberRegex.test(input)}
                aria-labelledby={labeledBy}
                aria-label={
                  children || labeledBy ? undefined : label ?? "Concentration"
                }
              />
            );
          }}
        </FastField>
      </>
    );
  }
);

export default LabeledConcentration;
