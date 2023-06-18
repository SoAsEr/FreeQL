import Tippy from "@tippyjs/react";
import React from "react";
import FormattedChemicalCompound from "../../reusable_components/formatting/FormattedChemicalCompound";

const ReplacementError = ({ meta, field, dbData, children }) => {
  const everyError = meta.error && typeof meta.error === "string";
  const soleError = meta.error && field.checked && !everyError;
  return (
    <Tippy
      content={
        soleError && (
          <p className="text-center">
            {meta.error.message}
            {meta.error.components
              .filter(
                (item) => item.type !== dbData.type || item.id !== dbData.id
              )
              .map((item, index, arr) => (
                <React.Fragment key={item.id}>
                  <FormattedChemicalCompound>
                    {item.name}
                  </FormattedChemicalCompound>
                  {index !== arr.length - 1 && ", "}
                </React.Fragment>
              ))}
          </p>
        )
      }
      onShow={() => !!soleError}
    >
      {children(everyError || soleError)}
    </Tippy>
  );
};

export default ReplacementError;
