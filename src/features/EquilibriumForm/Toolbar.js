import React, { useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import classNames from "classnames";
import validate_data from "../../validation/validate_eq_data";
import {
  aqSpecieDefault,
  componentDefault,
  gasSpecieDefault,
  solidSpecieDefault,
} from "./elementDefaults";

const twoDigit = (num) => {
  const str = num.toString();
  return str.length === 1 ? "0" + str : str;
};

const mergewithoutextras = (def, calculated) => {
  if (typeof def !== typeof calculated) {
    throw new Error("failed to create default");
  }
  for (const key in def) {
    if (calculated[key]) {
      if (typeof calculated[key] === "object") {
        mergewithoutextras(def[key], calculated[key]);
      } else {
        def[key] = calculated[key];
      }
    }
  }
};

const Toolbar = ({ setValues, values, disabled, setFileLoadingState }) => {
  const fileReader = useRef(new FileReader());
  useEffect(() => {
    const fileReaderLoadingEventListener = (e) => {
      let result = null;
      try {
        result = JSON.parse(e.target.result);
      } catch {
        console.log("hello");
        setFileLoadingState({ loading: false, error: "File is invalid JSON" });
        return;
      }
      validate_data(result);
      if (validate_data.errors) {
        setFileLoadingState({
          loading: false,
          error: validate_data.errors.toString(),
        });
      } else {
        const defaultObj = {
          components: result.components.map((comp) =>
            componentDefault(comp.dbData)
          ),
          species: {
            aqs: result.species.aqs.map((comp) => aqSpecieDefault(comp.dbData)),
            solids: result.species.solids.map((comp) =>
              solidSpecieDefault(comp.dbData)
            ),
            gases: result.species.gases.map((comp) =>
              gasSpecieDefault(comp.dbData)
            ),
          },
        };
        mergewithoutextras(defaultObj, result);
        setValues(defaultObj);
        setFileLoadingState({ loading: false, error: false });
      }
    };
    const fileReaderErrorEventListener = (e) => {
      setFileLoadingState({ loading: false, error: "Error reading file" });
    };
    const currentFileReader = fileReader.current;
    currentFileReader.addEventListener("load", fileReaderLoadingEventListener);
    currentFileReader.addEventListener("error", fileReaderErrorEventListener);
    return () => {
      currentFileReader.removeEventListener(
        "load",
        fileReaderLoadingEventListener
      );
      currentFileReader.removeEventListener(
        "error",
        fileReaderErrorEventListener
      );
    };
  }, [setValues, setFileLoadingState]);
  return (
    <div
      className={"flex gap-3 justify-end pr-4 children:w-6 children:h-6 mb-2"}
    >
      <button
        onClick={() => {
          const now = new Date();
          saveAs(
            new Blob([JSON.stringify(values)], {
              type: "application/octet-stream",
            }),
            `system-${now.getFullYear()}${twoDigit(
              now.getMonth() + 1
            )}${twoDigit(now.getDate())}-${twoDigit(now.getHours())}${twoDigit(
              now.getMinutes()
            )}${twoDigit(now.getSeconds())}.freeql`
          );
        }}
        disabled={disabled}
        className={classNames({ "opacity-50": disabled })}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="bi bi-download"
          viewBox="0 0 16 16"
        >
          <title>Download current system</title>
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
        </svg>
      </button>
      <label className={classNames("relative", { "opacity-50": disabled })}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className={classNames("bi bi-upload relative z-10 bg-white", {
            "cursor-pointer": !disabled,
          })}
          viewBox="0 0 16 16"
        >
          <title>Load system</title>
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
        </svg>
        <input
          type="file"
          className="w-6 h-6 absolute z-0 left-0 top-0"
          onChange={(e) => {
            if (e.target.files) {
              setFileLoadingState({ loading: true, error: false });
              fileReader.current.readAsText(e.target.files[0]);
            }
          }}
          accept=".json,.freeql"
          disabled={disabled}
        />
      </label>
    </div>
  );
};
export default Toolbar;
