(this.webpackJsonpfreeql=this.webpackJsonpfreeql||[]).push([[9],{104:function(e,t,n){"use strict";var r=n(105),a=n(0),u=n.n(a),c=u.a.memo((function(e){var t=Object(r.a)(/(.*?(?:(?![\t-\r \(0-9\[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S]))(?:($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])|(([\+\x2D])(?:(?:1|([2-9]))|($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])))|([0-9]+)(([\+\x2D])(?:(?:1|([2-9]))|($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])))?)($|[\t-\r \.:\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])?/g,{WordMatcher:1,EndMatcher1:2,Charge1:3,ChargeSign1:4,ChargeValue1:5,EndMatcher2:6,SubMatcher:7,Charge2:8,ChargeSign2:9,ChargeValue2:10,EndMatcher3:11,EndMatcher4:12});return u.a.createElement("div",e,Array.from(e.children.matchAll(t)).map((function(t){var n=[t.groups.ChargeValue1,t.groups.ChargeValue2].reduce((function(e,t){return t||e}),""),r=[t.groups.ChargeSign1,t.groups.ChargeSign2].reduce((function(e,t){return t||e}),""),a=[t.groups.EndMatcher1,t.groups.EndMatcher2,t.groups.EndMatcher3,t.groups.EndMatcher4].reduce((function(e,t){return t||e}),"");return u.a.createElement("span",{key:e.children.substring(0,t.index)},t.groups.WordMatcher,u.a.createElement("sub",null,t.groups.SubMatcher),u.a.createElement("sup",null,n,r),a)})))}));t.a=c},105:function(e,t,n){"use strict";function r(e){return(r="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function a(e){return(a=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}n.d(t,"a",(function(){return i}));var u=n(51);var c=n(55);function o(e){var t="function"===typeof Map?new Map:void 0;return(o=function(e){if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;var n;if("function"!==typeof e)throw new TypeError("Super expression must either be null or a function");if("undefined"!==typeof t){if(t.has(e))return t.get(e);t.set(e,r)}function r(){return Object(c.a)(e,arguments,a(this).constructor)}return r.prototype=Object.create(e.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),Object(u.a)(r,e)})(e)}function l(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Object(u.a)(e,t)}function i(e,t){i=function(e,t){return new c(e,void 0,t)};var n=o(RegExp),a=RegExp.prototype,u=new WeakMap;function c(e,t,r){var a=n.call(this,e,t);return u.set(a,r||u.get(e)),a}function s(e,t){var n=u.get(t);return Object.keys(n).reduce((function(t,r){return t[r]=e[n[r]],t}),Object.create(null))}return l(c,n),c.prototype.exec=function(e){var t=a.exec.call(this,e);return t&&(t.groups=s(t,this)),t},c.prototype[Symbol.replace]=function(e,t){if("string"===typeof t){var n=u.get(this);return a[Symbol.replace].call(this,e,t.replace(/\$<([^>]+)>/g,(function(e,t){return"$"+n[t]})))}if("function"===typeof t){var c=this;return a[Symbol.replace].call(this,e,(function(){var e=[];return e.push.apply(e,arguments),"object"!==r(e[e.length-1])&&e.push(s(e,c)),t.apply(this,e)}))}return a[Symbol.replace].call(this,e,t)},i.apply(this,arguments)}},111:function(e,t,n){"use strict";n.d(t,"b",(function(){return u})),n.d(t,"a",(function(){return c}));var r=n(7),a=n(0),u=function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){},r=Object(a.useRef)(null),u=Object(a.useCallback)((function(a){r.current&&t(r.current),a?e(a):n(),r.current=a}),[t,e,n]);return u},c=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];var a=t.filter(Boolean);return a.length?0===a.length?a[0]:function(e){var t,n=Object(r.a)(a);try{for(n.s();!(t=n.n()).done;){var u=t.value;"function"===typeof u?u(e):u&&(u.current=e)}}catch(c){n.e(c)}finally{n.f()}}:null}},115:function(e,t,n){"use strict";var r=n(6),a=n(0),u=n.n(a),c=n(111),o=u.a.memo((function(e){var t=u.a.Children.only(e.children),n=Object(a.useState)(""),o=Object(r.a)(n,2),l=o[0],i=o[1],s=Object(a.useState)([0,0]),f=Object(r.a)(s,2),p=f[0],h=f[1],b=Object(a.useState)(!1),d=Object(r.a)(b,2),m=d[0],g=d[1],v=Object(a.useRef)(null);return Object(a.useEffect)((function(){m&&(v.current.selectionStart=p[0],v.current.selectionEnd=p[1],g(!1))}),[m,p]),u.a.createElement(u.a.Fragment,null,u.a.cloneElement(t,{value:l,onSelect:function(e){m||h([e.target.selectionStart,e.target.selectionEnd])},onChange:function(t){e.validation(t.target.value)?(e.onChange(t),i(t.target.value),h([t.target.selectionStart,t.target.selectionEnd])):g(!0)},onBlur:function(t){e.onBlur(t,i)},ref:Object(c.a)(t.ref,v)}))}));o.defaultProps={onChange:function(){},onBlur:function(){}},t.a=o},127:function(e,t,n){"use strict";var r=n(6),a=n(0),u=n.n(a),c=n(115),o=n(104),l=n(113),i=n(53),s=n(54),f=n(20),p=n.n(f),h=u.a.memo((function(e){var t=e.id,n=e.onCheck,f=e.onValueChange,h=e.checked,b=e.disabled,d=e.disableCheck,m=e.noRemove,g=e.onRemove,v=e.db,y=Object(a.useState)(!1),O=Object(r.a)(y,2),E=O[0],j=O[1];return u.a.createElement(i.a,{className:(b?"disabled-look ":" ")+"mb-3 p-0"},u.a.createElement(s.a,{xs:"3",sm:"5",className:"w-100 justify-content-end d-flex flex-wrap"},!m&&u.a.createElement("svg",{width:"1.5em",height:"1.5em",viewBox:"0 0 16 16",className:"bi bi-x lighten-hover mr-auto",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg",onClick:g},u.a.createElement("path",{fillRule:"evenodd",d:"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"})),u.a.createElement(o.a,null,v.get(t).name)),u.a.createElement(s.a,{xs:"7",sm:"5",className:"d-flex align-items-center"},u.a.createElement(c.a,{validation:function(e){return e.match(/^-?\d*\.?\d*e?-?\d*$/)},onChange:function(e){j(p()(e.target.value)),f(e.target.value)}},u.a.createElement(l.a.Control,{disabled:b,className:"text-center "+(E||b?"":"is-invalid")}))),u.a.createElement(s.a,{xs:"2",className:"d-flex center-items"},u.a.createElement(l.a.Check,{style:{paddingLeft:"1.7rem"},type:"checkbox",checked:h,disabled:d||b,onChange:function(e){return n(e.target.checked)}})))}));t.a=h},163:function(e,t,n){"use strict";n.r(t),n.d(t,"ComponentRow",(function(){return f}));var r=n(0),a=n.n(r),u=n(127),c=n(52),o=n(17),l=n(18),i=(n(129),n(130),n(27)),s=n(23),f=a.a.memo((function(e){var t=e.component,n=e.disableCheck,r=Object(c.c)(o.a),f=Object(c.c)((function(e){return Object(o.b)(e).has(t)})),p=Object(c.c)((function(e){return Object(i.b)(e).has(t)})),h=Object(c.b)();return a.a.createElement(u.a,{id:t,db:r.components,disabled:p,disableCheck:n,checked:f||p,onCheck:function(e){h(e?Object(l.g)([t]):Object(l.h)([t]))},onValueChange:function(e){h(Object(l.b)({component:t,value:e}))},onRemove:function(){h(Object(s.a)([t]))}})})),p=a.a.memo((function(){var e=Object(c.c)(o.d),t=Object(c.c)(o.a);return a.a.createElement(a.a.Fragment,null,e.delete(t.hPlusValue).map((function(e){return a.a.createElement(f,{key:e,component:e})})))}));t.default=p}}]);
//# sourceMappingURL=9.d0ed8927.chunk.js.map