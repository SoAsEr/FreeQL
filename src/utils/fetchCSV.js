function parseCSVWithPartial(str) {
  let arr = [];
  let quote = false;

  let lastLineStart = 0;
  let lastMatchEnd = 0;
  let row = 0;
  let col = 0;
  for (const match of str.matchAll(
    /("")|(")|(,)|(?:(\r\n)|(\n)|(\r))($)?|$/g
  )) {
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || "";
    if (match[7]) {
      break;
    }
    arr[row][col] += str.substring(lastMatchEnd, match.index);
    if (match[1]) {
      if (quote) {
        arr[row][col] += '"';
      }
      lastMatchEnd = match.index + 2;
    } else if (match[2]) {
      quote = !quote;
      lastMatchEnd = match.index + 1;
    } else if (match[3]) {
      ++col;
      lastMatchEnd = match.index + 1;
    } else if (match[4]) {
      ++row;
      col = 0;
      lastMatchEnd = match.index + 2;
      lastLineStart = lastMatchEnd;
    } else if (match[5] || match[6]) {
      ++row;
      col = 0;
      lastMatchEnd = match.index + 1;
      lastLineStart = lastMatchEnd;
    }
  }
  return [arr, str.substring(lastLineStart)];
}

const fetchCSV = (url, resolve, resolvePartial) => {
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Network failure");
    }
    try {
      const reader = response.body.getReader();
      const textDecoder = new TextDecoder("utf-8");
      let lastLine = "";
      let csvBuilt = [];
      const chunkParser = (chunk, partial) => {
        const decodedChunk = lastLine + textDecoder.decode(chunk);
        const [parsed, thisLastLine] = parseCSVWithPartial(decodedChunk);
        if (partial) {
          lastLine = thisLastLine;
          return parsed.slice(0, parsed.length - 1);
        } else {
          return parsed;
        }
      };
      pump();
      function pump() {
        reader.read().then((res) => {
          if (res.done) {
            const newLines = chunkParser(res.value, false);
            csvBuilt = csvBuilt.concat(newLines);
            resolve(csvBuilt, newLines);
            return;
          }
          const newLines = chunkParser(res.value, true);
          csvBuilt = csvBuilt.concat(newLines);
          if (resolvePartial) {
            resolvePartial(csvBuilt, newLines);
          }
          pump();
        });
      }
    } catch {
      console.log(
        "streaming api seems to be absent, falling back to regular fetch"
      );
      response.text().then((text) => {
        const newLines = parseCSVWithPartial(text);
        resolve(newLines, newLines);
      });
    }
  });
};

export default fetchCSV;
