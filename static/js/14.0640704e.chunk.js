(this.webpackJsonpfreeql=this.webpackJsonpfreeql||[]).push([[14],{255:function(e,t,a){"use strict";a.r(t);var n=a(156),r=a(96),u=a(0),o=a.n(u),c=a(22),l=a(69),i=a(1),s=a(2),p=a(3),d=a.n(p),m=(a(47),a(16)),f=a(4),b=a(45),g=a(43),h=a(5),v={variant:void 0,active:!1,disabled:!1},y=o.a.forwardRef((function(e,t){var a=e.bsPrefix,n=e.active,r=e.disabled,c=e.className,l=e.variant,p=e.action,m=e.as,b=e.eventKey,v=e.onClick,y=Object(s.a)(e,["bsPrefix","active","disabled","className","variant","action","as","eventKey","onClick"]);a=Object(f.a)(a,"list-group-item");var E=Object(u.useCallback)((function(e){if(r)return e.preventDefault(),void e.stopPropagation();v&&v(e)}),[r,v]);return o.a.createElement(g.a,Object(i.a)({ref:t},y,{eventKey:Object(h.b)(b,y.href),as:m||(p?y.href?"a":"button":"div"),onClick:E,className:d()(c,a,n&&"active",r&&"disabled",l&&a+"-"+l,p&&a+"-action")}))}));y.defaultProps=v,y.displayName="ListGroupItem";var E=y,O={variant:void 0,horizontal:void 0},F=o.a.forwardRef((function(e,t){var a,n=Object(m.a)(e,{activeKey:"onSelect"}),r=n.className,u=n.bsPrefix,c=n.variant,l=n.horizontal,p=n.as,g=void 0===p?"div":p,h=Object(s.a)(n,["className","bsPrefix","variant","horizontal","as"]),v=Object(f.a)(u,"list-group");return a=l?!0===l?"horizontal":"horizontal-"+l:null,o.a.createElement(b.a,Object(i.a)({ref:t},h,{as:g,className:d()(r,v,c&&v+"-"+c,a&&v+"-"+a)}))}));F.defaultProps=O,F.displayName="ListGroup",F.Item=E;var j=F,x=a(85),S=a(29),w=a(27),C=a(101),M=a.n(C),k=o.a.memo((function(e){var t=e.id,a=e.type,n=e.setSpecieEnabled,r=e.name,u=e.enabled,i=n?{onChange:function(e){return n(e,t,a)},disabled:!1}:{disabled:!0,readOnly:!0};return o.a.createElement(j.Item,{className:"d-flex",style:u?{}:{color:"#6c757d",backgroundColor:"#fff"}},o.a.createElement(c.a,{start:"lg"},o.a.createElement(x.a.Check,Object.assign({style:{pointerEvents:"auto"},checked:u},i))),o.a.createElement("span",{className:"m-auto d-lg-none"}),o.a.createElement(l.a,{className:"mx-2 mx-lg-0 text-right"},r),o.a.createElement(c.a,{start:"lg"}))})),N=o.a.memo((function(e){var t=e.componentsPresent,a=e.speciesEnabled,n=e.setSpeciesEnabled,c=e.speciesCouldBePresent,l=e.speciesDB,i=e.componentsDB,s=Object(u.useCallback)((function(e,t,u){e.target.checked?n(M()(a,Object(r.a)({},u,{$set:a[u].add(t)}))):n(M()(a,Object(r.a)({},u,{$set:a[u].delete(t)})))}),[n,a]);return o.a.createElement(j,null,t.delete(i().waterValue).map((function(e){return o.a.createElement(k,{key:e,id:e,enabled:!0,name:i().components.get(e).name})})),c().aqs.map((function(e){return o.a.createElement(k,{key:e,id:e,type:"aqs",enabled:a.aqs.includes(e),setSpecieEnabled:s,name:l().aqs.species.get(e).name})})),c().solids.map((function(e){return o.a.createElement(k,{key:e,id:e,type:"solids",enabled:a.solids.includes(e),setSpecieEnabled:s,name:l().solids.species.get(e).name})})),c().gases.map((function(e){return o.a.createElement(k,{key:e,id:e,type:"gases",enabled:a.gases.includes(e),setSpecieEnabled:s,name:l().gases.species.get(e).name})})))})),A=o.a.memo((function(e){var t=e.openTableauModal,a=e.disabled;return o.a.createElement("span",{onClick:t,style:{fontSize:"0.875rem"},className:a?"text-muted":"border-hover-underline"},"View Tableau",o.a.createElement("svg",{style:{marginBottom:"0.1rem"},className:"bi bi-chevron-double-right",width:"1em",height:"1em",viewBox:"0 0 16 16",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg"},o.a.createElement("path",{fillRule:"evenodd",d:"M3.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L9.293 8 3.646 2.354a.5.5 0 010-.708z",clipRule:"evenodd"}),o.a.createElement("path",{fillRule:"evenodd",d:"M7.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L13.293 8 7.646 2.354a.5.5 0 010-.708z",clipRule:"evenodd"})))})),P=o.a.memo((function(e){var t=e.openTableauModal,a=Object(n.a)(e,["openTableauModal"]);return o.a.createElement(o.a.Fragment,null,o.a.createElement(S.a,null,o.a.createElement(w.a,{className:"center-items"},o.a.createElement(A,{openTableauModal:t}))),o.a.createElement(S.a,null,o.a.createElement(w.a,null,o.a.createElement(N,a))))}));t.default=P},67:function(e,t,a){"use strict";function n(e){return(n="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e){return(r=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}a.d(t,"a",(function(){return i}));var u=a(68);var o=a(79);function c(e){var t="function"===typeof Map?new Map:void 0;return(c=function(e){if(null===e||(a=e,-1===Function.toString.call(a).indexOf("[native code]")))return e;var a;if("function"!==typeof e)throw new TypeError("Super expression must either be null or a function");if("undefined"!==typeof t){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return Object(o.a)(e,arguments,r(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),Object(u.a)(n,e)})(e)}function l(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Object(u.a)(e,t)}function i(e,t){i=function(e,t){return new o(e,void 0,t)};var a=c(RegExp),r=RegExp.prototype,u=new WeakMap;function o(e,t,n){var r=a.call(this,e,t);return u.set(r,n||u.get(e)),r}function s(e,t){var a=u.get(t);return Object.keys(a).reduce((function(t,n){return t[n]=e[a[n]],t}),Object.create(null))}return l(o,a),o.prototype.exec=function(e){var t=r.exec.call(this,e);return t&&(t.groups=s(t,this)),t},o.prototype[Symbol.replace]=function(e,t){if("string"===typeof t){var a=u.get(this);return r[Symbol.replace].call(this,e,t.replace(/\$<([^>]+)>/g,(function(e,t){return"$"+a[t]})))}if("function"===typeof t){var o=this;return r[Symbol.replace].call(this,e,(function(){var e=[];return e.push.apply(e,arguments),"object"!==n(e[e.length-1])&&e.push(s(e,o)),t.apply(this,e)}))}return r[Symbol.replace].call(this,e,t)},i.apply(this,arguments)}},69:function(e,t,a){"use strict";var n=a(67),r=a(0),u=a.n(r),o=u.a.memo((function(e){var t=Object(n.a)(/(.*?(?:(?![\t-\r \(0-9\[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S]))(?:($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])|(([\+\x2D])(?:(?:1|([2-9]))|($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])))|([0-9]+)(([\+\x2D])(?:(?:1|([2-9]))|($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])))?)($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])?/g,{WordMatcher:1,EndMatcher1:2,Charge1:3,ChargeSign1:4,ChargeValue1:5,EndMatcher2:6,SubMatcher:7,Charge2:8,ChargeSign2:9,ChargeValue2:10,EndMatcher3:11,EndMatcher4:12});return u.a.createElement("div",e,Array.from(e.children.matchAll(t)).map((function(t){var a=[t.groups.ChargeValue1,t.groups.ChargeValue2].reduce((function(e,t){return t||e}),""),n=[t.groups.ChargeSign1,t.groups.ChargeSign2].reduce((function(e,t){return t||e}),""),r=[t.groups.EndMatcher1,t.groups.EndMatcher2,t.groups.EndMatcher3,t.groups.EndMatcher4].reduce((function(e,t){return t||e}),"");return u.a.createElement("span",{key:e.children.substring(0,t.index)},t.groups.WordMatcher,u.a.createElement("sub",null,t.groups.SubMatcher),u.a.createElement("sup",null,a,n),r)})))}));t.a=o}}]);
//# sourceMappingURL=14.0640704e.chunk.js.map