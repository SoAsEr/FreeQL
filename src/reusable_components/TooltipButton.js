import Tippy from "@tippyjs/react";
import React from "react";


const TooltipButton=React.memo(({disabled, disableMessage, ...buttonProps}) => {
   if(disabled) {
    return (
      <Tippy content={disableMessage}>
        <div className="flex"><button {...buttonProps} disabled /></div>
      </Tippy>
    )

  } else {
    return <div className="flex"><button {...buttonProps} disabled={disabled} /></div>;
  }
});
export default TooltipButton