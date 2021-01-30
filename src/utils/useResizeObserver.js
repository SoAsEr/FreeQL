import { useRef, useCallback } from "react";
import { useCallbackRef } from "./ref-utils";

const useResizeObserver=(callback) => {
  const resizeObserverRef=useRef(null);
  const getResizeObserverRef=useCallback(() => {
    if(!resizeObserverRef.current){
      resizeObserverRef.current=new ResizeObserver((entries) => {
        const boundingRect=entries[0].target.getBoundingClientRect();
        callback({width: boundingRect.width, height: boundingRect.height})
      })
    }
    return resizeObserverRef;
  }, [resizeObserverRef, callback])
  const nodeRef=useCallbackRef(
    useCallback((node) => {
      getResizeObserverRef().current.observe(node)
    },[getResizeObserverRef]),
    useCallback((node) => {
      getResizeObserverRef().current.unobserve(node)
    },[getResizeObserverRef])
  )
  return nodeRef;
}

export default useResizeObserver;