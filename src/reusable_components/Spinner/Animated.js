import React from "react";
import classNames from "classnames";

const Spinner = React.memo(({ className, size }) => {
  return (
    <div
      role="progressbar"
      aria-valuetext="Loading..."
      aria-busy="true"
      aria-live="polite"
      aria-valuemin="0"
      aria-valuemax="100"
      className={classNames(
        "border-black animate-spin rounded-full border-r-transparent",
        { "h-8 w-8 border-4 ": !size, [size]: !!size },
        className
      )}
    ></div>
  );
});

export default Spinner;
