import { useCallback, unstable_useTransition, useRef, useState, useEffect, useMemo } from "react";

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
  const [dataCallbackRef, setDataCallbackRef]=useState({current: null});
  const [transitionState, setTransitionState]=useState(!!initialParams);

  const getNewData=useCallback((params) => {
    setTransitionState(true);
    setDataCallbackRef({current: wrapPromise(getter(params).then((result) => {setTransitionState(false); return result}))});
  }, [setDataCallbackRef, getter]);

  const getData=useMemo(() => {
    if(dataCallbackRef.current || !initialParams){
      return dataCallbackRef.current;
    } else {
      return () => {
        throw new Promise(() => {});
      }
    }
  }, [dataCallbackRef]);

  useEffect(() => {
    if(initialParams){
      getNewData(initialParams);
    }
  }, []);

  return [getData, getNewData, transitionState];
}

export {useAsyncResourceWithBoolean};