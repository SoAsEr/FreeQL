import React from 'react';

import ComponentRow from "./ComponentRow.js";

const ComponentList=React.memo((props) => {
  const {componentsDB, componentsPresent}=props;
  return (
    <>
      {componentsPresent.delete(componentsDB().hPlusValue).delete(componentsDB().waterValue).map(id => {
        return <ComponentRow {...props} key={id} component={id} componentsDB={componentsDB}/>
      })}
    </>
  )
});

export default ComponentList;