const stringMatchAllReplace=(str, regex, replaceFunc) => {
  const matches=str.matchAll(regex);
  let nextSubstrStart=0;
  let strSoFar=""
  for(const match of matches){
    strSoFar+=str.substring(nextSubstrStart, match.index);
    strSoFar+=replaceFunc(match);
    nextSubstrStart=match.index+match.length;
  }
  strSoFar+=str.substring(nextSubstrStart);
  return strSoFar;
};

const numberToExpNoTrailing=(number, maxLength, minExp=2 ) => {
  const pow10=Math.floor(Math.abs(Math.log10(number)));
  if(pow10<minExp){
    return number.toPrecision(maxLength).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/, '');
  } else {
    return number.toExponential(maxLength-1).replace(/(\.\d*?)0+e/,'$1e').replace(/\.e/, 'e').replace(/e\+/, "e");
  }
}
const numberToExpWithTrailing=(number, maxLength, minExp=2 ) => {
  const pow10=Math.floor(Math.abs(Math.log10(number)));
  if(pow10<minExp){
    return number.toPrecision(maxLength)
  } else {
    return number.toExponential(maxLength-1).replace(/e\+/, "e");
  }
}

export { stringMatchAllReplace, numberToExpWithTrailing, numberToExpNoTrailing };