import React, { useMemo } from "react";
import FormattedChemicalCompound from "../../../reusable_components/formatting/FormattedChemicalCompound";
import CheckboxField from "../../../reusable_components/Formik/CheckboxField";
import LogKEditor from "./LogKEditor";

const EnableSpecie = ({ path, dbData }) => {
  return (
    <legend>
      <div className="grid columns-three-center relative w-full items-center">
        <div className="w-100">
          <CheckboxField
            name={`${path}.enabled`}
            className="mt-1"
            aria-label={`Enable ${dbData.name}`}
          />
        </div>
        <label className="flex mx-auto flex-wrap pointer-events-none">
          <FormattedChemicalCompound>{dbData.name}</FormattedChemicalCompound>
        </label>
      </div>
    </legend>
  );
};

const SpecieContent = ({ path, dbData, enabledStates }) => {
  return (
    <>
      <EnableSpecie path={path} dbData={dbData} />
      <LogKEditor
        disabled={!enabledStates.present}
        path={path}
        dbData={dbData}
      />
    </>
  );
};

export default SpecieContent;
