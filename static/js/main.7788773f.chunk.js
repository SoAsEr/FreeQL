(this.webpackJsonpfreeql=this.webpackJsonpfreeql||[]).push([[1],{107:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));var a=n(0),r=n.n(a),c=function(e){return function(t){var n=t.label;return r.a.createElement(e,null,n)}}},116:function(e,t,n){e.exports=n(161)},121:function(e,t,n){},122:function(e,t,n){},145:function(e,t){},147:function(e,t){},161:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),c=n(14),l=n.n(c),o=(n(121),n(7)),s=(n(122),n(60)),u=n(61),i=n(36),m=n(18),f=n(12),d=n(83),b=n(53),p=r.a.forwardRef((function(e,t){return r.a.createElement("div",{ref:t,className:"prevent-margin-collapse"},[e.children])})),h=n(10),v=n(111),E=n(41),g=n.n(E),O=n(8),j=n(85),w=n(91),k=n.n(w),y=function(){var e=Object(a.useState)({width:void 0,height:void 0}),t=Object(o.a)(e,2),n=t[0],r=t[1];return Object(a.useEffect)((function(){var e=function(){r({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",e),e(),function(){return window.removeEventListener("resize",e)}}),[]),n};function C(e){var t,n="pending",a=e.then((function(e){n="success",t=e}),(function(e){n="error",t=e}));return function(){if("pending"===n)throw a;if("error"===n)throw t;if("success"===n)return t}}var S=function(e,t){var n=Object(a.useState)({current:null}),r=Object(o.a)(n,2),c=r[0],l=r[1],s=Object(a.useState)(!!t),u=Object(o.a)(s,2),i=u[0],m=u[1],f=Object(a.useCallback)((function(t){m(!0),l({current:C(e(t).then((function(e){return m(!1),e})))})}),[l,e]),d=Object(a.useMemo)((function(){return c.current||!t?c.current:function(){throw new Promise((function(){}))}}),[c]);return Object(a.useEffect)((function(){t&&f(t)}),[]),[d,f,i]},N=n(112),x=n(48),M=n(113),P=n.n(M),q=function(e){return new Promise((function(t){return P()(e,{relax_column_count:!0},(function(e,n){t(n,e)}))}))},H=n(75),B=function(e,t,n){return e[t[n].row][t[n].column]},L=function(e,t,n,a){return e[t[n].row][t[n].column+a*t[n].stride]},F=function(e){var t=e.url,n=e.options,a=e.type,r=e.callback;if(console.log({url:t,options:n,type:a,callback:r}),"link"===a)return fetch(t).then((function(e){return e.text()})).then((function(e){return q(e)})).then((function(e){return Object(H.chunk)(e,n.linesPerItem)})).then((function(e){return{hPlusValue:n.hPlusValue,waterValue:n.waterValue,components:O.OrderedMap(e.filter((function(e){return Number(B(e,n,"id"))})).map((function(e){return[Number(B(e,n,"id")),{name:B(e,n,"name"),charge:Number(B(e,n,"charge"))}]})))}})).then((function(e){if(!r)return e;var t=r(e);return t instanceof Promise?t.then((function(t){return e})):e}))},R=function(e){var t=e.url,n=e.options,a=e.type,r=e.callback;if(console.log({url:t,options:n,type:a,callback:r}),"link"===a)return Promise.all([t].concat(Object(x.a)(n.labels.urls)).map((function(e){return fetch(e)}))).then((function(e){return Promise.all(e.map((function(e){return e.text().then((function(e){return q(e)}))})))})).then((function(e){var t=Object(N.a)(e),a=t[0],r=t.slice(1).map((function(e){return Object(H.chunk)(e,n.linesPerItem)})).map((function(e){return e.map((function(e){return B(e,n.labels,"id")}))})),c=O.Map().withMutations((function(e){var t,a=Object(h.a)(r.entries());try{for(a.s();!(t=a.n()).done;){var c,l=Object(o.a)(t.value,2),s=l[0],u=l[1],i=Object(h.a)(u);try{for(i.s();!(c=i.n()).done;){var m=c.value;e.set(Number(m),n.labels.labelMap[s])}}catch(f){i.e(f)}finally{i.f()}}}catch(f){a.e(f)}finally{a.f()}})),l=Object(H.chunk)(a,n.linesPerItem).filter((function(e){return Number(e[0][0])})),s={aqs:{species:O.OrderedMap(),componentToSpecies:O.Map()},solids:{species:O.OrderedMap(),componentToSpecies:O.Map()},gases:{species:O.OrderedMap(),componentToSpecies:O.Map()}};return s.aqs.species=s.aqs.species.withMutations((function(e){s.solids.species=s.solids.species.withMutations((function(t){s.gases.species=s.gases.species.withMutations((function(a){var r,o={aqSpecies:e,solidSpecies:t,gasSpecies:a},s=Object(h.a)(l);try{var u=function(){var e,t,a=r.value,l=Number(B(a,n,"id")),s=(null!==(e=c.get(l))&&void 0!==e?e:"aq")+"Species";o[s].set(l,{name:B(a,n,"name"),charge:Number(B(a,n,"charge")),logK:Number(B(a,n,"logK")),label:null!==(t=c.get(Number(B(a,n,"id"))))&&void 0!==t?t:0,components:O.Map().withMutations((function(e){for(var t=0;t<B(a,n,"numComponents");++t){var r=Number(L(a,n,"components",t)),c=Number(L(a,n,"componentAmts",t));e.set(r,c)}}))})};for(s.s();!(r=s.n()).done;)u()}catch(i){s.e(i)}finally{s.f()}}))}))})),s.aqs.componentToSpecies=s.aqs.componentToSpecies.withMutations((function(e){var t,n=Object(h.a)(s.aqs.species);try{var a=function(){var n,a=Object(o.a)(t.value,2),r=a[0],c=a[1].components,l=Object(h.a)(c);try{for(l.s();!(n=l.n()).done;){var s=Object(o.a)(n.value,1)[0];e.update(s,(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:O.Set();return e.add(r)}))}}catch(u){l.e(u)}finally{l.f()}};for(n.s();!(t=n.n()).done;)a()}catch(r){n.e(r)}finally{n.f()}})),s.solids.componentToSpecies=s.solids.componentToSpecies.withMutations((function(e){var t,n=Object(h.a)(s.solids.species);try{var a=function(){var n,a=Object(o.a)(t.value,2),r=a[0],c=a[1].components,l=Object(h.a)(c);try{for(l.s();!(n=l.n()).done;){var s=Object(o.a)(n.value,1)[0];e.update(s,(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:O.Set();return e.add(r)}))}}catch(u){l.e(u)}finally{l.f()}};for(n.s();!(t=n.n()).done;)a()}catch(r){n.e(r)}finally{n.f()}})),s.gases.componentToSpecies=s.gases.componentToSpecies.withMutations((function(e){var t,n=Object(h.a)(s.gases.species);try{var a=function(){var n,a=Object(o.a)(t.value,2),r=a[0],c=a[1].components,l=Object(h.a)(c);try{for(l.s();!(n=l.n()).done;){var s=Object(o.a)(n.value,1)[0];e.update(s,(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:O.Set();return e.add(r)}))}}catch(u){l.e(u)}finally{l.f()}};for(n.s();!(t=n.n()).done;)a()}catch(r){n.e(r)}finally{n.f()}})),s})).then((function(e){if(!r)return e;var t=r(e);return t instanceof Promise?t.then((function(t){return e})):e}))},V=n(56),A=n(108),T=r.a.memo((function(e){return r.a.createElement(r.a.Fragment,null,Array.from(e.children.matchAll(/([^_^]+)(?:\^(.)|_(.))?/g)).map((function(t){return r.a.createElement(r.a.Fragment,{key:e.children.substring(0,t.index)},t[1],r.a.createElement("sup",null,t[2]),r.a.createElement("sub",null,t[3]))})))})),I=n(107),z=n(74),D=n(71),_={singleValue:function(e){return Object(V.a)(Object(V.a)({},e),{},{width:"100%",textAlign:"center"})},option:function(e){return Object(V.a)(Object(V.a)({},e),{},{width:"100%",textAlign:"center"})}},W=r.a.memo((function(e){var t=e.hPlusOptionsRef,n=e.defaultVal,a=e.onChange;return r.a.createElement(m.a,{className:"mt-4 mb-3"},r.a.createElement(f.a,{xs:"3",sm:"5",className:"center-items"},r.a.createElement("label",{className:"w-100 d-none d-sm-block text-muted text-center"},"Components"),r.a.createElement("label",{className:"w-100 d-block d-sm-none text-muted text-center"},"Comp.")),r.a.createElement(f.a,{xs:"7",sm:"5"},r.a.createElement(A.default,{isSearchable:!1,options:t.current,formatOptionLabel:Object(I.a)(T),styles:_,onChange:a,value:n})),r.a.createElement(f.a,{xs:"2",className:"center-items"},r.a.createElement(z.a,{placement:"bottom",overlay:r.a.createElement(D.a,null,"Equilibrium Concentration")},r.a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",height:"0.875rem",version:"1.1",id:"Layer_1",viewBox:"0 0 139 119.177",overflow:"visible",enableBackground:"new 0 0 139 119.177"},r.a.createElement("line",{fill:"none",stroke:"#000000",strokeWidth:"7",x1:"139",y1:"63.308",x2:"0",y2:"63.308"}),r.a.createElement("line",{fill:"none",stroke:"#000000",strokeWidth:"6",x1:"30.646",y1:"92.308",x2:"2.189",y2:"65.308"}),r.a.createElement("line",{fill:"none",stroke:"#000000",strokeWidth:"7",x1:"3",y1:"30.308",x2:"133",y2:"30.308"}),r.a.createElement("line",{fill:"none",stroke:"#000000",strokeWidth:"6",x1:"99.296",y1:"2.308",x2:"130.953",y2:"28.608"}),r.a.createElement("path",{fill:"none",stroke:"#FFFFFF",strokeWidth:"2",d:"M53,118.177c2.333,0,4.667,0,7,0"})))))})),Q=n(47),K=n(76),J=n(115),G=n(15),$=n(114),X=function(e,t){var n=Object(a.useState)({current:null}),r=Object(o.a)(n,2),c=r[0],l=r[1];return Object(a.useEffect)((function(){var n=new e(t);return l({current:$.a(n)}),function(){n.terminate()}}),[]),c.current},Y=function(){return new Worker(n.p+"static/js/CalculateResultWorker.17cd4896.worker.js")},U=function(){var e=Object(a.useState)(O.Stack()),t=Object(o.a)(e,2),n=t[0],r=t[1],c=n.peek(),l=Object(a.useCallback)((function(e){Array.isArray(e)?r(n.withMutations((function(t){var n,a=Object(h.a)(e);try{for(a.s();!(n=a.n()).done;){var r=n.value;t.peek()===r&&t.pop()}}catch(c){a.e(c)}finally{a.f()}}))):c===e&&r(n.pop())}),[r,c,n]),s=Object(a.useCallback)((function(e){r(n.push(e))}),[r,n]);return[c,s,l]},Z=r.a.lazy((function(){return Promise.all([n.e(0),n.e(11)]).then(n.bind(null,254))})),ee=r.a.lazy((function(){return n.e(8).then(n.bind(null,248))})),te=r.a.lazy((function(){return n.e(7).then(n.bind(null,249))})),ne=r.a.lazy((function(){return Promise.all([n.e(4),n.e(10)]).then(n.bind(null,250))})),ae=r.a.lazy((function(){return Promise.all([n.e(5),n.e(9)]).then(n.bind(null,251))})),re=r.a.lazy((function(){return n.e(12).then(n.bind(null,253))})),ce=r.a.lazy((function(){return Promise.all([n.e(0),n.e(6),n.e(13)]).then(n.bind(null,252))})),le=r.a.memo((function(e){return r.a.createElement("div",{style:{maxHeight:"calc(100vh - "+(e.headerHeight+e.footerHeight)+"px)",overflowY:"auto",width:"100%"}},r.a.createElement("div",{style:{overflowX:"hidden"}},r.a.createElement(p,null,r.a.createElement(i.a,{fluid:!0},e.children))))})),oe=r.a.memo((function(e){return r.a.createElement(m.a,{className:"mb-3",style:{height:"38px"}},r.a.createElement(f.a,{className:"center-items"},r.a.createElement(J.a,{animation:"border",role:"status"},r.a.createElement("span",{className:"sr-only"},"Loading..."))))})),se=r.a.memo((function(e){var t=e.calculateNewResult,n=e.disableMessage,a=e.onClick,c=Object(v.a)(e,["calculateNewResult","disableMessage","onClick"]),l=!!n(),o=r.a.createElement(Q.a,Object.assign({},c,{onClick:function(e){a(e),t()},disabled:l}),"Calculate");return l?r.a.createElement(z.a,{placement:"top",overlay:r.a.createElement(D.a,null,n())},r.a.createElement("div",{className:"disabled-button-wrapper"},o)):o})),ue=function(e,t){return O.OrderedSet().withMutations((function(n){console.log(e);var a,r=function(e,t){return O.Map().withMutations((function(n){var a,r=Object(h.a)(t);try{for(r.s();!(a=r.n()).done;){var c=a.value;if(e.has(c)){var l,o=Object(h.a)(e.get(c));try{for(o.s();!(l=o.n()).done;){var s=l.value;n.update(s,(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return e+1}))}}catch(u){o.e(u)}finally{o.f()}}}}catch(u){r.e(u)}finally{r.f()}}))}(e.componentToSpecies,t),c=Object(h.a)(e.species);try{for(c.s();!(a=c.n()).done;){var l=Object(o.a)(a.value,2),s=l[0],u=l[1];r.get(s)===u.components.size&&n.add(s)}}catch(i){c.e(i)}finally{c.f()}}))},ie=O.Map({equilChecked:!1,conc:""}),me=function(e){var t=Object(a.useRef)([{value:Object(a.unstable_useOpaqueIdentifier)(),label:"totalH"},{value:Object(a.unstable_useOpaqueIdentifier)(),label:"pH"},{value:Object(a.unstable_useOpaqueIdentifier)(),label:"Alkalinity^1"},{value:Object(a.unstable_useOpaqueIdentifier)(),label:"Other Alkalinity"}]),n=X(Y),c=Object(o.a)(t.current,4),l=c[0],s=c[1],u=(c[2],c[3],Object(a.useState)(l)),d=Object(o.a)(u,2),v=d[0],E=d[1],w=Object(a.useReducer)((function(e,t){switch(t.action){case"add":return e.withMutations((function(e){var n,a=Object(h.a)(t.value.components);try{for(a.s();!(n=a.n()).done;){var r=n.value;e.set(r,ie)}}catch(c){a.e(c)}finally{a.f()}}));case"remove":return e.removeAll(t.value.components);case"toggleEquilChecked":return e.updateIn([t.value.component,"equilChecked"],(function(e){return!e}));case"setConc":return e.setIn([t.value.component,"conc"],t.value.conc);default:throw new Error}}),O.Map()),C=Object(o.a)(w,2),N=C[0],x=C[1],M=Object(a.useCallback)((function(e,t){x({action:"setConc",value:{component:e,conc:t}})}),[x]),P=Object(a.useCallback)((function(e){x({action:"toggleEquilChecked",value:{component:e}})}),[x]),q=Object(a.useState)(O.OrderedSet()),H=Object(o.a)(q,2),B=H[0],L=H[1],V=Object(a.useCallback)((function(e){x({action:"add",value:{components:e}}),L(B.union(e))}),[B,L,x]),A=Object(a.useCallback)((function(e){x({action:"remove",value:{components:e}}),L(B.subtract(e))}),[B,L,x]),T=Object(a.useState)({aqs:O.OrderedSet(),solids:O.OrderedSet(),gases:O.OrderedSet()}),I=Object(o.a)(T,2),z=I[0],D=I[1],_=Object(a.useState)({aqs:O.Map(),solids:O.Map(),gases:O.Map()}),J=Object(o.a)(_,2),$=J[0],me=J[1],fe=S(F,{url:"/FreeQL/assets/defaultdb/comp.vdb",type:"link",options:{linesPerItem:1,id:{row:0,column:0},name:{row:0,column:1},charge:{row:0,column:2},hPlusValue:330,waterValue:2},callback:function(e){console.log(e),V([e.waterValue,e.hPlusValue])}}),de=Object(o.a)(fe,3),be=de[0],pe=(de[1],de[2]),he=S(R,function(e){return{url:"/FreeQL/assets/defaultdb/thermo.vdb",type:"link",options:{linesPerItem:3,id:{row:0,column:0},name:{row:0,column:1},charge:{row:0,column:6},logK:{row:0,column:3},numComponents:{row:0,column:10},components:{row:1,column:1,stride:2},componentAmts:{row:1,column:0,stride:2},labels:{urls:["/FreeQL/assets/defaultdb/type6.vdb","/FreeQL/assets/defaultdb/gases.vdb"],linesPerId:3,id:{row:0,column:0},labelMap:["solid","gas"]}},callback:e}}((function(e){console.log(e),D(k()(z,{aqs:{$set:O.Set(e.aqs.species.keys())}}))}))),ve=Object(o.a)(he,3),Ee=ve[0],ge=(ve[1],ve[2]),Oe=Object(a.useCallback)(g()((function(){return{aqs:ue(Ee().aqs,B),solids:ue(Ee().solids,B),gases:ue(Ee().gases,B)}})),[Ee,B]),je=Object(a.useCallback)(g()((function(){return{aqs:O.List(Oe().aqs.intersect(z.aqs)),solids:O.List(Oe().solids.intersect(z.solids)),gases:O.List(Oe().gases.intersect(z.gases))}})),[Oe,z]),we=Object(a.useState)(O.Map()),ke=Object(o.a)(we,2),ye=ke[0],Ce=(ke[1],S((function(){var e={speciesHere:je(),componentsPresent:O.List(B.delete(be().waterValue)),logKChanges:$,componentsInputState:N},t=O.fromJS(e);return ye.has(t)?ye.get(t):n.calculate(j.toJSON(e)).then((function(e){return j.fromJSON(e)})).catch((function(e){return e}))}))),Se=Object(o.a)(Ce,3),Ne=Se[0],xe=Se[1],Me=Se[2],Pe=Object(a.useCallback)(g()((function(){return Me?"Calculating...":pe||ge?"Getting Databases...":!!N.filter((function(e,t){return be().waterValue!==t&&B.has(t)})).find((function(e,t){return"number"!==typeof e.get("conc")}))&&"At least one component is empty or invalid"})),[be,N,B,pe,ge,Me]),qe=y(),He=Object(a.useState)(0),Be=Object(o.a)(He,2),Le=Be[0],Fe=Be[1],Re=qe.height>=700?54:0,Ve=Object(b.a)(Object(a.useCallback)((function(e){var t=e.height;Fe(t)}),[Fe])),Ae=U(),Te=Object(o.a)(Ae,3),Ie=Te[0],ze=Te[1],De=Te[2],_e=Object(a.useCallback)(g()((function(e){return function(){return ze(e)}})),[ze]),We=Object(a.useCallback)(g()((function(e){return function(){return De(e)}})),[De]),Qe=Object(a.useCallback)((function(e){v===s?(P(be().hPlusValue),M(be().hPlusValue,-Math.log10(N.get(be().hPlusValue).get("conc")))):e===s&&(P(be().hPlusValue),M(be().hPlusValue,Math.pow(10,-N.get(be().hPlusValue).get("conc")))),E(e)}),[E,M,v,be,N]);return r.a.createElement(K.a,null,r.a.createElement(i.a,{style:{height:"calc(100vh - "+(e.headerHeight+Le+e.footerHeight)+"px)"}},r.a.createElement(m.a,null,r.a.createElement(f.a,{className:"p-0"},r.a.createElement(le,{headerHeight:e.headerHeight,footerHeight:e.footerHeight+Le+Re},r.a.createElement(W,{hPlusOptionsRef:t,defaultVal:v,onChange:Qe}),r.a.createElement(a.Suspense,{fallback:r.a.createElement(oe,null)},r.a.createElement(ee,{pH:s===v,componentsDB:be,componentsInputState:N,updateConc:M})),r.a.createElement(m.a,null,r.a.createElement(f.a,{xs:"3",sm:"5",className:"center-items"},r.a.createElement("label",{className:"w-100 d-none d-sm-block text-muted text-center"},"Components"),r.a.createElement("label",{className:"w-100 d-block d-sm-none text-muted text-center"},"Comp.")),r.a.createElement(f.a,{xs:{span:7,offset:0},sm:{span:5,offset:0}},r.a.createElement("label",{className:"w-100 text-muted text-center"},"Total Conc."))),r.a.createElement("hr",{className:"mt-0 mb-3"}),r.a.createElement(a.Suspense,{fallback:r.a.createElement(oe,null)},r.a.createElement(te,{componentsDB:be,componentsPresent:B,toggleChecked:P,updateConc:M,removeComponents:A})),r.a.createElement(m.a,null,r.a.createElement(f.a,null,qe.height<700&&r.a.createElement("div",{className:"d-flex center-items w-100"},r.a.createElement(a.Suspense,{fallback:""},r.a.createElement(ne,{componentsPresent:B,componentsDB:be,addComponents:V,windowHeight:qe.height})))))),r.a.createElement(i.a,{fluid:!0},r.a.createElement(m.a,{className:"pt-3"},r.a.createElement(f.a,null,qe.height>=700&&r.a.createElement(a.Suspense,{fallback:""},r.a.createElement(ae,{componentsPresent:B,componentsDB:be,addComponents:V})))))),r.a.createElement(f.a,{xs:"4",className:"d-none d-md-flex p-0"},r.a.createElement(le,{headerHeight:e.headerHeight,footerHeight:e.footerHeight+Le},r.a.createElement(m.a,{className:"mt-4"},r.a.createElement(f.a,{className:"center-items"},r.a.createElement("h5",{className:"text-muted text-center"},"Species"))),r.a.createElement(a.Suspense,{fallback:r.a.createElement(oe,null)},r.a.createElement(re,{openTableauModal:_e("tableau"),speciesDB:Ee,componentsDB:be,componentsPresent:B,speciesEnabled:z,speciesCouldBePresent:Oe,setSpeciesEnabled:D})))))),r.a.createElement(p,{ref:Ve},r.a.createElement(i.a,null,r.a.createElement(K.a.Row,{className:"py-3"},r.a.createElement(f.a,{className:"d-none d-md-block"},r.a.createElement(se,{onClick:_e("results"),disableMessage:Pe,className:"w-100",variant:"primary",calculateNewResult:xe})),r.a.createElement(f.a,{className:"d-block d-md-none"},r.a.createElement(Q.a,{className:"w-100",variant:"primary",onClick:_e("species")},"Select Species"))))),r.a.createElement(G.a,{show:"species"===Ie,onHide:We("species"),backdrop:"static",scrollable:!0},r.a.createElement(G.a.Header,{closeButton:!0},"Species"),r.a.createElement(G.a.Body,null,r.a.createElement(a.Suspense,{fallback:r.a.createElement(oe,null)},r.a.createElement(re,{openTableauModal:_e("tableau"),speciesDB:Ee,componentsDB:be,componentsPresent:B,speciesEnabled:z,speciesCouldBePresent:Oe,setSpeciesEnabled:D}))),r.a.createElement(G.a.Footer,null,r.a.createElement(Q.a,{variant:"secondary",onClick:We("species")},"Close"),r.a.createElement(se,{onClick:_e("results"),disableMessage:Pe,className:"ml-auto",variant:"primary",calculateNewResult:xe}))),r.a.createElement(G.a,{size:"xl",show:"tableau"===Ie,onHide:We("tableau"),backdrop:"static"},r.a.createElement(G.a.Header,{closeButton:!0},r.a.createElement(G.a.Title,null,"Tableau")),r.a.createElement(G.a.Body,null,r.a.createElement(a.Suspense,{fallback:r.a.createElement(oe,null)},r.a.createElement(ce,{logKChanges:$,setLogKChanges:me,componentsPresent:B,componentsInputState:N,windowWidth:qe.width,speciesHere:je,speciesEnabled:z,speciesDB:Ee,componentsDB:be}))),r.a.createElement(G.a.Footer,null,r.a.createElement(Q.a,{variant:"secondary",onClick:We("tableau")},"Close"))),r.a.createElement(G.a,{size:"xl",show:"results"===Ie,onHide:We(["results","species"]),backdrop:"static",scrollable:!0},r.a.createElement(G.a.Header,{closeButton:!0},r.a.createElement(G.a.Title,null,"Results")),r.a.createElement(G.a.Body,null,r.a.createElement(a.Suspense,{fallback:r.a.createElement(oe,null)},r.a.createElement(Z,{currentResult:Ne}))),r.a.createElement(G.a.Footer,null,r.a.createElement(Q.a,{variant:"secondary",onClick:We(["results","species"])},"Close"))))};var fe=function(){var e=Object(a.useState)(0),t=Object(o.a)(e,2),n=t[0],c=t[1],l=Object(b.a)(Object(a.useCallback)((function(e){var t=e.height;c(t)}),[c])),h=Object(a.useState)(0),v=Object(o.a)(h,2),E=v[0],g=v[1],O=Object(b.a)(Object(a.useCallback)((function(e){var t=e.height;g(t)}),[g]));return r.a.createElement(r.a.Fragment,null,r.a.createElement(p,{ref:l},r.a.createElement(s.a,{expand:"sm",bg:"dark",variant:"dark"},r.a.createElement(d.a,{end:"sm"},r.a.createElement(s.a.Brand,{href:"/"},r.a.createElement("img",{src:"assets/img/logo.png",width:"65",alt:"FreeQL"}))),r.a.createElement(s.a.Brand,{href:"/"},"FreeQL"),r.a.createElement(d.a,{end:"sm"}),r.a.createElement(s.a.Collapse,{id:"navbarTogglerDemo02"},r.a.createElement(u.a,{className:"mr-auto",style:{fontSize:"1.025rem"}},r.a.createElement(u.a.Link,{href:"https://stephmorel8910.gitbook.io/freeql/",target:"_blank"},"Help"),r.a.createElement(u.a.Link,{href:"https://github.com/SoAsEr/FreeQL/blob/master/README.md",target:"_blank"},"README"),r.a.createElement(u.a.Link,{href:"https://github.com/SoAsEr/FreeQL/",target:"_blank"},"Github"))))),r.a.createElement(me,{headerHeight:n,footerHeight:E}),r.a.createElement(p,{ref:O},r.a.createElement("footer",{className:"bg-dark p-4 p-md-5 text-center"},r.a.createElement(i.a,null,r.a.createElement(m.a,null,r.a.createElement(f.a,null,r.a.createElement("span",{className:"text-light"},"Created by Stephane Morel")))))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var de=document.getElementById("root");l.a.unstable_createRoot(de).render(r.a.createElement(fe,null)),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},53:function(e,t,n){"use strict";var a=n(0),r=n(89);t.a=function(e){var t=Object(a.useRef)(new ResizeObserver((function(t){var n=t[0].target.getBoundingClientRect();e({width:n.width,height:n.height})})));return Object(r.b)(Object(a.useCallback)((function(e){t.current.observe(e)}),[t]),Object(a.useCallback)((function(e){t.current.unobserve(e)}),[t]),Object(a.useCallback)((function(){return e({width:0,height:0})}),[e]))}},83:function(e,t,n){"use strict";var a=n(0),r=n.n(a);t.a=function(e){return r.a.createElement("div",{className:"flex-"+(e.start?e.start+"-":"")+"grow-1 "+(e.end?"flex-"+e.end+"-grow-0":"")},e.children)}},89:function(e,t,n){"use strict";n.d(t,"b",(function(){return c})),n.d(t,"a",(function(){return l}));var a=n(10),r=n(0),c=function(e,t,n){var a=Object(r.useRef)(null);return Object(r.useCallback)((function(r){a.current&&t(a.current),r?e(r):n(),a.current=r}),[t,e,n])},l=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];var r=t.filter(Boolean);return r.length?0===r.length?r[0]:function(e){var t,n=Object(a.a)(r);try{for(n.s();!(t=n.n()).done;){var c=t.value;"function"===typeof c?c(e):c&&(c.current=e)}}catch(l){n.e(l)}finally{n.f()}}:null}}},[[116,2,3]]]);
//# sourceMappingURL=main.7788773f.chunk.js.map