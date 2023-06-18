import { useCallback, useRef } from "react";

const useCallbackRef=(onUpdate , cleanupOld, onNull=() => {}) => {
  const ref = useRef(null)
  const setRef = useCallback(node => {
    if (ref.current) {
      cleanupOld(ref.current);
    } 
    
    if (node) {
      onUpdate(node)
    } else {
      onNull();
    }
    
    ref.current = node
  }, [cleanupOld, onUpdate, onNull])
  
  return setRef
}

const mergeRefs = (...refs) => {
  return node => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }
  };
};

export {useCallbackRef, mergeRefs};