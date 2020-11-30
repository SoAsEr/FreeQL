import { useRef, useCallback } from "react";

import { useCallbackRef } from "./ref-utils";


const useResizeObserver=(callback) =>{
  const resizeObsRef=useRef(new ResizeObserver((entries) => {
    const boundingRect=entries[0].target.getBoundingClientRect();
    callback({width: boundingRect.width, height: boundingRect.height})
  }));
  return useCallbackRef(
    useCallback((node) => {
      resizeObsRef.current.observe(node)
    }, [resizeObsRef]), 
    useCallback((node) => {
      resizeObsRef.current.unobserve(node)
    }, [resizeObsRef]),
    useCallback(() => callback({width: 0, height: 0}), [callback])
  );
}
  
export default useResizeObserver;