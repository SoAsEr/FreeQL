import { chunk } from 'chunk';
import * as Immutable from 'immutable';

const getData=(item, options, property) => {
  //console.log(item);    
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

const getComponentDB=async ({url, options, type, callback}) => {
  console.log({url, options, type, callback});
  if(type==="link") {
    return fetchCSV(url).then(result => chunk(result, options.linesPerItem))
    .then(chunks => 
      ({
        hPlusValue: options.hPlusValue, 
        waterValue: options.waterValue,
        components: Immutable.OrderedMap(chunks.filter(item => Number(getData(item, options, "id"))).map(item => [
          Number(getData(item, options, "id")),
          {
            name: getData(item, options, "name"), 
            charge: Number(getData(item, options, "charge")),
          }
        ]))
      })
    ).then(db => {
      if(!callback) {
        return db;
      }
      const res=callback(db);
      if(res instanceof Promise){
        return res.then(_ => db);
      } else {
        return db;
      }
    });
    
  }
};

const componentDBDefaultParams=(callback) => ({
  url: process.env.PUBLIC_URL+"/assets/defaultdb/comp.vdb", 
  type: "link",
  options: {
    linesPerItem: 1,
    id: {row: 0, column: 0},
    name: {row: 0, column: 1},
    charge: {row: 0, column: 2},
    hPlusValue: 330,
    waterValue: 2,
  }, 
  callback
});

const getSpeciesDB=({url, options, type, callback}) => {
  console.log({url, options, type, callback}); 
  if(type==="link") {
    return Promise.all([url, ...options.labels.urls].map(url => fetchCSV(url))).then(tables => {
      const [mainTable, ...labelTables]=tables;
      const labelList=labelTables.map(labelTable => chunk(labelTable, options.linesPerItem)).map(chunkedLabelTable => chunkedLabelTable.map(labelTable => getData(labelTable, options.labels, "id")));

      const labelMap=Immutable.Map().withMutations((labelMap) => {
        for(const [index, labelTable] of labelList.entries()) {
          for(const specie of labelTable){
            labelMap.set(Number(specie), options.labels.labelMap[index]);
          }
        };
      });
      
      
      const chunkedMainTable=chunk(mainTable, options.linesPerItem).filter(chunk => Number(chunk[0][0]));
      const db={
        aqs: {},
        solids: {},
        gases: {},
      }
      db.aqs.species=Immutable.OrderedMap().withMutations(aqSpecies => {  
        db.solids.species=Immutable.OrderedMap().withMutations(solidSpecies => {
          db.gases.species=Immutable.OrderedMap().withMutations(gasSpecies => {
            const db={aqs: aqSpecies, solids: solidSpecies, gases: gasSpecies};
            for(const item of chunkedMainTable){
              const id=Number(getData(item, options, "id"));
              db[labelMap.get(id) ?? "aqs"].set(id, 
                {
                  name: getData(item, options, "name"),
                  charge: Number(getData(item, options, "charge")),
                  logK: Number(getData(item, options, "logK")),
                  label: labelMap.get(id) ?? 0,
                  components: Immutable.Map().withMutations((components) => {
                    for(let i=0; i<getData(item, options, "numComponents"); ++i){
                      const component=Number(getDataWithStride(item, options, "components", i));
                      const componentAmt=Number(getDataWithStride(item, options, "componentAmts", i));
                      components.set(component, componentAmt);
                    }
                  }),
                }
              )
            }
          });
        });
      });   
      db.aqs.componentToSpecies=Immutable.Map().withMutations(aqComponentToSpecies => {
        for(const [speciesId, {components}] of db.aqs.species) {
          for(const [componentId] of components) {
            aqComponentToSpecies.update(componentId, (oldSet=Immutable.Set()) => oldSet.add(speciesId));
          }
        }
      });
      db.solids.componentToSpecies=Immutable.Map().withMutations(solidComponentToSpecies => {
        for(const [speciesId, {components}] of db.solids.species) {
          for(const [componentId] of components) {
            solidComponentToSpecies.update(componentId, (oldSet=Immutable.Set()) => oldSet.add(speciesId));
          }
        }
      });
      db.gases.componentToSpecies=Immutable.Map().withMutations(gasComponentToSpecies => {
        for(const [speciesId, {components}] of db.gases.species) {
          for(const [componentId] of components) {
            gasComponentToSpecies.update(componentId, (oldSet=Immutable.Set()) => oldSet.add(speciesId));
          }
        }
      });
      
      return db;
    }).then(db => {
      if(!callback) {
        return db;
      }
      const res=callback(db);
      if(res instanceof Promise){
        return res.then(_ => db);
      } else {
        return db;
      }
    });
    
  }
}

const speciesDBDefaultParams=(callback) => ({
  url: process.env.PUBLIC_URL+"/assets/defaultdb/thermo.vdb", 
  type: "link",
  options: {
    linesPerItem: 3,
    id: {row: 0, column: 0},
    name: {row: 0, column: 1},
    charge: {row: 0, column: 6},
    logK: {row: 0, column: 3},
    numComponents: {row: 0, column: 10},
    components: {row: 1, column: 1, stride: 2},
    componentAmts: {row: 1, column: 0, stride: 2},
    labels: {
      urls: [process.env.PUBLIC_URL+"/assets/defaultdb/type6.vdb", process.env.PUBLIC_URL+"/assets/defaultdb/gases.vdb"],
      linesPerId: 3,
      id: {row: 0, column: 0},
      labelMap: ["solids", "gases"]
    }
  }, 
  callback, 
});

export {getComponentDB, componentDBDefaultParams, getSpeciesDB, speciesDBDefaultParams}