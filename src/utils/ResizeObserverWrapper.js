import React from 'react';

const ResizeObserverWrapper=React.forwardRef((props, ref)=> {
  return (
    <div ref={ref} className="prevent-margin-collapse">
      {[props.children]}
    </div>
  );
});

export default ResizeObserverWrapper;