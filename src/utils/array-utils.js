const cumulativeSum = (array) => {
  return array.reduce((r, a) => {
    r.push(((r.length && r[r.length - 1]) || 0) + a);
    return r;
  }, []);
};

export {cumulativeSum};