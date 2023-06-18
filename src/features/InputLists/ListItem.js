import React from "react";
import classNames from "classnames";

const ListItem = React.memo(
  ({
    children,
    className,
    disabled,
    header,
    last,
    filteredOut,
    borderAnimation,
  }) => {
    return (
      <>
        {
          <li
            style={{
              transitionProperty: "border-radius",
              transitionTimingFunction: "linear",
              transitionDuration: "200ms",
            }}
            className={classNames(
              "relative border-gray-400 border-r border-l",
              {
                "border-t rounded-t-sm": header,
                "border-b": !filteredOut,
                "hidden": filteredOut,
                "rounded-b-sm": last,
              }
            )}
          >
            <fieldset
              className={classNames(
                "px-3 py-2 text-black",
                { "text-opacity-60": disabled },
                className
              )}
              disabled={disabled}
            >
              {children}
            </fieldset>
          </li>
        }
      </>
    );
  }
);

export default ListItem;
