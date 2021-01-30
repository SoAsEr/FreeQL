import React from "react";

import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";


const TooltipButton=React.memo(({disabled, disableMessage, ...buttonProps}) => {
  if(disabled) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            {disableMessage}
          </Tooltip>
        }
      >
        <div className="disabled-button-wrapper">
          <Button {...buttonProps} disabled />
        </div>
      </OverlayTrigger>
    )
  } else {
    return <Button {...buttonProps} />;
  }
});
export default TooltipButton