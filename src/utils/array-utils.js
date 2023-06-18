const cumulativeSum = (array) => {
  return array.reduce((r, a) => {
    r.push(((r.length && r[r.length - 1]) || 0) + a);
    return r;
  }, []);
};

function findLastIndex(array, predicate) {
  let l = array.length;
  while (l--) {
      if (predicate(array[l], l, array))
          return l;
  }
  return -1;
}

export {cumulativeSum, findLastIndex};