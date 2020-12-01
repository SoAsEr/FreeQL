import { useState, useEffect, useRef } from "react";
import * as Comlink from "comlink";;

const useComlinkWorker=(WorkerClass, parameters) => {
  const wrapperRef=useRef(null);
  useEffect(() => {
    const worker=new WorkerClass(parameters);
    const comlinkwrap=Comlink.wrap(worker);
    wrapperRef.current=comlinkwrap;
    return () => {worker.terminate()}
  }, []);
  return wrapperRef.current;
}

export default useComlinkWorker;