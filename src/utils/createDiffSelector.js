import * as Immutable from "immutable";
import { createSelectorCreator, defaultMemoize } from "reselect";
import { shallowEqualArrays } from "shallow-equal";

const diffMemoize=(fn, initial, addReducer, removeReducer) => {
  let oldArgs=null;
  let oldFirstArg=null;
  let reduceResult=null;
  return (firstArg, ...args) => {
    if(!shallowEqualArrays(oldArgs, args)){
      oldFirstArg=Immutable.Set();
      reduceResult=initial;
      oldArgs=args;
    }
    const added=firstArg.subtract(oldFirstArg);
    const removed=oldFirstArg.subtract(firstArg);
    if(added.size){
      reduceResult=added.reduce((prev, curr) => addReducer(prev, curr, ...args), reduceResult);
    }
    if(removed.size){
      reduceResult=removed.reduce((prev, curr) => removeReducer(prev, curr, ...args), reduceResult);
    }
    oldFirstArg=firstArg;
    return fn(reduceResult, ...args);
  }
}

const my_createSelectorCreator = (memoize, ...memoizeOptions) => {
  return createSelectorCreator((fn, mapmem) => {
    if(mapmem===true){
      return memoize(fn, ...memoizeOptions);
    } else {
      return defaultMemoize(fn);
    }
  }, true);
}

const createDiffSelector=(args, initial, addFunc, removeFunc, finalFunc) => {
  return my_createSelectorCreator(diffMemoize, initial, addFunc, removeFunc)(args, finalFunc);
}
export {createDiffSelector};