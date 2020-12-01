import React, { useCallback } from 'react';

import ComponentRow from "./ComponentRow.js";

const HPlusComponent=React.memo((props) => {
  const {componentsDB, updateConc, componentsInputState, pH}=props;
  return(
    <ComponentRow component={componentsDB().hPlusValue} componentsDB={componentsDB} updateConc={pH ? useCallback((component, amt) => updateConc(component, Math.pow(10, -amt)), [updateConc]) : updateConc} disableCheck={true} controlChecked={componentsInputState.get(componentsDB().hPlusValue)?.get("equilChecked")} noClose/>
  );
});



export default HPlusComponent;