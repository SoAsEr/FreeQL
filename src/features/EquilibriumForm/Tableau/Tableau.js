import React, { useContext, useMemo } from "react";
import { useState } from "react";
import FormattedChemicalCompound from "../../../reusable_components/formatting/FormattedChemicalCompound";
import createTableauArrays from "./tableauArrays";
import {
  HoverCellContext,
  HoverColContext,
  hoverHeaderRowHelper,
  hoverRowHelper,
  HoverSection,
} from "../../../reusable_components/Table/Hover";

const TableauHeaderRow = (props) => {
  return hoverHeaderRowHelper(
    {
      colContext: useContext(HoverColContext),
      cellContext: useContext(HoverCellContext),
    },
    <tr {...props} />
  );
};
const TableauRow = React.memo((props) => {
  return hoverRowHelper(
    {
      cellContext: useContext(HoverCellContext),
      rowHover: true,
      colHover: true,
    },
    <tr {...props} />
  );
});

const TableauName = ({ dbData }) => {
  return (
    <span className="px-2 children:max-w-[25vw] children:w-max children:inline-block">
      <FormattedChemicalCompound>{dbData.name}</FormattedChemicalCompound>
    </span>
  );
};

const hashDBData = (dbData) => `${dbData.type} ${dbData.id}`;

const TableauSection = ({ array, dataArray, componentArray, render }) => {
  return (
    <>
      {array.map((row, index) =>
        render(
          <th
            className="sticky left-0 font-semibold border-r border-r-gray-200 bg-white"
            scope="row"
          >
            <TableauName dbData={dataArray[index]} />
          </th>,
          row.map((element, index) => (
            <td key={componentArray[index].dbData.id} className="text-center">
              {element}
            </td>
          )),
          <td>
            <span className="px-2">
              {dataArray[index].type === "components"
                ? 0
                : dataArray[index].logK}
            </span>
          </td>,
          index,
          dataArray[index]
        )
      )}
    </>
  );
};

TableauSection.defaultProps = {
  render: (name, mainRow, logK, index, specie) => (
    <TableauRow
      key={hashDBData(specie)}
      className="children:border-t children:border-t-gray-200"
    >
      {name}
      {mainRow}
      {logK}
    </TableauRow>
  ),
};

const captionClassNames =
  "inline-block md:w-[calc(100vw-clamp(7rem,25vw,16rem)-1rem-16px-3rem-0.5rem)] lg:w-[calc(100vw-clamp(7rem,25vw,16rem)-1rem-16px-0.5rem)] w-[calc(100vw-clamp(7rem,25vw,16rem)-1rem-16px-0.5rem)] sticky left-[calc(clamp(7rem,25vw,16rem)+1rem)]";

const Tableau = ({ values }) => {
  const [showComponentSpecies, setShowComponentSpecies] = useState(true);
  const {
    componentSpecieArray,
    componentSpecieDataArray,
    totals,
    presentArray,
    presentDataArray,
    possiblyArray,
    possiblyDataArray,
    replacementArray,
    replacementDataArray,
    replacementIndexes,
    replacementConstants,
  } = createTableauArrays(values);
  const excludeColumns = useMemo(
    () => [
      0,
      //values.components.length + 1,
      //values.components.length + 2,
      //values.components.length + 3,
    ],
    [
      //values.components.length
    ]
  );
  console.log(totals);

  const componentHeaders = [
    <th
      className="border-r border-r-gray-200 bg-white sticky top-0 left-0 z-50"
      key="first"
    ></th>,
    values.components.map(({ dbData }) => (
      <th key={dbData.id} className="font-semibold sticky top-0" scope="col">
        <TableauName dbData={dbData} />
      </th>
    )),
    <th className="text-left font-semibold sticky top-0" scope="col" key="last">
      LogKs
    </th>,
  ];

  return (
    <div className="mb-1 flex flex-col gap-4 flex-grow w-full">
      <div className="overflow-auto">
        <table className="min-w-full border-separate spacing-0 relative pb-1">
          <caption className="mb-2 text-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-caret-right-fill inline-block sticky left-2 mb-1"
              viewBox="0 0 16 16"
            >
              <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
            </svg>
            <div className="sticky left-8 inline-block">
              Aquaeous Species Tableau
            </div>
          </caption>

          <HoverSection excludeColumns={excludeColumns}>
            <thead>
              <TableauHeaderRow className="children:border-b-gray-200 chilren:first:border-b-transparent children:border-b children:align-bottom">
                {componentHeaders}
              </TableauHeaderRow>
            </thead>
            <tbody>
              {showComponentSpecies && (
                <TableauSection
                  array={componentSpecieArray}
                  dataArray={componentSpecieDataArray}
                  componentArray={values.components}
                />
              )}
              <TableauSection
                array={presentArray}
                dataArray={presentDataArray}
                componentArray={values.components}
              />
              <TableauRow className="children:border-t-2 children:border-t-gray-800">
                <th className="font-semibold border-r border-gray-200 bg-white sticky left-0">
                  Totals:
                </th>
                {totals.map((element, index) => (
                  <td
                    key={values.components[index].dbData.id}
                    className="text-center"
                  >
                    {element === null ? (
                      <abbr title="to be calculated">TBC</abbr>
                    ) : (
                      element
                    )}
                  </td>
                ))}
                <td className="bg-gray-100" />
              </TableauRow>
            </tbody>
          </HoverSection>
        </table>
      </div>
      {possiblyArray.length !== 0 && (
        <div className="overflow-auto">
          <table className="min-w-full border-separate spacing-0 relative pb-1">
            <caption className="mb-2 text-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-right-fill inline-block sticky left-2 mb-1"
                viewBox="0 0 16 16"
              >
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
              </svg>
              <div className="sticky left-8 inline-block">
                Possible Solids Tableau
              </div>
            </caption>
            <HoverSection excludeColumns={excludeColumns}>
              <thead>
                <TableauHeaderRow className="children:border-b-gray-200 children:border-b children:align-bottom">
                  {componentHeaders}
                </TableauHeaderRow>
              </thead>
              <tbody>
                <TableauSection
                  array={possiblyArray}
                  dataArray={possiblyDataArray}
                  componentArray={values.components}
                />
              </tbody>
            </HoverSection>
          </table>
        </div>
      )}
      {replacementArray.length !== 0 && (
        <div className="overflow-auto">
          <table className="min-w-full border-separate spacing-0 relative pb-1">
            <caption className="mb-2 text-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-right-fill inline-block sticky left-2 mb-1"
                viewBox="0 0 16 16"
              >
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
              </svg>
              <div className="sticky left-8 inline-block">
                Replacement Tableau
              </div>
            </caption>
            <HoverSection excludeColumns={excludeColumns}>
              <thead>
                <TableauHeaderRow className="children:border-b-gray-200 children:border-b children:align-bottom">
                  {componentHeaders}
                  <th scope="col" className="font-semibold sticky top-0">
                    <span className="px-2">
                      <abbr title="Constant">C</abbr>
                    </span>
                  </th>
                  <th scope="col" className="font-semibold sticky top-0">
                    <span className="px-2">Replacing:</span>
                  </th>
                </TableauHeaderRow>
              </thead>
              <tbody>
                <TableauSection
                  array={replacementArray}
                  dataArray={replacementDataArray}
                  componentArray={values.components}
                  render={(name, mainRow, logK, index, specie) => (
                    <TableauRow
                      key={hashDBData(specie)}
                      className="children:border-t children:border-t-gray-200"
                    >
                      {name}
                      {mainRow}
                      {logK}
                      <td className="text-center">
                        {replacementConstants[index]}
                      </td>
                      <td className="text-center">
                        {replacementIndexes[index] !== null ? (
                          <FormattedChemicalCompound>
                            {
                              values.components[replacementIndexes[index]]
                                .dbData.name
                            }
                          </FormattedChemicalCompound>
                        ) : (
                          ""
                        )}
                      </td>
                    </TableauRow>
                  )}
                />
              </tbody>
            </HoverSection>
          </table>
        </div>
      )}
    </div>
  );
};

export { Tableau };
