const getData=(item, options, property) => {
  return item[options[property].row][options[property].column];
}
const getDataWithStride=(item, options, property, i) => {
  return item[options[property].row][options[property].column+i*options[property].stride];
}

function parseCSVWithPartial(str) {
  let arr = [];
  let quote = false;

  let lastLineStart=0;
  let lastMatchEnd=0;
  let row=0;
  let col=0;
  for(const match of str.matchAll(/("")|(")|(,)|(?:(\r\n)|(\n)|(\r))($)?|$/g)){
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';
    if(match[7]){
      break;
    }
    arr[row][col]+=str.substring(lastMatchEnd, match.index);
    if(match[1]){
      if(quote){
        arr[row][col]+='"';
      }
      lastMatchEnd=match.index+2;
    } else if(match[2]){
      quote=!quote;
      lastMatchEnd=match.index+1;
    } else if(match[3]){
      ++col;
      lastMatchEnd=match.index+1;
    } else if(match[4]) {
      ++row;
      col=0;
      lastMatchEnd=match.index+2;
      lastLineStart=lastMatchEnd;
    } else if(match[5] || match[6]) {
      ++row;
      col=0;
      lastMatchEnd=match.index+1;
      lastLineStart=lastMatchEnd;
    }
  }
  return [arr, str.substring(lastLineStart)];
}

const fetchCSV=(url) => {
  return fetch(url)
    .then(
      response => {
        const reader=response.body.getReader();
        let lastLine="";
        let csvBuilt=[];
        const chunkParser=(chunk, partial) => {
          const decodedChunk=lastLine+new TextDecoder("utf-8").decode(chunk);
          const [parsed, thisLastLine] = parseCSVWithPartial(decodedChunk);
          if(!partial) {
            lastLine=thisLastLine;
            return parsed.slice(0, parsed.length-1);
          } else {
            return parsed;
          }
        }
        return new Promise(resolve => {
          pump();
          function pump() {
            return reader.read().then(res => {
              if(res.done) {
                csvBuilt=csvBuilt.concat(chunkParser(res.value, true));
                resolve(csvBuilt);
                return;
              }
              csvBuilt=csvBuilt.concat(chunkParser(res.value));
              pump();
            })
          }
        })
      }
    )
}




export {getData, getDataWithStride, fetchCSV};