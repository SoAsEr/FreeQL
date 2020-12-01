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
  const filteredRefs = refs.filter(Boolean);
  if (!filteredRefs.length) return null;
  if (filteredRefs.length === 0) return filteredRefs[0];
  return inst => {
    for (const ref of filteredRefs) {
      if (typeof ref === 'function') {
        ref(inst);
      } else if (ref) {
        ref.current = inst;
      }
    }
  };
};

export {useCallbackRef, mergeRefs};