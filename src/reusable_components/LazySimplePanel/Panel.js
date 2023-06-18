import classNames from "classnames";
import { useCallback, useLayoutEffect, useState } from "react";

const Panel = ({ Header, children, className, initiallyExpanded }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  return (
    <>
      <Header
        toggleCollapse={() => {
          setExpanded((oldExpanded) => !oldExpanded);
        }}
        expanded={expanded}
      />
      <div
        className={classNames(className, {
          "hidden": !expanded,
        })}
      >
        {children}
      </div>
    </>
  );
};
export { Panel };
