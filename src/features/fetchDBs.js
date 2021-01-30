import { fetchCSV, getData, getDataWithStride } from '../utils/readCSV.js';
import chunk from "chunk";

import * as Immutable from 'immutable';


const fetchSpeciesDB=({url, options, type, callback}) => {
  if(type==="link") {
    return Promise.all([url, ...options.labels.urls].map(url => fetchCSV(url))).then(tables => {
      const [mainTable, ...labelTables]=tables;
      const labelList=labelTables.map(labelTable => chunk(labelTable, options.linesPerItem)).map(chunkedLabelTable => chunkedLabelTable.map(labelTable => getData(labelTable, options.labels, "id")));

      const labelMap=Immutable.Map().withMutations((labelMap) => {
        for(const [index, labelTable] of labelList.entries()) {
          for(const specie of labelTable){
            labelMap.set(specie, options.labels.labelMap[index]);
          }
        };
      });
      
      const chunkedMainTable=chunk(mainTable, options.linesPerItem).filter(chunk => Number(chunk[0][0]));
      const db={
        aqs: null,
        solids: null,
        gases: null,
      }
      db.aqs=Immutable.Map().withMutations(aqSpecies => {  
        db.solids=Immutable.Map().withMutations(solidSpecies => {
          db.gases=Immutable.Map().withMutations(gasSpecies => {
            const db={aqs: aqSpecies, solids: solidSpecies, gases: gasSpecies};
            for(const item of chunkedMainTable){
              const id=getData(item, options, "id");
              const dbAddingTo=db[labelMap.get(id) ?? "aqs"]
              dbAddingTo.set(id, 
                {
                  name: getData(item, options, "name"),
                  charge: Number(getData(item, options, "charge")),
                  logK: Number(getData(item, options, "logK")),
                  label: labelMap.get(id) ?? 0,
                  index: dbAddingTo.size,
                  components: Immutable.OrderedMap().withMutations((components) => {
                    for(let i=0; i<getData(item, options, "numComponents"); ++i){
                      const component=getDataWithStride(item, options, "components", i);
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
      
      return db;
    })
  }
}

const fetchComponentDB=({url, options, type, callback}) => {
  if(type==="link") {
    return fetchCSV(url).then(result => chunk(result, options.linesPerItem))
    .then(chunks => 
      ({
        hPlusValue: options.hPlusValue, 
        waterValue: options.waterValue,
        components: Immutable.OrderedMap(chunks.filter(item => getData(item, options, "id")).map(item => [
          getData(item, options, "id"),
          {
            name: getData(item, options, "name"), 
            charge: Number(getData(item, options, "charge")),
          }
        ]))
      })
    )
    
  }
}

const componentDBDefaultParams={
  url: process.env.PUBLIC_URL+"/assets/defaultdb/comp.vdb", 
  type: "link",
  options: {
    linesPerItem: 1,
    id: {row: 0, column: 0},
    name: {row: 0, column: 1},
    charge: {row: 0, column: 2},
    hPlusValue: "330",
    waterValue: "2",
  }, 
};

const speciesDBDefaultParams={
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
};

export {fetchSpeciesDB, fetchComponentDB, speciesDBDefaultParams, componentDBDefaultParams};