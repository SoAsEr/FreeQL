import Tippy from "@tippyjs/react";
import React from "react";
import classNames from "classnames";

const TooltipButton = React.memo(
  ({ disabled, disableMessage, className, ...buttonProps }) => {
    return (
      <Tippy content={disableMessage} onShow={(e) => !!disabled}>
        <button
          className={classNames(className, { "btn-disabled": disabled })}
          {...buttonProps}
        />
      </Tippy>
    );
  }
);
export default TooltipButton;
