import { useCallback, useState, useEffect, useMemo } from "react";

function wrapPromise(promise) {
  let status = "pending";
  let result;
  let suspender = promise.then(
    r => {
      status = "success";
      result = r;
    },
    e => {
      status = "error";
      result = e;
    }
  );
  return () => {
    if (status === "pending") {
      throw suspender;
    } else if (status === "error") {
      throw result;
    } else if (status === "success") {
      return result;
    }
  };
}

const useAsyncResourceWithBoolean=(getter, initialParams) => {
  const [dataCallbackRef, setDataCallbackRef]=useState({current: undefined});
  const [transitionState, setTransitionState]=useState(!!initialParams);

  const getNewData=useCallback((params) => {
    setTransitionState(true);
    setDataCallbackRef({current: wrapPromise(getter(params).then((result) => {setTransitionState(false); return result}))});
  }, [setDataCallbackRef, getter]);

  
  const getData=useMemo(() => {
    console.log("went through memo");
    if(dataCallbackRef.current || initialParams===undefined){
      return dataCallbackRef.current;
    } else {
      return () => {
        throw new Promise(() => {});
      }
    }
  }, [dataCallbackRef, transitionState]);

  useEffect(() => {
    if(initialParams!==undefined){
      getNewData(initialParams);
    }
  }, []);

  return [getData, getNewData, transitionState];
}

export {useAsyncResourceWithBoolean};