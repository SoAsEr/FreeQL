import * as Immutable from "immutable";

const isImmuList = "_ImList";
const isImmuMap = "_ImMap";
const isImmuOrderedMap = "_ImOrd";
const isImmuSet = "_ImSet";
const isImmuOrderedSet = "_ImOrdSet";

function stringify(obj) {
  function toPlainObj(immu) {
    if(immu===null || typeof immu !=="object"){
      return immu
    } else if(Immutable.List.isList(immu)){
      return {[isImmuList]: true, data: Array.from(immu).map(toPlainObj)};
    } else if(Immutable.Map.isMap(immu)){
      return {[isImmuMap]: true, data: Array.from(immu.entries()).map(toPlainObj)};
    } else if(Immutable.OrderedMap.isOrderedMap(immu)){
      return {[isImmuOrderedMap]: true, data: Array.from(immu.entries()).map(toPlainObj)};
    } else if(Immutable.Set.isSet(immu)){
      return {[isImmuSet]: true, data: Array.from(immu).map(toPlainObj)};
    } else if(Immutable.OrderedSet.isOrderedSet(immu)){
      return {[isImmuOrderedSet]: true, data: Array.from(immu).map(toPlainObj)};
    } else if(Array.isArray(immu)){
      return immu.map(toPlainObj);
    } else {
      let ret={};
      for(const prop in immu){
        ret[prop]=toPlainObj(immu[prop]);
      }
      return ret;
    }
  }
  return JSON.stringify(toPlainObj(obj))
}


function parse(str) {
  function toImmutable(immu) {
    const {data} = immu;
    if(immu===null || typeof immu !=="object"){
      return immu;
    } else if(immu[isImmuList]) {
      return Immutable.List(toImmutable(data));
    } else if(immu[isImmuMap]){
      return Immutable.Map(toImmutable(data));
    } else if(immu[isImmuOrderedMap]){
      return Immutable.OrderedMap(toImmutable(data));
    } else if(immu[isImmuSet]){
      return Immutable.Set(toImmutable(data))
    } else if(immu[isImmuOrderedSet]){
      return Immutable.OrderedSet(toImmutable(data));
    } else if(Array.isArray(immu)){
      return immu.map(toImmutable);
    } else {
      let ret={};
      for(const prop in immu){
        ret[prop]=toImmutable(immu[prop]);
      }
      return ret;
    }
  }
  return toImmutable(JSON.parse(str));
}

export {stringify, parse};