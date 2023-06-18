import { Field } from "formik";
import { useId } from "react";

const CheckboxField = (props) => {
  const id = useId();
  return (
    <Field {...props} type="checkbox">
      {({ field, form }) => (
        <input
          {...props}
          {...field}
          type="checkbox"
          checked={field.value}
          id={id}
        />
      )}
    </Field>
  );
};

export default CheckboxField;
