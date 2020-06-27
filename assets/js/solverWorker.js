importScripts("//pyodide-cdn2.iodide.io/v0.15.0/full/pyodide.js");

async function prepareTableauObjects(){
  await languagePluginLoader;
  let [,speciesCSVString, componentCSVString, setupCode] = await Promise.all([
    pyodide.loadPackage('numpy'),
    fetch("/assets/solver/thermo.vdb").then(function(response){
      return response.text();
    }),
    fetch("/assets/solver/comp.vdb").then(function(response){
      return response.text();
    }),
    fetch("/assets/solver/TableauSolver.py").then(function(response){
      return response.text();
    })
  ]);
  pyodide.runPython("speciesCSVString='''"+speciesCSVString+"'''");
  pyodide.runPython("componentCSVString='''"+componentCSVString+"'''");
  pyodide.runPython(setupCode);
}

var pythonReady=prepareTableauObjects();

pythonReady.then(function(e){
  postMessage([1, null]);
});


onmessage = function(e) {
  pythonReady.then(function(){
    postMessage([2, pyodide.runPython("solutionFromWholeTableau("+e.data+")"), e.data]);
  });
}
