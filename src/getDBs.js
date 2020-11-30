import textToTable from './utils/table-utils.js';
import { chunk } from 'chunk';
import * as Immutable from 'immutable';

const getData=(item, options, property) => {
  //console.log(item);    
  return item[options[property].row][options[property].column];
}
const getDataWithStride=(item, options, property, i) => {
  return item[options[property].row][options[property].column+i*options[property].stride];
}

const getComponentDB=({url, options, type, callback}) => {
  console.log({url, options, type, callback});
  if(type==="link") {
    return fetch(url)
      .then(response => response.text())
      .then(text => textToTable(text))
      .then(result => chunk(result, options.linesPerItem))
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
    return Promise.all([url, ...options.labels.urls].map(url => fetch(url))).then(responses =>{
      return Promise.all(responses.map(res => res.text().then(text=> textToTable(text))))
    }).then(tables => {
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
        aqs: {
          species: Immutable.OrderedMap(),
          componentToSpecies: Immutable.Map(),
        },
        solids: {
          species: Immutable.OrderedMap(),
          componentToSpecies: Immutable.Map(),
        },
        gases: {
          species: Immutable.OrderedMap(),
          componentToSpecies: Immutable.Map(),
        },
      }
      db.aqs.species=db.aqs.species.withMutations(aqSpecies => {
        db.solids.species=db.solids.species.withMutations(solidSpecies => {
          db.gases.species=db.gases.species.withMutations(gasSpecies => {
            const db={aqSpecies, solidSpecies, gasSpecies};
            for(const item of chunkedMainTable){
              const id=Number(getData(item, options, "id"));
              const property=(labelMap.get(id) ?? "aq")+"Species";
              db[property].set(id, 
                {
                  name: getData(item, options, "name"),
                  charge: Number(getData(item, options, "charge")),
                  logK: Number(getData(item, options, "logK")),
                  label: labelMap.get(Number(getData(item, options, "id"))) ?? 0,
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
      db.aqs.componentToSpecies=db.aqs.componentToSpecies.withMutations(aqComponentToSpecies => {
        for(const [speciesId, {components}] of db.aqs.species) {
          for(const [componentId] of components) {
            aqComponentToSpecies.update(componentId, (oldSet=Immutable.Set()) => oldSet.add(speciesId));
          }
        }
      });
      db.solids.componentToSpecies=db.solids.componentToSpecies.withMutations(solidComponentToSpecies => {
        for(const [speciesId, {components}] of db.solids.species) {
          for(const [componentId] of components) {
            solidComponentToSpecies.update(componentId, (oldSet=Immutable.Set()) => oldSet.add(speciesId));
          }
        }
      });
      db.gases.componentToSpecies=db.gases.componentToSpecies.withMutations(gasComponentToSpecies => {
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
      labelMap: ["solid", "gas"]
    }
  }, 
  callback, 
});

export {getComponentDB, componentDBDefaultParams, getSpeciesDB, speciesDBDefaultParams}