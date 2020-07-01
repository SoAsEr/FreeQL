"use strict";

let currentComponents=["2", "330"];

let pasteUndo=[];

var componentsMap=new Map();
var speciesMap=new Map();
var solidsMap=new Map();
var gasesMap=new Map();
var editedLogKMap=new Map();

//https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value
Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

function speciesArraysEqual(a, b) {
  a.sort();
  b.sort();
  a.remove("2");
  b.remove("2");
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}



//https://www.geeksforgeeks.org/implementation-stack-javascript/
class Stack {
  // Array is used to implement stack
  constructor()
  {
    this.items = [];
  }
  // Functions to be implemented
  push(element)
  {
    // push element into the items
    this.items.push(element);
  }
  pop()
  {
    // return top most element in the stack
    // and removes it from the stack
    // Underflow if stack is empty
    if (this.items.length == 0)
    return null;
    return this.items.pop();
  }
  peek()
  {
    // return the top most element from the stack
    // but does'nt delete it.
    if(this.items.length==0)
    return null
    return this.items[this.items.length - 1];
  }
  isEmpty()
  {
    // return true if stack is empty
    return this.items.length == 0;
  }
}

function prettyExp(num, digits=4){
  return Number(num).toExponential(digits).replace(/(\.[0-9]*[1-9])0*?$|\.0*?$/, "$1");
}
function prettyExpWithSigs(num, digits=4){
  return Number(num).toExponential(digits);
}

function chemTextReplace(str){
  return str.replace(/([A-z)])([0-9])/g, "$1<sub>$2</sub>").replace(/([+-])(?:1|([2-9]))?($|[/<\s])/g, "<sup>$2$1</sup>$3");
}



function addComponents(){
  componentsMap.forEach(function(component, id){
    if(id==2 || id==1){
      return;
    }
    $("#selectpicker-component").append("<option data-tokens='' value='"+id+"'>"+component[0]+"</option>");
    $("#selectpicker-edit-alkalinity").append("<option value='c"+id+"'>"+component[0]+"</option>");
    if($("#CopyRowAlkEqn").nextAll("[data-species='c"+id+"']").length!=0){
      $("#selectpicker-edit-alkalinity").children().last().hide();
    }
  });
  speciesMap.forEach(function(species, id){
    $("#selectpicker-edit-alkalinity").append("<option value='s"+id+"'>"+species[0]+"</option>");
    if($("#CopyRowAlkEqn").nextAll("[data-species='s"+id+"']").length!=0){
      $("#selectpicker-edit-alkalinity").children().last().hide();
    }
    species[3].forEach((item, i) => {
      $("#selectpicker-component option[value='"+item+"']").each(function(index){
        $(this).attr("data-tokens", species[0].replace(/([+-])(?:1|([2-9]))?$/, "$2$1")+" "+$(this).attr("data-tokens"))
      });
    });
  });
}

function chemTextReplaces(){
  $(".chem-text").not(".selectpicker-delay").each(function(){
    $(this).html(chemTextReplace($(this).html()));
  });
  $(".text-center-selectpicker").not(".chem-text").children().each(function(){
    if($(this).attr("data-content")){
      $(this).attr("data-content", "<div class='w-100 text-center'>"+$(this).attr("data-content")+"</div>");
    } else {
      $(this).attr("data-content", "<div class='w-100 text-center'>"+$(this).text()+"</div>");
    }
  });
  $(".text-center-selectpicker.chem-text").children().each(function(){
    $(this).attr("data-content", "<div class='w-100 text-center'>"+chemTextReplace($(this).text())+"</div>");
  });
}


function addSpecies(toAddVal){
  currentComponents.push(toAddVal);
  $("#species-list").append("<li class='list-group-item' data-species='c"+toAddVal+"'><div class='d-flex justify-content-center'><div class='centering-div'></div><div class='species-label'>"+chemTextReplace(componentsMap.get(toAddVal)[0])+"</div><div class='centering-div form-check-container'><div class='form-check form-check-inline'><input type='checkbox' class='form-check-input species-check' checked></div></div></li>");

  speciesMap.forEach(function(species, id){
    if(species[3].every(function(val) {
      return currentComponents.indexOf(val) !== -1;
    }) && species[3].indexOf(toAddVal)!=-1){
      var speciesToAdd=$("<li class='list-group-item' data-species='s"+id+"'><div class='d-flex justify-content-center'><div class='centering-div'></div><div class='species-label'>"+chemTextReplace(species[0])+"</div><div class='centering-div form-check-container'><div class='form-check form-check-inline'><input type='checkbox' class='form-check-input species-check' checked></div></div></div></li>")
      if(solidsMap.has(id)){
        speciesToAdd.addClass("disabled")
        speciesToAdd.find(".species-check").prop("checked", false)
      }
      $("#species-list").append(speciesToAdd);
    }
  });
  $("#species-list").children().each(function(){
    if($(this).attr("data-species")[0]=="s" && gasesMap.has($(this).attr("data-species").substr(1))){
      $(this).remove();
    }
  });
  $($("#species-list").children().get().reverse()).each(function(){
    if($(this).attr("data-species")[0]=="c"){
      $(this).prependTo($("#species-list"));
    }
  });
  $("#species-list").children().each(function(){
    if($(this).attr("data-species")[0]=="s" && solidsMap.has($(this).attr("data-species").substr(1))){
      $(this).appendTo($("#species-list"));
    }
  });
}


function adjustWidthToTargets(){
  $(".adjustWidthToTarget").each(function(){
    this.style.overflow="hidden";
    setTimeout(function(){
      var width=document.getElementById(this.getAttribute("data-target")).clientWidth+"px";
      this.style.width=width;
      setTimeout(function(){
        this.style.overflow="visible";
      }.bind(this));
    }.bind(this));
  });
}


function adjustDontOverflows(){
  $(".dont-overflow-y").each(function(){
    $(this).css("max-height", "calc(100vh - "+$(this)[0].getBoundingClientRect().y+"px - "+$(this).nextAll().map(function(){
      return $(this)[0].getBoundingClientRect().height;
    }).toArray().reduce((accumulator, currentValue) => accumulator + currentValue, 0)+"px - 224px)");
  });
  $(".fill-screen-y").each(function(){
    $(this).css("height", "calc(100vh - "+$(this)[0].getBoundingClientRect().y+"px - "+$(this).nextAll().map(function(){
      return $(this)[0].getBoundingClientRect().height;
    }).toArray().reduce((accumulator, currentValue) => accumulator + currentValue, 0)+"px - 224px)");
  });
}

function createTableau(){
  var firstRow=[""].concat(currentComponents.slice(1).map(component => {
    if(component==330){
      var val=$("#hplus-select").val()
      if(val=="totalH"){
        return "c330";
      } else if(val=="pH"){
        return "f330";
      } else {
        return "a330";
      }
    } else if($("#CopyRowAddComponents").nextAll("[data-component="+component+"]").find("[type=checkbox]").is(":checked")){
      return "f"+component;
    } else {
      return "c"+component;
    }
  }));
  return [firstRow].concat(
    Array.from($("#species-list").children().not(".disabled").map(function(){
      return $(this).attr("data-species");
    })).map(species =>{
      if(species[0]=="c"){
        return firstRow.map((component, index) => {
          if(index==0){
            return species;
          }
          if(species.substr(1)==component.substr(1)){
            return "1";
          } else {
            return "0";
          }
        });
      }
      if(species[0]=="s"){
        return firstRow.map((component, index) => {
          if(index==0){
            if(gasesMap.has(species.substr(1))){
              return "g"+species.substr(1);
            } else if(solidsMap.has(species.substr(1))){
              return "z"+species.substr(1);
            } else {
              return species;
            }
          }
          var componentLoc=speciesMap.get(species.substr(1))[3].indexOf(component.substr(1));
          if(componentLoc==-1){
            return "0";
          } else {
            return speciesMap.get(species.substr(1))[2][componentLoc];
          }
        });
      }
    })).concat([firstRow.map((component, index) => {
      if(index==0){
        return "Total Concentrations";
      } else if(component.substr(1)==330){
        if($("#hplus-select").val()=="pH"){
          return prettyExp(Math.pow(10,-$("#hplus-input").val()));
        } else if($("#hplus-select").val()=="totalH"){
          return prettyExp($("#hplus-input").val())
        } else {
          return 0;
        }
      } else {
        return prettyExp($("#CopyRowAddComponents").nextAll("[data-component="+component.substr(1)+"]").find(".concentration-input").val());
      }
    })]);
}
function replaceSpeciesWithName(species){
  if(species[0]=="s" || species[0]=="z"){
    return speciesMap.get(species.substr(1))[0];
  } else if(species[0]=="c" || species[0]=="f" || species[0]=="a"){
    return componentsMap.get(species.substr(1))[0];
  }
  return species;
}

function toReadableTableau(tableau){
  tableau[0].forEach((component, index) => {
    if(component[0]=="f" || component[0]=="a"){
      tableau[tableau.length-1][index]="TBD";
    }
  });
  tableau=tableau.map((row, index) => {
    if(index==0){
      return row.concat(["logK"]);
    }
    if(index==tableau.length-1){
      return row.concat([""]);
    }
    if(row[0][0]=="c"){
      return row.concat(["0"]);
    }
    return row.concat([speciesMap.get(row[0].substr(1))[4]]);
  });
  console.log(tableau)
  tableau[0]=tableau[0].map(component => replaceSpeciesWithName(component));
  tableau.forEach(row => {
    row[0]=replaceSpeciesWithName(row[0]);
  });


  return tableau;
}

function customAlkalinityEqn(){
  var alkEqn="[";
  $("#CopyRowAlkEqn").nextAll().each(function() {
    alkEqn+='["'+$(this).attr("data-species")+'",'+$(this).find(".alk-factor-input").val()+"],";
  });
  alkEqn+="]";
  return alkEqn;
}

function getDataURIFromResult(result){
  var uri="data:application/octet-stream,Species%2CConcentration%0A";
  for(const arr in result){
    uri+=arr+"%2C"+prettyExpWithSigs(result[arr])+"%0A";
  }
  return uri;
}

var calculateMap=new Map();

var solverWorker=null;
var pythonBuffer="";

function handleResultEvent(e){
  $("#result-modal").attr("data-progress", "2");
  $("#result-loading").hide();
  if(e.data[1][1]){
    $("#result-modal .download-button").each(function(){
      $(this).prop("disabled", false);
    });
    $("#result-modal-scroller").show();
    $("#download-results").attr("href", getDataURIFromResult(e.data[1][0]));
    for(const species in e.data[1][0]){
      $("#result-modal-tbody").append('<tr><th scope="row">'+chemTextReplace(species)+'</th><td>'+prettyExpWithSigs(e.data[1][0][species])+'</td><td>'+(-Math.log10(e.data[1][0][species])).toFixed(2)+'</td></tr>');
    }
  } else {
    $("#result-failed").show();
  }
}

function startSolverWorker(){
  solverWorker=new Worker("assets/js/solverWorker.js");
  $("#result-modal").attr("data-progress", "0");
  $("#result-loading p").text("Loading Python...");
  solverWorker.onmessage=function(e){
    if(e.data[0]==1){
      if(pythonBuffer!=""){
        //console.log("heelo")
        solverWorker.postMessage(pythonBuffer)
        pythonBuffer="";
      }
      $("#result-modal").attr("data-progress", "1");
      $("#result-loading p").text("Calculating...");
    } else if(e.data[0]==2){
      handleResultEvent(e);
      calculateMap.set(e.data[2], e);
    }
  }
}
startSolverWorker();

async function calculate(){
  $("#result-modal .download-button").each(function(){
    $(this).prop("disabled", true);
  });
  $("#result-modal-tbody").empty();
  $("#result-loading").show();
  $("#result-modal-scroller").hide();
  $("#result-failed").hide();
  var tableau=createTableau();
  console.log(tableau);
  var args="[";
  tableau.forEach((itemi) => {
    args+="[";
    itemi.forEach((itemj) => {
      args+='"'+itemj+'",';
    });
    args+="],";
  });
  args+="], '''";
  tableau.forEach((row) => {
    if(row[0][0]=="c"){
      args+=componentsMap.get(row[0].substr(1))[2]
    }
  });
  args+="''','''"
  tableau.forEach((row) => {
    if(row[0][0]=="s" || row[0][0]=="z"){
      var nth=0;
      args+=speciesMap.get(row[0].substr(1))[5].replace(/(?:^|,)"?((?<=")[^"]*|[^,"]*)"?(?=,|$)/g, function (match, i, original) {
          nth++;
          return (nth === 4 && editedLogKMap.has(row[0].substr(1))) ? ","+editedLogKMap.get(row[0].substr(1)) : match;
      });
    }
  });
  args+="'''"
  if($("#hplus-select").val()=="Alkalinity"){
    args+=",alk="+$("#hplus-input").val()
  } else if($("#hplus-select").val()=="Other Alkalinity"){
    args+=",alk="+$("#hplus-input").val()
    args+=", alkEquation="+customAlkalinityEqn();
  }
  console.log(args)
  $("#result-modal").modal({
    keyboard: false,
    backdrop: "static",
  });
  var possibleEarlyResult=calculateMap.get(args);
  if(possibleEarlyResult!=undefined){
    console.log("shortcut");
    handleResultEvent(possibleEarlyResult);
    return;
  }
  if($("#result-modal").attr("data-progress")==0){
    pythonBuffer=args;
  } else {
    solverWorker.postMessage(args);
  }
}

function waitForVisible(element, callback) {
  if (!$(element).is(":visible")) {
    setTimeout(function() {
      window.requestAnimationFrame(function(){ waitForVisible(element, callback) });
    }, 50);
  }else {
    callback();
  }
};

function showTableau(){
  var rawTableau=createTableau();
  var readableTableau=toReadableTableau(rawTableau);

  var tableauElement = $("#view-tableau-modal").find(".tableau");
  var fitModal=tableauElement.closest(".fit-modal");

  fitModal.css("width", "min-content");
  tableauElement.css("table-layout", "auto");

  tableauElement.empty();
  var thead=$("<thead><tr></tr></thead>");
  var trthead=thead.children();
  readableTableau[0].forEach((component, index) => {
    var toAppend=$("<th scope='col'>"+chemTextReplace(component)+"</th>");
    if(index==0){
      toAppend.addClass("top-left");
    }
    trthead.append(toAppend);
  });

  var editSvg=`<svg class='logK-editor' style='float:right;margin-top:0.2rem' width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.39.242l-3 1a1 1 0 0 1-1.266-1.265l1-3a1 1 0 0 1 .242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"/>
    <path fill-rule="evenodd" d="M12.146 6.354l-2.5-2.5.708-.708 2.5 2.5-.707.708zM3 10v.5a.5.5 0 0 0 .5.5H4v.5a.5.5 0 0 0 .5.5H5v.5a.5.5 0 0 0 .5.5H6v-1.5a.5.5 0 0 0-.5-.5H5v-.5a.5.5 0 0 0-.5-.5H3z"/>
  </svg>`
  var resetSvg=`<svg class='logK-reset' style='float:right;margin-top:0.26rem' width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-counterclockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M12.83 6.706a5 5 0 0 0-7.103-3.16.5.5 0 1 1-.454-.892A6 6 0 1 1 2.545 5.5a.5.5 0 1 1 .91.417 5 5 0 1 0 9.375.789z"/>
    <path fill-rule="evenodd" d="M7.854.146a.5.5 0 0 0-.708 0l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 1 0 .708-.708L5.707 3 7.854.854a.5.5 0 0 0 0-.708z"/>
  </svg>`

  tableauElement.append(thead);
  var tbody=$("<tbody></tbody>");
  readableTableau.forEach( (itemi, indexi) => {
    if(indexi==0){
      return;
    }
    var tr=$("<tr data-species="+rawTableau[indexi][0]+"></tr>");
    if(indexi==1){
      tr.addClass("top");
    }
    itemi.forEach( (itemj, indexj) => {
      var toAppend=""
      if(indexj==0){
        toAppend=$("<th scope='row' style='vertical-align:middle;'>"+chemTextReplace(itemj)+"</th>");
      } else if(indexj==itemi.length-1 && indexi!=readableTableau.length-1 && rawTableau[indexi][0][0]!="c"){
        var hasBeenEdited=editedLogKMap.has(rawTableau[indexi][0].substr(1));
        var logKValue=hasBeenEdited ? editedLogKMap.get(rawTableau[indexi][0].substr(1)) : itemj;
        toAppend="<td><div class='d-flex'><div class='centering-div'></div><span class='mx-1'>"+Number(logKValue).toFixed(2)+"</span><div class='centering-div'>"+(hasBeenEdited ? resetSvg : editSvg)+"</div></div></td>"
      } else {
        toAppend=$("<td  style='vertical-align:middle;'>"+itemj+"</td>");
      }
      if(indexj==1 && indexi==1){
        toAppend.addClass("left");
      }
      tr.append(toAppend);
    });
    tbody.append(tr);
  });
  var resetFunction=function(e){
    var species=$(e.target).closest("tr").attr("data-species").substr(1);
    editedLogKMap.delete(species);
    var editLocation=$(e.target).closest("td").children().first();
    editLocation.empty();
    editLocation.append("<div class='centering-div'></div><span class='mx-1'>"+Number(speciesMap.get(species)[4]).toFixed(2)+"</span><div class='centering-div'>"+editSvg+"</div>");
    editLocation.find(".logK-editor").click(logKEditorFunction);
  }
  var logKEditorFunction=function(e){
    var editLocation=$(e.target).closest("td").children().first();
    editLocation.empty();
    var editBox=$('<input type="number" class="mb-0 text-center form-control">');
    editBox.keydown(function(e){
      if(e.keyCode==13){
        $(this).blur();
      }
    })
    editBox.blur(function(e){
      if($(e.target).val()){
        editedLogKMap.set($(e.target).closest("tr").attr("data-species").substr(1), $(e.target).val());
        $(e.target).parent().append("<div class='centering-div'></div><span class='mx-1'>"+Number($(e.target).val()).toFixed(2)+"</span><div class='centering-div'>"+resetSvg+"</div>");
        $(e.target).parent().find(".logK-reset").click(resetFunction);
      } else {
        resetFunction(e);
      }
      $(e.target).remove();
    });
    editLocation.append(editBox);
    editBox.focus();
  }
  tbody.find(".logK-editor").click(logKEditorFunction);
  tbody.find(".logK-reset").click(resetFunction);
  tableauElement.append(tbody);
  waitForVisible(tableauElement, function(){
    var topLeft=tableauElement.find(".top-left");
    var otherRows=topLeft.nextAll();
    topLeft.width(Math.ceil(topLeft.width()/10)*10);
    otherRows.width(Math.max(...otherRows.map(function(){return $(this).width()})));
    tableauElement.css("table-layout", "fixed");
    fitModal.css("width", "min(100%, "+tableauElement.width()+"px + 8px + 2rem");
    tableauElement.parent().attr("data-vert-scroll-start-offset", topLeft.outerHeight()+"px");
    tableauElement.parent().attr("data-horiz-scroll-start-offset", topLeft.outerWidth()+"px");
    updateStickyScrollbarsSize($(".sticky-scroll")[0]);
  });
}

function onSpeciesCheckClick(element){
  if(element.checked){
    var actualElement=$(element).closest(".list-group-item");
    actualElement.removeClass("disabled");
    var completeSpeciesValue=$(actualElement).attr("data-species");
    var speciesValue=completeSpeciesValue.substr(1);
    if(completeSpeciesValue[0]=="s" && solidsMap.has(speciesValue)){
      var speciesList=speciesMap.get(speciesValue)[3]
      solidsMap.forEach((value, key) => {
        if(key!=speciesValue && speciesArraysEqual(speciesMap.get(key)[3], speciesList)){
          //console.log("[data-species='s"+key+"']")
          $("#species-list").children("[data-species='s"+key+"']").find(".species-check").prop("disabled", true)
        }
      });
      if($("#hplus-select").val()=="Alkalinity" || $("#hplus-select").val()=="Other Alkalinity"){
        actualElement.css("background", "#FFC107")
      }
    }
  } else {
    var actualElement=$(element).closest(".list-group-item");
    $(actualElement).addClass("disabled");
    var completeSpeciesValue=$(actualElement).attr("data-species");
    var speciesValue=completeSpeciesValue.substr(1);
    if(completeSpeciesValue[0]=="s" && solidsMap.has(speciesValue)){
      var speciesList=speciesMap.get(speciesValue)[3]
      solidsMap.forEach((value, key) => {
        if(key!=speciesValue && speciesArraysEqual(speciesMap.get(key)[3], speciesList)){
          //console.log("[data-species='s"+key+"']")
          $("#species-list").children("[data-species='s"+key+"']").find(".species-check").prop("disabled", false)
        }
        if($("#hplus-select").val()=="Alkalinity" || $("#hplus-select").val()=="Other Alkalinity"){
          actualElement.css("background", "")
        }
      });
    }
  }
}

function updateSpeciesInModal(){
  $("#species-modal").find(".modal-body").empty();
  $("#species-modal").find(".modal-body").append($("#species-list").clone().attr("id", "species-list-modal"));
  $("#species-modal").find(".modal-body").find(".species-check").click(function(event){
    onSpeciesCheckClick(this);
  });
}
function saveModalChangesToList(){
  $("#species-list").replaceWith($("#species-list-modal").clone().attr("id", "species-list"));
}

function scrollToNext(table, deltaX, deltaY) {
  var left=table.find(".left");
  var allLeftElements=left.parent().children().slice(1);
  var horizScroll=Number(table.attr("data-horizScroll"))+deltaX;
  var offsetHorizArr=allLeftElements.map(function(){
    return this.offsetLeft-left[0].offsetLeft;
  });
  if(horizScroll<=0){
    horizScroll=0;
    table[0].scrollLeft=horizScroll;
  } else if(horizScroll>=table[0].scrollWidth-table[0].clientWidth){
    horizScroll=table[0].scrollWidth-table[0].clientWidth;
    table[0].scrollLeft=horizScroll;
  } else {
    for(var i=0; i<offsetHorizArr.length; i++){
      if(horizScroll<offsetHorizArr[i]){
        table[0].scrollLeft=offsetHorizArr[i-1];
        break;
      }
    }
  }
  table.attr("data-horizScroll", horizScroll);

  var top=table.find(".top")
  var allTopElements=top.parent().children().slice(1);
  var vertScroll=Number(table.attr("data-vertScroll"))+deltaY;
  var offsetVertArr=allTopElements.map(function(){
    return this.offsetTop-top[0].offsetTop;
  });
  if(vertScroll<=0){
    vertScroll=0;
    table[0].scrolTop=vertScroll;
  } if(vertScroll>=table[0].scrollHeight-table[0].clientHeight){
    vertScroll=table[0].scrollHeight-table[0].clientHeight;
    table[0].scrollTop=vertScroll;
  } else {
    for(var i=0; i<offsetVertArr.length; i++){
      if(vertScroll<offsetVertArr[i]){
        table[0].scrollTop=offsetVertArr[i-1];
        break;
      }
    }
  }

  table.attr("data-vertScroll", vertScroll);
  updateStickyScrollbarsPosition(table[0])
}

function updateStickyScrollbarsSize(stickyScroll){
  var horiz=stickyScroll.clientWidth<stickyScroll.scrollWidth;
  var vert=stickyScroll.clientHeight<stickyScroll.scrollHeight;

  var scrollBarVert=$(stickyScroll).siblings(".sticky-scroll-scrollbar-vert");
  var scrollBarHoriz=$(stickyScroll).parent().siblings(".sticky-scroll-scrollbar-horiz")

  var vertScrollOffset=$(stickyScroll).attr("data-vert-scroll-start-offset") ? $(stickyScroll).attr("data-vert-scroll-start-offset") : 0;
  var horizScrollOffset=$(stickyScroll).attr("data-horiz-scroll-start-offset") ? $(stickyScroll).attr("data-horiz-scroll-start-offset") : 0;


  if(horiz && vert){
    $(stickyScroll).css("width", "calc(100% - 5px)");
    scrollBarVert.css("min-height", "calc(100% - "+vertScrollOffset+")");
    scrollBarVert.css("margin-top", vertScrollOffset);
    scrollBarVert.children().css("height", "max(calc("+(stickyScroll.clientHeight/stickyScroll.scrollHeight)+" * 100%), 50px )");
    scrollBarVert.show();
    scrollBarHoriz.show();
    scrollBarHoriz.css("width", "calc(100% - 5px - "+horizScrollOffset+")");
    scrollBarHoriz.children().css("width", "max(calc("+(stickyScroll.clientWidth/stickyScroll.scrollWidth)+" * 100%), 50px )");
    scrollBarHoriz.css("margin-left", horizScrollOffset);

  } else if(vert) {
    $(stickyScroll).css("width", "calc(100% - 5px)");
    scrollBarVert.css("min-height", "calc(100% - "+vertScrollOffset+")");
    scrollBarVert.css("margin-top", vertScrollOffset);
    scrollBarVert.children().css("height", "max(calc("+(stickyScroll.clientHeight/stickyScroll.scrollHeight)+" * 100%), 50px )");
    scrollBarVert.show();
    scrollBarHoriz.hide()
  } else if(horiz) {
    $(".sticky-scroll").css("width", "100%");
    scrollBarHoriz.css("width", "calc(100% - "+horizScrollOffset+")");
    scrollBarHoriz.css("margin-left", horizScrollOffset);
    scrollBarHoriz.children().css("width", "max(calc("+(stickyScroll.clientWidth/stickyScroll.scrollWidth)+" * 100%), 50px )");
    scrollBarVert.hide();
    scrollBarHoriz.show()
  } else {
    $(".sticky-scroll").css("width", "100%");
    scrollBarVert.hide();
    scrollBarHoriz.hide()
  }
}

function updateStickyScrollbarsPosition(stickyScroll){
  var scrollBarVert=$(stickyScroll).siblings(".sticky-scroll-scrollbar-vert");
  var scrollBarHoriz=$(stickyScroll).parent().siblings(".sticky-scroll-scrollbar-horiz")

  var scrollBarBarVert=scrollBarVert.children();
  var scrollBarBarHoriz=scrollBarHoriz.children();
  scrollBarBarVert.css("margin-top", (scrollBarVert.height()-scrollBarBarVert.height())*stickyScroll.scrollTop/(stickyScroll.scrollHeight-stickyScroll.clientHeight));
  scrollBarBarHoriz.css("margin-left", (scrollBarHoriz.width()-scrollBarBarHoriz.width())*stickyScroll.scrollLeft/(stickyScroll.scrollWidth-stickyScroll.clientWidth));

}

const downKeys = {40: 1, 34 : 1};
const upKeys= {38 : 1, 33 : 1}
const leftKeys= {37 : 1}
const rightKeys= {39 : 1}
const otherKeys={32 : 1, 35 : 1, 36 : 1}

function preventDefault(e){
  e.preventDefault();
}

function stickyScrollMouse(e) {
  scrollToNext($(this), e.deltaX, e.deltaY);
  preventDefault(e)
}

function stickyScrollTouchStartOrMove(e) {
  var lastTouchX=$(this).attr("data-lastTouchX");
  var lastTouchY=$(this).attr("data-lastTouchY");
  if(lastTouchX && lastTouchY){
    scrollToNext($(this), -(e.changedTouches[0].clientX-lastTouchX), -(e.changedTouches[0].clientY-lastTouchY));
  }
  $(this).attr("data-lastTouchX", e.changedTouches[0].clientX);
  $(this).attr("data-lastTouchY", e.changedTouches[0].clientY);
  preventDefault(e);
}
function stickyScrollTouchEnd(e){
  $(this).removeAttr("lastTouchX");
  $(this).removeAttr("lastTouchY");
}

function onReady(){
  $("#selectpicker-component").change(function(){
    var toAddVal=$(this).selectpicker('val');
    var toAdd=componentsMap.get(toAddVal)[0];
    var newRow=$("#CopyRowAddComponents").clone();

    addSpecies(toAddVal);

    $(newRow).html($(newRow).html().replace(/PLACEHOLDER/g, chemTextReplace(toAdd)));
    $(newRow).removeAttr("id");
    $(newRow).removeAttr("hidden");
    $(newRow).attr("data-component", toAddVal);

    $(newRow).find(".close-concentration").click({param1: toAddVal},function(event){
      pasteUndo=[]
      var toAdd=$(this).closest(".component-input").attr("data-component");
      $("#selectpicker-component").children(":contains('"+componentsMap.get(event.data.param1)[0]+"')").show();
      $("#selectpicker-component").selectpicker('refresh');
      $(this).closest(".component-input").remove();
      $("#species-list").children().each(function(){
        if($(this).attr("data-species")[0]=="s"){
          if(speciesMap.get($(this).attr("data-species").substr(1))[3].indexOf(event.data.param1)!=-1){
            $(this).remove();
          }
        } else if($(this).attr("data-species").substr(1)==event.data.param1){
          $(this).remove();
          currentComponents.remove(toAdd);
        }
      });
      adjustWidthToTargets();
    });

    $(newRow).find(".concentration-input").on("paste", (event2) => {
      pasteUndo=$("#CopyRowAddComponents").nextAll().find(".concentration-input").map(function(){
        return $(this).val();
      });
      var splitValues=(event2.clipboardData || window.clipboardData || event2.originalEvent.clipboardData).getData("text").split(/[\r\n|\n|\t]/).filter(function(el) { return el!=""; });
      $(event2.target).val(splitValues[0]);
      var i=1;
      $(event2.target).closest(".component-input").nextAll().find(".concentration-input").each(function(){
        $(this).val(splitValues[i]);
        i+=1;
      });
      event.preventDefault();
    });

    $(".species-check").click(function(event){
      onSpeciesCheckClick(this);
    });

    $("#component-rows").append(newRow);

    adjustWidthToTargets();

    $(this).children(":contains('"+toAdd+"')").hide();
    $(this).selectpicker('val', '');
    $(this).selectpicker('refresh');
  });


  $("#selectpicker-edit-alkalinity").change(function(){
    var toAddVal=$(this).selectpicker('val');
    var toAdd=toAddVal[0]=="c" ? componentsMap.get(toAddVal.substr(1))[0] : speciesMap.get(toAddVal.substr(1))[0];
    var newRow=$("#CopyRowAlkEqn").clone();

    $(newRow).html($(newRow).html().replace(/PLACEHOLDER/g, chemTextReplace(toAdd)));
    $(newRow).removeAttr("id");
    $(newRow).removeAttr("hidden");
    $(newRow).attr("data-species", toAddVal);

    $(newRow).find(".remove-alk-species").click(function(event){
      $("#selectpicker-edit-alkalinity").children("[value='"+$(this).closest(".alk-species").attr("data-species")+"']").show();
      $(this).closest(".alk-species").remove();
      $("#selectpicker-edit-alkalinity").selectpicker("refresh");
    });

    $("#alk-eqn-container").append(newRow);

    $(this).children(":contains('"+toAdd+"')").hide();
    $(this).selectpicker('val', '');
    $(this).selectpicker('refresh');
  });
  $(".remove-alk-species").click(function(event){
    $("#selectpicker-edit-alkalinity").children("[value='"+$(this).closest(".alk-species").attr("data-species")+"']").show();
    $(this).closest(".alk-species").remove();
    $("#selectpicker-edit-alkalinity").selectpicker("refresh");
  });

  $("#species-modal-opener").click(updateSpeciesInModal);
  $("#species-modal").find("[data-dismiss=modal]").click(saveModalChangesToList);
  $(".tableau-opener").click(showTableau);
  $(".sticky-scroll").attr({
    "data-horizScroll" : "0",
    "data-vertScroll" : "0",
    "data-currentHorizElementNumber" : "0",
    "data-currentVertElementNumber" : "0"
  });
  var supportsPassive = false;
  try {
    window[0].addEventListener("test", null, Object.defineProperty({}, 'passive', {
      get: function () { supportsPassive = true; }
    }));
  } catch(e) {}

  var wheelOpt = supportsPassive ? { passive: false } : false;
  var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
  if($(".sticky-scroll")[0]){
    $(".sticky-scroll")[0].addEventListener(wheelEvent, stickyScrollMouse, wheelOpt); // modern desktop
    $(".sticky-scroll")[0].addEventListener('touchmove', stickyScrollTouchStartOrMove, wheelOpt); // mobile
    $(".sticky-scroll")[0].addEventListener('touchstart', stickyScrollTouchStartOrMove, wheelOpt); // mobile
    $(".sticky-scroll")[0].addEventListener('touchend', stickyScrollTouchEnd, wheelOpt); // mobile

    updateStickyScrollbarsSize($(".sticky-scroll")[0]);
  }

  $("#calculate-button").tooltip('disable');

  addComponents();
  chemTextReplaces();
  adjustWidthToTargets();
  adjustDontOverflows();
  $("#hplus-select").change(function(){
    var val=$(this).val();
    if(val=="pH"){
      $("#hplus-fixed").prop("checked", true);
    } else {
      $("#hplus-fixed").prop("checked", false);
    }
    if($("#hplus-select").val() =="Alkalinity" || $("#hplus-select").val()=="Other Alkalinity"){
      $("#species-list").children("[data-species^=s]").each(function(){
        if($(this).find("input:checkbox:checked").length && solidsMap.has($(this).attr("data-species").substr(1))){
          $(this).css("background", "#FFC107");
        }
      })
    } else {
      $("#species-list").children().css("background", "")
    }
  });
  $(function() {
    $('[data-toggle="tooltip"]').tooltip({
      container: "body"
    });
  });
  $("#result-modal").find("[data-dismiss='modal']").click(function(e){
    pythonBuffer=""
    if($("#result-modal").attr("data-progress")==1){
      solverWorker.terminate();
      startSolverWorker();
    } else if($("#result-modal").attr("data-progress")==2){
      $("#result-modal").attr("data-progress", 1);
    }
  });

  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(function(mutations, observer) {
    if($(mutations[0].target).find(".alkalinity-edit").length>0){
      $(".alkalinity-edit").click(function(e){
        $('#edit-alkalinity-modal').modal({
          keyboard : false,
          backdrop : "static"
        })
        e.stopPropagation();
      });
    }
  });
  observer.observe(document.getElementById("hplus-select").parentElement, {
    childList: true,
    subtree: true
  });

  $(window).resize(function(){
    adjustDontOverflows();
    adjustWidthToTargets();
    if($("#species-modal").is(":visible") && window.innerWidth>=768){
      saveModalChangesToList();
      $("#species-modal").modal("hide")
    }
  });


  $(document).keydown(function(event) {
    if (!(event.metaKey || event.ctrlKey) || event.keyCode != 90) {
      return;
    }
    if(pasteUndo.length!=0){
      var i=0;
      $("#CopyRowAddComponents").nextAll().find(".concentration-input").each(function(){
        $(this).val(pasteUndo[i]);
        i+=1;
      });
      pasteUndo=[];
    }
  });
  $(".selectpicker-delay").selectpicker();
}

var documentReady=false;

$( document ).ready(function(){
  documentReady=true;
});

var csvStringPromises  = Promise.all([
  fetch("assets/solver/comp.vdb").then(function(response){
    return response.text();
  }),
  fetch("assets/solver/thermo.vdb").then(function(response){
    return response.text();
  }),
  fetch("assets/solver/type6.vdb").then(function(response){
    return response.text();
  }),
  fetch("assets/solver/gases.vdb").then(function(response){
    return response.text();
  }),
]);


async function prepareDocument(){
  let [componentsCSVString, speciesCSVString, solidsCSVString, gasesCSVString] = await csvStringPromises;
  componentsCSVString.trim().split("\n").filter((item) => {return !item.match(/^0,/m);}).forEach((item) => {
    var match=Array.from(item.matchAll(/(?:^|,)"?((?<=")[^"]*|[^,"]*)"?(?=,|$)/g));
    componentsMap.set(match[0][1], [match[1][1], match[5][1], item]);
  });
  Array.from(speciesCSVString.trim().matchAll(/(.+?)\r?\n(.+?)\r?\n(.+?)\r?\n/g)).filter((item) => {return !item[0].match(/^0,/m);}).forEach((item) => {
    var line1=Array.from(item[1].matchAll(/(?:^|,)"?((?<=")[^"]*|[^,"]*)"?(?=,|$)/g));
    var line2=Array.from(item[2].matchAll(/(?:^|,)"?((?<=")[^"]*|[^,"]*)"?(?=,|$)/g));
    var line3=Array.from(item[3].matchAll(/(?:^|,)"?((?<=")[^"]*|[^,"]*)"?(?=,|$)/g));
    speciesMap.set(line1[0][1], [line1[1][1], line3[0][1], line2.filter((item, i) => {return i%2==0;}).map((item) => {return item[1]}),line2.filter((item, i) => {return i%2==1;}).map((item) => {return item[1]}), line1[3][1], item[0]]);
  });
  Array.from(gasesCSVString.trim().matchAll(/(.+?)\r?\n(.+?)\r?\n(.+?)\r?\n/g)).filter((item) => {return !item[0].match(/^0,/m);}).forEach((item) => {
    var line1=Array.from(item[1].matchAll(/(?:^|,)"?((?<=")[^"]*|[^,"]*)"?(?=,|$)/g));
    gasesMap.set(line1[0][1], true);
  });
  Array.from(solidsCSVString.trim().matchAll(/(.+?)\r?\n(.+?)\r?\n(.+?)\r?\n/g)).filter((item) => {return !item[0].match(/^0,/m);}).forEach((item) => {
    var line1=Array.from(item[1].matchAll(/(?:^|,)"?((?<=")[^"]*|[^,"]*)"?(?=,|$)/g));
    if(!gasesMap.has(line1[0][1])){
      solidsMap.set(line1[0][1], true);
    }
  });
  //console.log(solidsMap)
  //console.log(gasesMap)
  console.log(componentsMap)
  console.log(speciesMap)
  if(documentReady){
    onReady();
  } else {
    $( document ).ready(function(){
      onReady();
    });
  }
}
prepareDocument();


var myDefaultWhiteList = $.fn.selectpicker.Constructor.DEFAULTS.whiteList;
myDefaultWhiteList.button = ["type"];

$( document ).ready(function(){
  $('.selectpicker-delay').last().on('rendered.bs.select', function (e) {
    $("#loading-cover").hide();
  });
});
