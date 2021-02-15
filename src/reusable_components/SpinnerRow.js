import React from "react";

const SpinnerComponentRow=React.memo(() => {
  return (
    <div className="mb-3 w-100" style={{"height": "38px"}}>
      Loading........
    </div>
  );
});

export default SpinnerComponentRow;