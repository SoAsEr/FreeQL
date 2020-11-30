
import React from 'react';

const SuspenseDisabler=({onRender, children}) => {
  onRender();
  return(
    <>
      {children}
    </>
  )
}

export default SuspenseDisabler;