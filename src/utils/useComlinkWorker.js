import { useState, useEffect, useRef } from "react";
import * as Comlink from "comlink";;

const useComlinkWorker=(WorkerClass, parameters) => {
  const [comlinkWrapper, setComlinkWrapper]=useState({current: null});
  useEffect(() => {
    const worker=new WorkerClass(parameters);
    setComlinkWrapper({current: Comlink.wrap(worker)});
    return () => {worker.terminate()}
  }, []);
  return comlinkWrapper.current;
}

export default useComlinkWorker;