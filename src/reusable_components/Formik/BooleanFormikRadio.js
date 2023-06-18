import { useId } from "react";
import { FastField } from "formik";

const BooleanFormikRadio = (props) => {
  const id = useId();
  return (
    <FastField {...props} type="radio">
      {({ field, form }) => {
        return (
          <input
            {...props}
            {...field}
            id={id}
            type="radio"
            onChange={(e) => {
              form.setFieldValue(field.name, props.value);
            }}
          />
        );
      }}
    </FastField>
  );
};

export default BooleanFormikRadio;
