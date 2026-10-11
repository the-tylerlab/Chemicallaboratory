(()=>{var Qb=Object.create;var Bm=Object.defineProperty;var Gb=Object.getOwnPropertyDescriptor;var Vb=Object.getOwnPropertyNames;var Wb=Object.getPrototypeOf,Fb=Object.prototype.hasOwnProperty;var Vl=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){throw t=0,n}};var Zb=(e,t,n,l)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Vb(t))!Fb.call(e,o)&&o!==n&&Bm(e,o,{get:()=>t[o],enumerable:!(l=Gb(t,o))||l.enumerable});return e};var Te=(e,t,n)=>(n=e!=null?Qb(Wb(e)):{},Zb(t||!e||!e.__esModule?Bm(n,"default",{value:e,enumerable:!0}):n,e));var Fm=Vl(Ne=>{"use strict";var h_=Symbol.for("react.transitional.element"),Kb=Symbol.for("react.portal"),Jb=Symbol.for("react.fragment"),Pb=Symbol.for("react.strict_mode"),ev=Symbol.for("react.profiler"),tv=Symbol.for("react.consumer"),nv=Symbol.for("react.context"),lv=Symbol.for("react.forward_ref"),ov=Symbol.for("react.suspense"),av=Symbol.for("react.memo"),jm=Symbol.for("react.lazy"),iv=Symbol.for("react.activity"),rv=Symbol.for("react.view_transition"),Hm=Symbol.iterator;function sv(e){return e===null||typeof e!="object"?null:(e=Hm&&e[Hm]||e["@@iterator"],typeof e=="function"?e:null)}var Im={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Xm=Object.assign,qm={};function ki(e,t,n){this.props=e,this.context=t,this.refs=qm,this.updater=n||Im}ki.prototype.isReactComponent={};ki.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};ki.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Qm(){}Qm.prototype=ki.prototype;function m_(e,t,n){this.props=e,this.context=t,this.refs=qm,this.updater=n||Im}var g_=m_.prototype=new Qm;g_.constructor=m_;Xm(g_,ki.prototype);g_.isPureReactComponent=!0;var $m=Array.isArray;function f_(){}var zt={H:null,A:null,T:null,S:null},Gm=Object.prototype.hasOwnProperty;function y_(e,t,n){var l=n.ref;return{$$typeof:h_,type:e,key:t,ref:l!==void 0?l:null,props:n}}function cv(e,t){return y_(e.type,t,e.props)}function p_(e){return typeof e=="object"&&e!==null&&e.$$typeof===h_}function uv(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Um=/\/+/g;function __(e,t){return typeof e=="object"&&e!==null&&e.key!=null?uv(""+e.key):t.toString(36)}function dv(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(f_,f_):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Si(e,t,n,l,o){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var i=!1;if(e===null)i=!0;else switch(a){case"bigint":case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case h_:case Kb:i=!0;break;case jm:return i=e._init,Si(i(e._payload),t,n,l,o)}}if(i)return o=o(e),i=l===""?"."+__(e,0):l,$m(o)?(n="",i!=null&&(n=i.replace(Um,"$&/")+"/"),Si(o,t,n,"",function(d){return d})):o!=null&&(p_(o)&&(o=cv(o,n+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(Um,"$&/")+"/")+i)),t.push(o)),1;i=0;var r=l===""?".":l+":";if($m(e))for(var s=0;s<e.length;s++)l=e[s],a=r+__(l,s),i+=Si(l,t,n,a,o);else if(s=sv(e),typeof s=="function")for(e=s.call(e),s=0;!(l=e.next()).done;)l=l.value,a=r+__(l,s++),i+=Si(l,t,n,a,o);else if(a==="object"){if(typeof e.then=="function")return Si(dv(e),t,n,l,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return i}function Ec(e,t,n){if(e==null)return e;var l=[],o=0;return Si(e,l,"","",function(a){return t.call(n,a,o++)}),l}function _v(e){if(e._status===-1){var t=e._result,n=t();n.then(function(l){(e._status===0||e._status===-1)&&(e._status=1,e._result=l,n.status===void 0&&(n.status="fulfilled",n.value=l))},function(l){(e._status===0||e._status===-1)&&(e._status=2,e._result=l,n.status===void 0&&(n.status="rejected",n.reason=l))}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var Ym=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Vm(e){var t=zt.T,n={};n.types=t!==null?t.types:null,zt.T=n;try{var l=e(),o=zt.S;o!==null&&o(n,l),typeof l=="object"&&l!==null&&typeof l.then=="function"&&l.then(f_,Ym)}catch(a){Ym(a)}finally{t!==null&&n.types!==null&&(t.types=n.types),zt.T=t}}function Wm(e){var t=zt.T;if(t!==null){var n=t.types;n===null?t.types=[e]:n.indexOf(e)===-1&&n.push(e)}else Vm(Wm.bind(null,e))}var fv={map:Ec,forEach:function(e,t,n){Ec(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Ec(e,function(){t++}),t},toArray:function(e){return Ec(e,function(t){return t})||[]},only:function(e){if(!p_(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Ne.Activity=iv;Ne.Children=fv;Ne.Component=ki;Ne.Fragment=Jb;Ne.Profiler=ev;Ne.PureComponent=m_;Ne.StrictMode=Pb;Ne.Suspense=ov;Ne.ViewTransition=rv;Ne.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=zt;Ne.__COMPILER_RUNTIME={__proto__:null,c:function(e){return zt.H.useMemoCache(e)}};Ne.addTransitionType=Wm;Ne.cache=function(e){return function(){return e.apply(null,arguments)}};Ne.cacheSignal=function(){return null};Ne.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var l=Xm({},e.props),o=e.key;if(t!=null)for(a in t.key!==void 0&&(o=""+t.key),t)!Gm.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(l[a]=t[a]);var a=arguments.length-2;if(a===1)l.children=n;else if(1<a){for(var i=Array(a),r=0;r<a;r++)i[r]=arguments[r+2];l.children=i}return y_(e.type,o,l)};Ne.createContext=function(e){return e={$$typeof:nv,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:tv,_context:e},e};Ne.createElement=function(e,t,n){var l,o={},a=null;if(t!=null)for(l in t.key!==void 0&&(a=""+t.key),t)Gm.call(t,l)&&l!=="key"&&l!=="__self"&&l!=="__source"&&(o[l]=t[l]);var i=arguments.length-2;if(i===1)o.children=n;else if(1<i){for(var r=Array(i),s=0;s<i;s++)r[s]=arguments[s+2];o.children=r}if(e&&e.defaultProps)for(l in i=e.defaultProps,i)o[l]===void 0&&(o[l]=i[l]);return y_(e,a,o)};Ne.createRef=function(){return{current:null}};Ne.forwardRef=function(e){return{$$typeof:lv,render:e}};Ne.isValidElement=p_;Ne.lazy=function(e){return{$$typeof:jm,_payload:{_status:-1,_result:e},_init:_v}};Ne.memo=function(e,t){return{$$typeof:av,type:e,compare:t===void 0?null:t}};Ne.startTransition=Vm;Ne.unstable_useCacheRefresh=function(){return zt.H.useCacheRefresh()};Ne.use=function(e){return zt.H.use(e)};Ne.useActionState=function(e,t,n){return zt.H.useActionState(e,t,n)};Ne.useCallback=function(e,t){return zt.H.useCallback(e,t)};Ne.useContext=function(e){return zt.H.useContext(e)};Ne.useDebugValue=function(){};Ne.useDeferredValue=function(e,t){return zt.H.useDeferredValue(e,t)};Ne.useEffect=function(e,t){return zt.H.useEffect(e,t)};Ne.useEffectEvent=function(e){return zt.H.useEffectEvent(e)};Ne.useId=function(){return zt.H.useId()};Ne.useImperativeHandle=function(e,t,n){return zt.H.useImperativeHandle(e,t,n)};Ne.useInsertionEffect=function(e,t){return zt.H.useInsertionEffect(e,t)};Ne.useLayoutEffect=function(e,t){return zt.H.useLayoutEffect(e,t)};Ne.useMemo=function(e,t){return zt.H.useMemo(e,t)};Ne.useOptimistic=function(e,t){return zt.H.useOptimistic(e,t)};Ne.useReducer=function(e,t,n){return zt.H.useReducer(e,t,n)};Ne.useRef=function(e){return zt.H.useRef(e)};Ne.useState=function(e){return zt.H.useState(e)};Ne.useSyncExternalStore=function(e,t,n){return zt.H.useSyncExternalStore(e,t,n)};Ne.useTransition=function(){return zt.H.useTransition()};Ne.version="19.3.0"});var Ut=Vl((s7,Zm)=>{"use strict";Zm.exports=Fm()});var i1=Vl(Yt=>{"use strict";function w_(e,t){var n=e.length;e.push(t);e:for(;0<n;){var l=n-1>>>1,o=e[l];if(0<Tc(o,t))e[l]=t,e[n]=o,n=l;else break e}}function Wl(e){return e.length===0?null:e[0]}function Rc(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var l=0,o=e.length,a=o>>>1;l<a;){var i=2*(l+1)-1,r=e[i],s=i+1,d=e[s];if(0>Tc(r,n))s<o&&0>Tc(d,r)?(e[l]=d,e[s]=n,l=s):(e[l]=r,e[i]=n,l=i);else if(s<o&&0>Tc(d,n))e[l]=d,e[s]=n,l=s;else break e}}return t}function Tc(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}Yt.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Km=performance,Yt.unstable_now=function(){return Km.now()}):(b_=Date,Jm=b_.now(),Yt.unstable_now=function(){return b_.now()-Jm});var Km,b_,Jm,xo=[],Io=[],hv=1,ml=null,En=3,S_=!1,Qr=!1,Gr=!1,k_=!1,t1=typeof setTimeout=="function"?setTimeout:null,n1=typeof clearTimeout=="function"?clearTimeout:null,Pm=typeof setImmediate<"u"?setImmediate:null;function Nc(e){for(var t=Wl(Io);t!==null;){if(t.callback===null)Rc(Io);else if(t.startTime<=e)Rc(Io),t.sortIndex=t.expirationTime,w_(xo,t);else break;t=Wl(Io)}}function C_(e){if(Gr=!1,Nc(e),!Qr)if(Wl(xo)!==null)Qr=!0,Mi||(Mi=!0,Ci());else{var t=Wl(Io);t!==null&&M_(C_,t.startTime-e)}}var Mi=!1,Vr=-1,l1=5,o1=-1;function a1(){return k_?!0:!(Yt.unstable_now()-o1<l1)}function v_(){if(k_=!1,Mi){var e=Yt.unstable_now();o1=e;var t=!0;try{e:{Qr=!1,Gr&&(Gr=!1,n1(Vr),Vr=-1),S_=!0;var n=En;try{t:{for(Nc(e),ml=Wl(xo);ml!==null&&!(ml.expirationTime>e&&a1());){var l=ml.callback;if(typeof l=="function"){ml.callback=null,En=ml.priorityLevel;var o=l(ml.expirationTime<=e);if(e=Yt.unstable_now(),typeof o=="function"){ml.callback=o,Nc(e),t=!0;break t}ml===Wl(xo)&&Rc(xo),Nc(e)}else Rc(xo);ml=Wl(xo)}if(ml!==null)t=!0;else{var a=Wl(Io);a!==null&&M_(C_,a.startTime-e),t=!1}}break e}finally{ml=null,En=n,S_=!1}t=void 0}}finally{t?Ci():Mi=!1}}}var Ci;typeof Pm=="function"?Ci=function(){Pm(v_)}:typeof MessageChannel<"u"?(x_=new MessageChannel,e1=x_.port2,x_.port1.onmessage=v_,Ci=function(){e1.postMessage(null)}):Ci=function(){t1(v_,0)};var x_,e1;function M_(e,t){Vr=t1(function(){e(Yt.unstable_now())},t)}Yt.unstable_IdlePriority=5;Yt.unstable_ImmediatePriority=1;Yt.unstable_LowPriority=4;Yt.unstable_NormalPriority=3;Yt.unstable_Profiling=null;Yt.unstable_UserBlockingPriority=2;Yt.unstable_cancelCallback=function(e){e.callback=null};Yt.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):l1=0<e?Math.floor(1e3/e):5};Yt.unstable_getCurrentPriorityLevel=function(){return En};Yt.unstable_next=function(e){switch(En){case 1:case 2:case 3:var t=3;break;default:t=En}var n=En;En=t;try{return e()}finally{En=n}};Yt.unstable_requestPaint=function(){k_=!0};Yt.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=En;En=e;try{return t()}finally{En=n}};Yt.unstable_scheduleCallback=function(e,t,n){var l=Yt.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?l+n:l):n=l,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=n+o,e={id:hv++,callback:t,priorityLevel:e,startTime:n,expirationTime:o,sortIndex:-1},n>l?(e.sortIndex=n,w_(Io,e),Wl(xo)===null&&e===Wl(Io)&&(Gr?(n1(Vr),Vr=-1):Gr=!0,M_(C_,n-l))):(e.sortIndex=o,w_(xo,e),Qr||S_||(Qr=!0,Mi||(Mi=!0,Ci()))),e};Yt.unstable_shouldYield=a1;Yt.unstable_wrapCallback=function(e){var t=En;return function(){var n=En;En=t;try{return e.apply(this,arguments)}finally{En=n}}}});var s1=Vl((u7,r1)=>{"use strict";r1.exports=i1()});var d1=Vl(Tn=>{"use strict";var mv=Ut();function u1(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Xo(){}var Dn={d:{f:Xo,r:function(){throw Error(u1(522))},D:Xo,C:Xo,L:Xo,m:Xo,X:Xo,S:Xo,M:Xo},p:0,findDOMNode:null},gv=Symbol.for("react.portal"),yv=Symbol.for("react.recoverable"),c1=Symbol.for("react.optimistic_key");function pv(e,t,n){var l=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:gv,key:l==null?null:l===c1?c1:""+l,children:e,containerInfo:t,implementation:n}}var Wr=mv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ac(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Tn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Dn;Tn.browser=function(e){return{$$typeof:yv,_reason:e}};Tn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(u1(299));return pv(e,t,null,n)};Tn.flushSync=function(e){var t=Wr.T,n=Dn.p;try{if(Wr.T=null,Dn.p=2,e)return e()}finally{Wr.T=t,Dn.p=n,Dn.d.f()}};Tn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Dn.d.C(e,t))};Tn.prefetchDNS=function(e){typeof e=="string"&&Dn.d.D(e)};Tn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,l=Ac(n,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?Dn.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:l,integrity:o,fetchPriority:a}):n==="script"&&Dn.d.X(e,{crossOrigin:l,integrity:o,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Tn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=Ac(t.as,t.crossOrigin);Dn.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Dn.d.M(e)};Tn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,l=Ac(n,t.crossOrigin);Dn.d.L(e,n,{crossOrigin:l,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Tn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=Ac(t.as,t.crossOrigin);Dn.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Dn.d.m(e)};Tn.requestFormReset=function(e){Dn.d.r(e)};Tn.unstable_batchedUpdates=function(e,t){return e(t)};Tn.useFormState=function(e,t,n){return Wr.H.useFormState(e,t,n)};Tn.useFormStatus=function(){return Wr.H.useHostTransitionStatus()};Tn.version="19.3.0"});var Fr=Vl((_7,f1)=>{"use strict";function _1(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(_1)}catch(e){console.error(e)}}_1(),f1.exports=d1()});var P5=Vl(_d=>{"use strict";var on=s1(),Jg=Ut(),bv=Fr();function H(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Pg(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Bs(e){for(var t=e,n=t;n&&!n.alternate;)t=n,(t.flags&4098)!==0&&(e=t.return),n=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function ey(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ty(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function h1(e){if(Bs(e)!==e)throw Error(H(188))}function vv(e){var t=e.alternate;if(!t){if(t=Bs(e),t===null)throw Error(H(188));return t!==e?null:e}for(var n=e,l=t;;){var o=n.return;if(o===null)break;var a=o.alternate;if(a===null){if(l=o.return,l!==null){n=l;continue}break}if(o.child===a.child){for(a=o.child;a;){if(a===n)return h1(o),e;if(a===l)return h1(o),t;a=a.sibling}throw Error(H(188))}if(n.return!==l.return)n=o,l=a;else{for(var i=!1,r=o.child;r;){if(r===n){i=!0,n=o,l=a;break}if(r===l){i=!0,l=o,n=a;break}r=r.sibling}if(!i){for(r=a.child;r;){if(r===n){i=!0,n=a,l=o;break}if(r===l){i=!0,l=a,n=o;break}r=r.sibling}if(!i)throw Error(H(189))}}if(n.alternate!==l)throw Error(H(190))}if(n.tag!==3)throw Error(H(188));return n.stateNode.current===n?e:t}function ny(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=ny(e),t!==null)return t;e=e.sibling}return null}function Gn(e,t,n,l,o,a){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&n(e,l,o,a)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Gn(e.child,t,n,l,o,a))return!0;e=e.sibling}return!1}function li(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function m1(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function ly(e){var t=[null,null],n=li(e);return n===null||oy(t,e,n.child,{foundSelf:!1}),t}function oy(e,t,n,l){for(;n!==null;){if(n===t)l.foundSelf=!0;else if(n.tag===5||n.tag===27||n.tag===6){if(l.foundSelf)return e[1]=n,!0;e[0]=n}else if((n.tag!==22||n.memoizedState===null)&&oy(e,t,n.child,l))return!0;n=n.sibling}return!1}function ln(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(H(559))}}var zi=null,of=null;function xv(e,t,n){return e===n?!0:e===t?(zi=e,!0):!1}function wv(e,t,n){return e===n?(of=e,!1):e===t?(of!==null&&(zi=e),!0):!1}function g1(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function af(e,t,n){for(var l=0,o=e;o;o=n(o))l++;o=0;for(var a=t;a;a=n(a))o++;for(;0<l-o;)e=n(e),l--;for(;0<o-l;)t=n(t),o--;for(;l--;){if(e===t||t!==null&&e===t.alternate)return e;e=n(e),t=n(t)}return null}var Nt=Object.assign,Sv=Symbol.for("react.element"),Dc=Symbol.for("react.transitional.element"),ns=Symbol.for("react.portal"),Oi=Symbol.for("react.fragment"),ay=Symbol.for("react.strict_mode"),rf=Symbol.for("react.profiler"),iy=Symbol.for("react.consumer"),eo=Symbol.for("react.context"),g0=Symbol.for("react.forward_ref"),sf=Symbol.for("react.suspense"),cf=Symbol.for("react.suspense_list"),y0=Symbol.for("react.memo"),Vo=Symbol.for("react.lazy"),uf=Symbol.for("react.activity"),kv=Symbol.for("react.legacy_hidden"),Cv=Symbol.for("react.memo_cache_sentinel"),df=Symbol.for("react.view_transition"),Mv=Symbol.for("react.recoverable"),y1=Symbol.iterator;function Zr(e){return e===null||typeof e!="object"?null:(e=y1&&e[y1]||e["@@iterator"],typeof e=="function"?e:null)}var Ev=Symbol.for("react.client.reference");function _f(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===Ev?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Oi:return"Fragment";case rf:return"Profiler";case ay:return"StrictMode";case sf:return"Suspense";case cf:return"SuspenseList";case uf:return"Activity";case df:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ns:return"Portal";case eo:return e.displayName||"Context";case iy:return(e._context.displayName||"Context")+".Consumer";case g0:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case y0:return t=e.displayName||null,t!==null?t:_f(e.type)||"Memo";case Vo:t=e._payload,e=e._init;try{return _f(e(t))}catch{}}return null}var ls=Array.isArray,ve=Jg.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ft=bv.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,qa={pending:!1,data:null,method:null,action:null},ff=[],Li=-1;function ro(e){return{current:e}}function yn(e){0>Li||(e.current=ff[Li],ff[Li]=null,Li--)}function Bt(e,t){Li++,ff[Li]=e.current,e.current=t}var oo=ro(null),vs=ro(null),na=ro(null),pu=ro(null);function bu(e,t){switch(Bt(na,t),Bt(vs,e),Bt(oo,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Ag(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Ag(t),e=T5(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}yn(oo),Bt(oo,e)}function tr(){yn(oo),yn(vs),yn(na)}function hf(e){var t=e.memoizedState;t!==null&&(dr._currentValue=t.memoizedState,Bt(pu,e)),t=oo.current;var n=T5(t,e.type);t!==n&&(Bt(vs,e),Bt(oo,n))}function vu(e){vs.current===e&&(yn(oo),yn(vs)),pu.current===e&&(yn(pu),dr._currentValue=qa)}var E_,p1;function Qo(e){if(E_===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);E_=t&&t[1]||"",p1=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+E_+e+p1}var T_=!1;function N_(e,t){if(!e||T_)return"";T_=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var l={DetermineComponentFrameRoot:function(){try{if(t){var h=function(){throw Error()};if(Object.defineProperty(h.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(h,[])}catch(w){var _=w}Reflect.construct(e,[],h)}else{try{h.call()}catch(w){_=w}h=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),h=!0,new e}finally{h&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(w){_=w}(h=e())&&typeof h.catch=="function"&&h.catch(function(){})}}catch(w){if(w&&_&&typeof w.stack=="string")return[w.stack,_.stack]}return[null,null]}};l.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(l.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=l.DetermineComponentFrameRoot(),i=a[0],r=a[1];if(i&&r){var s=i.split(`
`),d=r.split(`
`);for(o=l=0;l<s.length&&!s[l].includes("DetermineComponentFrameRoot");)l++;for(;o<d.length&&!d[o].includes("DetermineComponentFrameRoot");)o++;if(l===s.length||o===d.length)for(l=s.length-1,o=d.length-1;1<=l&&0<=o&&s[l]!==d[o];)o--;for(;1<=l&&0<=o;l--,o--)if(s[l]!==d[o]){if(l!==1||o!==1)do if(l--,o--,0>o||s[l]!==d[o]){var f=`
`+s[l].replace(" at new "," at ");return e.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",e.displayName)),f}while(1<=l&&0<=o);break}}}finally{T_=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?Qo(n):""}function Tv(e,t){switch(e.tag){case 26:case 27:case 5:return Qo(e.type);case 16:return Qo("Lazy");case 13:return e.child!==t&&t!==null?Qo("Suspense Fallback"):Qo("Suspense");case 19:return Qo("SuspenseList");case 0:case 15:return N_(e.type,!1);case 11:return N_(e.type.render,!1);case 1:return N_(e.type,!0);case 31:return Qo("Activity");case 30:return Qo("ViewTransition");default:return""}}function b1(e){try{var t="",n=null;do t+=Tv(e,n),n=e,e=e.return;while(e);return t}catch(l){return`
Error generating stack: `+l.message+`
`+l.stack}}var mf=Object.prototype.hasOwnProperty,p0=on.unstable_scheduleCallback,R_=on.unstable_cancelCallback,Nv=on.unstable_shouldYield,Rv=on.unstable_requestPaint,tl=on.unstable_now,Av=on.unstable_getCurrentPriorityLevel,ry=on.unstable_ImmediatePriority,sy=on.unstable_UserBlockingPriority,xu=on.unstable_NormalPriority,Dv=on.unstable_LowPriority,cy=on.unstable_IdlePriority,zv=on.log,Ov=on.unstable_setDisableYieldValue,Hs=null,nl=null;function Zo(e){if(typeof zv=="function"&&Ov(e),nl&&typeof nl.setStrictMode=="function")try{nl.setStrictMode(Hs,e)}catch{}}var ll=Math.clz32?Math.clz32:Hv,Lv=Math.log,Bv=Math.LN2;function Hv(e){return e>>>=0,e===0?32:31-(Lv(e)/Bv|0)|0}var zc=256,Oc=262144,Lc=4194304;function Ua(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Vu(e,t,n){var l=e.pendingLanes;if(l===0)return 0;var o=0,a=e.suspendedLanes,i=e.pingedLanes;e=e.warmLanes;var r=l&134217727;return r!==0?(l=r&~a,l!==0?o=Ua(l):(i&=r,i!==0?o=Ua(i):n||(n=r&~e,n!==0&&(o=Ua(n))))):(r=l&~a,r!==0?o=Ua(r):i!==0?o=Ua(i):n||(n=l&~e,n!==0&&(o=Ua(n)))),o===0?0:t!==0&&t!==o&&(t&a)===0&&(a=o&-o,n=t&-t,a>=n||a===32&&(n&4194048)!==0)?t:o}function $s(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function uy(e,t){(t&8)!==0&&(t|=t&32);var n=e.entangledLanes;if(n!==0)for(e=e.entanglements,n&=t;0<n;){var l=31-ll(n),o=1<<l;t|=e[l],n&=~o}return t}function $v(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function dy(){var e=Lc;return Lc<<=1,(Lc&62914560)===0&&(Lc=4194304),e}function A_(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Us(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Uv(e,t,n,l,o,a){var i=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var r=e.entanglements,s=e.expirationTimes,d=e.hiddenUpdates;for(n=i&~n;0<n;){var f=31-ll(n),h=1<<f;r[f]=0,s[f]=-1;var _=d[f];if(_!==null)for(d[f]=null,f=0;f<_.length;f++){var b=_[f];b!==null&&(b.lane&=-536870913)}n&=~h}l!==0&&_y(e,l,0),a!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=a&~(i&~t))}function _y(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var l=31-ll(t);e.entangledLanes|=t,e.entanglements[l]=e.entanglements[l]|1073741824|n&261930}function fy(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var l=31-ll(n),o=1<<l;o&t|e[l]&t&&(e[l]|=t),n&=~o}}function hy(e,t){var n=t&-t;return n=(n&42)!==0?1:b0(n),(n&(e.suspendedLanes|t))!==0?0:n}function b0(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function v0(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function my(){var e=ft.p;return e!==0?e:(e=window.event,e===void 0?32:Z5(e.type))}function v1(e,t){var n=ft.p;try{return ft.p=e,t()}finally{ft.p=n}}var Oo=Math.random().toString(36).slice(2),mn="__reactFiber$"+Oo,Vn="__reactProps$"+Oo,hr="__reactContainer$"+Oo,x1="__reactEvents$"+Oo,Yv="__reactListeners$"+Oo,jv="__reactHandles$"+Oo,w1="__reactResources$"+Oo,Ys="__reactMarker$"+Oo,wu="__reactLoad$"+Oo;function Wu(e){delete e[mn],delete e[Vn],delete e[Yv],delete e[jv]}function Ia(e){var t;if(t=e[mn])return t;for(var n=e.parentNode;n;){if(t=n[hr]||n[mn]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Ug(e);e!==null;){if(n=e[mn])return n;e=Ug(e)}return t}e=n,n=e.parentNode}return null}function mr(e){if(e=e[mn]||e[hr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function os(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(H(33))}function Qi(e){var t=e[w1];return t||(t=e[w1]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function sn(e){e[Ys]=!0}function gy(e){e[wu]=void 0}var yy=new Set,py={};function oi(e,t){nr(e,t),nr(e+"Capture",t)}function nr(e,t){for(py[e]=t,e=0;e<t.length;e++)yy.add(t[e])}var Iv=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),S1={},k1={};function Xv(e){return mf.call(k1,e)?!0:mf.call(S1,e)?!1:Iv.test(e)?k1[e]=!0:(S1[e]=!0,!1)}var rt=!1;function C1(){var e=rt;return rt=!1,e}function Pc(e,t,n){if(Xv(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var l=t.toLowerCase().slice(0,5);if(l!=="data-"&&l!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,n)}}function Bc(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,n)}}function wo(e,t,n,l){if(l===null)e.removeAttribute(n);else{switch(typeof l){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,l)}}function Kn(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function by(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function qv(e,t,n){var l=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var o=l.get,a=l.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(i){n=""+i,a.call(this,i)}}),Object.defineProperty(e,t,{enumerable:l.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function gf(e){if(!e._valueTracker){var t=by(e)?"checked":"value";e._valueTracker=qv(e,t,""+e[t])}}function vy(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),l="";return e&&(l=by(e)?e.checked?"true":"false":e.value),e=l,e!==n?(t.setValue(e),!0):!1}var Qv=/[\n"\\]/g;function vl(e){return e.replace(Qv,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function yf(e,t,n,l,o,a,i,r){e.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?e.type=i:e.removeAttribute("type"),t!=null?i==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Kn(t)):e.value!==""+Kn(t)&&(e.value=""+Kn(t)):i!=="submit"&&i!=="reset"||e.removeAttribute("value"),t!=null?i==="number"&&e.value==t?D_(e,Kn(e.value)):D_(e,Kn(t)):n!=null?D_(e,Kn(n)):l!=null&&e.removeAttribute("value"),o==null&&a!=null&&(e.defaultChecked=!!a),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"?e.name=""+Kn(r):e.removeAttribute("name")}function xy(e,t,n,l,o,a,i,r){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(e.type=a),t!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){gf(e);return}n=n!=null?""+Kn(n):"",t=t!=null?""+Kn(t):n,r||t===e.value||(e.value=t),e.defaultValue=t}l=l??o,l=typeof l!="function"&&typeof l!="symbol"&&!!l,e.checked=r?e.checked:!!l,e.defaultChecked=!!l,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(e.name=i),gf(e)}function D_(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Gi(e,t,n,l){if(e=e.options,t){t={};for(var o=0;o<n.length;o++)t["$"+n[o]]=!0;for(n=0;n<e.length;n++)o=t.hasOwnProperty("$"+e[n].value),e[n].selected!==o&&(e[n].selected=o),o&&l&&(e[n].defaultSelected=!0)}else{for(n=""+Kn(n),t=null,o=0;o<e.length;o++){if(e[o].value===n){e[o].selected=!0,l&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function wy(e,t,n){if(t!=null&&(t=""+Kn(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+Kn(n):""}function Sy(e,t,n,l){if(t==null){if(l!=null){if(n!=null)throw Error(H(92));if(ls(l)){if(1<l.length)throw Error(H(93));l=l[0]}n=l}n==null&&(n=""),t=n}n=Kn(t),e.defaultValue=n,l=e.textContent,l===n&&l!==""&&l!==null&&(e.value=l),gf(e)}function lr(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Gv=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function M1(e,t,n){var l=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?l?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":l?e.setProperty(t,n):typeof n!="number"||n===0||Gv.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function ky(e,t,n){if(t!=null&&typeof t!="object")throw Error(H(62));if(e=e.style,n!=null){for(var l in n)!n.hasOwnProperty(l)||t!=null&&t.hasOwnProperty(l)||(l.indexOf("--")===0?e.setProperty(l,""):l==="float"?e.cssFloat="":e[l]="",rt=!0);for(var o in t)l=t[o],t.hasOwnProperty(o)&&n[o]!==l&&(M1(e,o,l),rt=!0)}else for(var a in t)t.hasOwnProperty(a)&&M1(e,a,t[a])}function x0(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Vv=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Wv=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function eu(e){return Wv.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function to(){}var pf=null;function w0(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Bi=null,Vi=null;function E1(e){var t=mr(e);if(t&&(e=t.stateNode)){var n=e[Vn]||null;e:switch(e=t.stateNode,t.type){case"input":if(yf(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+vl(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var l=n[t];if(l!==e&&l.form===e.form){var o=l[Vn]||null;if(!o)throw Error(H(90));yf(l,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<n.length;t++)l=n[t],l.form===e.form&&vy(l)}break e;case"textarea":wy(e,n.value,n.defaultValue);break e;case"select":t=n.value,t!=null&&Gi(e,!!n.multiple,t,!1)}}}var z_=!1;function Cy(e,t,n){if(z_)return e(t,n);z_=!0;try{var l=e(t);return l}finally{if(z_=!1,(Bi!==null||Vi!==null)&&(sd(),Bi&&(t=Bi,e=Vi,Vi=Bi=null,E1(t),e)))for(t=0;t<e.length;t++)E1(e[t])}}function xs(e,t){var n=e.stateNode;if(n===null)return null;var l=n[Vn]||null;if(l===null)return null;n=l[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(e=e.type,l=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!l;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(H(231,t,typeof n));return n}var To=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),bf=!1;if(To)try{Ei={},Object.defineProperty(Ei,"passive",{get:function(){bf=!0}}),window.addEventListener("test",Ei,Ei),window.removeEventListener("test",Ei,Ei)}catch{bf=!1}var Ei,Ko=null,S0=null,tu=null;function My(){if(tu)return tu;var e,t=S0,n=t.length,l,o="value"in Ko?Ko.value:Ko.textContent,a=o.length;for(e=0;e<n&&t[e]===o[e];e++);var i=n-e;for(l=1;l<=i&&t[n-l]===o[a-l];l++);return tu=o.slice(e,1<l?1-l:void 0)}function nu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Hc(){return!0}function T1(){return!1}function Bn(e){function t(n,l,o,a,i){this._reactName=n,this._targetInst=o,this.type=l,this.nativeEvent=a,this.target=i,this.currentTarget=null;for(var r in e)e.hasOwnProperty(r)&&(n=e[r],this[r]=n?n(a):a[r]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?Hc:T1,this.isPropagationStopped=T1,this}return Nt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Hc)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Hc)},persist:function(){},isPersistent:Hc}),t}var ya={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Fu=Bn(ya),js=Nt({},ya,{view:0,detail:0}),Fv=Bn(js),O_,L_,Kr,Zu=Nt({},js,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:k0,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Kr&&(Kr&&e.type==="mousemove"?(O_=e.screenX-Kr.screenX,L_=e.screenY-Kr.screenY):L_=O_=0,Kr=e),O_)},movementY:function(e){return"movementY"in e?e.movementY:L_}}),N1=Bn(Zu),Zv=Nt({},Zu,{dataTransfer:0}),Kv=Bn(Zv),Jv=Nt({},js,{relatedTarget:0}),B_=Bn(Jv),Pv=Nt({},ya,{animationName:0,elapsedTime:0,pseudoElement:0}),ex=Bn(Pv),tx=Nt({},ya,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),nx=Bn(tx),lx=Nt({},ya,{data:0}),R1=Bn(lx),ox={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},ax={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},ix={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function rx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=ix[e])?!!t[e]:!1}function k0(){return rx}var sx=Nt({},js,{key:function(e){if(e.key){var t=ox[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=nu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?ax[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:k0,charCode:function(e){return e.type==="keypress"?nu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?nu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),cx=Bn(sx),ux=Nt({},Zu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),A1=Bn(ux),dx=Nt({},ya,{submitter:0}),_x=Bn(dx),fx=Nt({},js,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:k0}),hx=Bn(fx),mx=Nt({},ya,{propertyName:0,elapsedTime:0,pseudoElement:0}),gx=Bn(mx),yx=Nt({},Zu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),px=Bn(yx),bx=Nt({},ya,{newState:0,oldState:0,source:0}),vx=Bn(bx),xx=[9,13,27,32],C0=To&&"CompositionEvent"in window,rs=null;To&&"documentMode"in document&&(rs=document.documentMode);var wx=To&&"TextEvent"in window&&!rs,Ey=To&&(!C0||rs&&8<rs&&11>=rs),D1=" ",z1=!1;function Ty(e,t){switch(e){case"keyup":return xx.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ny(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Hi=!1;function Sx(e,t){switch(e){case"compositionend":return Ny(t);case"keypress":return t.which!==32?null:(z1=!0,D1);case"textInput":return e=t.data,e===D1&&z1?null:e;default:return null}}function kx(e,t){if(Hi)return e==="compositionend"||!C0&&Ty(e,t)?(e=My(),tu=S0=Ko=null,Hi=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Ey&&t.locale!=="ko"?null:t.data;default:return null}}var Cx={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function O1(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Cx[e.type]:t==="textarea"}function Ry(e,t,n,l){Bi?Vi?Vi.push(l):Vi=[l]:Bi=l,t=qu(t,"onChange"),0<t.length&&(n=new Fu("onChange","change",null,n,l),e.push({event:n,listeners:t}))}var ss=null,ws=null;function Mx(e){C5(e,0)}function Ku(e){var t=os(e);if(vy(t))return e}function L1(e,t){if(e==="change")return t}var Ay=!1;To&&(To?(Uc="oninput"in document,Uc||(H_=document.createElement("div"),H_.setAttribute("oninput","return;"),Uc=typeof H_.oninput=="function"),$c=Uc):$c=!1,Ay=$c&&(!document.documentMode||9<document.documentMode));var $c,Uc,H_;function B1(){ss&&(ss.detachEvent("onpropertychange",Dy),ws=ss=null)}function Dy(e){if(e.propertyName==="value"&&Ku(ws)){var t=[];Ry(t,ws,e,w0(e)),Cy(Mx,t)}}function Ex(e,t,n){e==="focusin"?(B1(),ss=t,ws=n,ss.attachEvent("onpropertychange",Dy)):e==="focusout"&&B1()}function Tx(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Ku(ws)}function Nx(e,t){if(e==="click")return Ku(t)}function Rx(e,t){if(e==="input"||e==="change")return Ku(t)}function Ax(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var al=typeof Object.is=="function"?Object.is:Ax;function Ss(e,t){if(al(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),l=Object.keys(t);if(n.length!==l.length)return!1;for(l=0;l<n.length;l++){var o=n[l];if(!mf.call(t,o)||!al(e[o],t[o]))return!1}return!0}function vf(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function H1(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function $1(e,t){var n=H1(e);e=0;for(var l;n;){if(n.nodeType===3){if(l=e+n.textContent.length,e<=t&&l>=t)return{node:n,offset:t-e};e=l}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=H1(n)}}function zy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?zy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Oy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=vf(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=vf(e.document)}return t}function M0(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Dx=To&&"documentMode"in document&&11>=document.documentMode,$i=null,xf=null,cs=null,wf=!1;function U1(e,t,n){var l=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;wf||$i==null||$i!==vf(l)||(l=$i,"selectionStart"in l&&M0(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),cs&&Ss(cs,l)||(cs=l,l=qu(xf,"onSelect"),0<l.length&&(t=new Fu("onSelect","select",null,t,n),e.push({event:t,listeners:l}),t.target=$i)))}function Ha(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Ui={animationend:Ha("Animation","AnimationEnd"),animationiteration:Ha("Animation","AnimationIteration"),animationstart:Ha("Animation","AnimationStart"),transitionrun:Ha("Transition","TransitionRun"),transitionstart:Ha("Transition","TransitionStart"),transitioncancel:Ha("Transition","TransitionCancel"),transitionend:Ha("Transition","TransitionEnd")},$_={},Ly={};To&&(Ly=document.createElement("div").style,"AnimationEvent"in window||(delete Ui.animationend.animation,delete Ui.animationiteration.animation,delete Ui.animationstart.animation),"TransitionEvent"in window||delete Ui.transitionend.transition);function ai(e){if($_[e])return $_[e];if(!Ui[e])return e;var t=Ui[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Ly)return $_[e]=t[n];return e}var By=ai("animationend"),Hy=ai("animationiteration"),$y=ai("animationstart"),zx=ai("transitionrun"),Ox=ai("transitionstart"),Lx=ai("transitioncancel"),Uy=ai("transitionend"),Yy=new Map,Sf="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Sf.push("scrollEnd");function $l(e,t){Yy.set(e,t),oi(t,[e])}var Bx=0;function No(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Hl.identifierPrefix;var n=Bx++;return e="_"+e+"t_"+n.toString(32)+"_",t.autoName=e}function Y1(e){if(e==null||typeof e=="string")return e;var t=null,n=er;if(n!==null)for(var l=0;l<n.length;l++){var o=e[n[l]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function Lo(e,t){return e=Y1(e),t=Y1(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Su=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},yl=[],Yi=0,E0=0;function Ju(){for(var e=Yi,t=E0=Yi=0;t<e;){var n=yl[t];yl[t++]=null;var l=yl[t];yl[t++]=null;var o=yl[t];yl[t++]=null;var a=yl[t];if(yl[t++]=null,l!==null&&o!==null){var i=l.pending;i===null?o.next=o:(o.next=i.next,i.next=o),l.pending=o}a!==0&&jy(n,o,a)}}function Pu(e,t,n,l){yl[Yi++]=e,yl[Yi++]=t,yl[Yi++]=n,yl[Yi++]=l,E0|=l,e.lanes|=l,e=e.alternate,e!==null&&(e.lanes|=l)}function T0(e,t,n,l){return Pu(e,t,n,l),ku(e)}function ii(e,t){return Pu(e,null,null,t),ku(e)}function jy(e,t,n){e.lanes|=n;var l=e.alternate;l!==null&&(l.lanes|=n);for(var o=!1,a=e.return;a!==null;)a.childLanes|=n,l=a.alternate,l!==null&&(l.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(o=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,o&&t!==null&&(o=31-ll(n),e=a.hiddenUpdates,l=e[o],l===null?e[o]=[t]:l.push(t),t.lane=n|536870912),a):null}function ku(e){if(50<bs)throw bs=0,_u=null,Error(H(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ji={};function Hx(e,t,n,l){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function qn(e,t,n,l){return new Hx(e,t,n,l)}function N0(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Mo(e,t){var n=e.alternate;return n===null?(n=qn(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&1206910976,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function Iy(e,t){e.flags&=1206910978;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function lu(e,t,n,l,o,a){var i=0;if(l=e,typeof l=="function")N0(l)&&(i=1);else if(typeof l=="string")i=c4(e,n,oo.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(l){case uf:return e=qn(31,n,t,o),e.elementType=uf,e.lanes=a,e;case Oi:return Qa(n.children,o,a,t);case ay:i=8,o|=24;break;case rf:return e=qn(12,n,t,o|2),e.elementType=rf,e.lanes=a,e;case sf:return e=qn(13,n,t,o),e.elementType=sf,e.lanes=a,e;case cf:return e=qn(19,n,t,o),e.elementType=cf,e.lanes=a,e;case kv:case df:return e=o|32,e=qn(30,n,t,e),e.elementType=df,e.lanes=a,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof l=="object"&&l!==null)switch(l.$$typeof){case eo:i=10;break e;case iy:i=9;break e;case g0:i=11;break e;case y0:i=14;break e;case Vo:i=16,l=null;break e}i=29,n=Error(H(130,e===null?"null":typeof e,"")),l=null}return t=qn(i,n,t,o),t.elementType=e,t.type=l,t.lanes=a,t}function Qa(e,t,n,l){return e=qn(7,e,l,t),e.lanes=n,e}function U_(e,t,n){return e=qn(6,e,null,t),e.lanes=n,e}function Xy(e){var t=qn(18,null,null,0);return t.stateNode=e,t}function Y_(e,t,n){return t=qn(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var j1=new WeakMap;function xl(e,t){if(typeof e=="object"&&e!==null){var n=j1.get(e);return n!==void 0?n:(t={value:e,source:t,stack:b1(t)},j1.set(e,t),t)}return{value:e,source:t,stack:b1(t)}}var Ii=[],Xi=0,Cu=null,ks=0,pl=[],bl=0,_a=null,no=1,lo="";function ko(e,t){Ii[Xi++]=ks,Ii[Xi++]=Cu,Cu=e,ks=t}function qy(e,t,n){pl[bl++]=no,pl[bl++]=lo,pl[bl++]=_a,_a=e;var l=no;e=lo;var o=32-ll(l)-1;l&=~(1<<o),n+=1;var a=32-ll(t)+o;if(30<a){var i=o-o%5;a=(l&(1<<i)-1).toString(32),l>>=i,o-=i,no=1<<32-ll(t)+o|n<<o|l,lo=a+e}else no=1<<a|n<<o|l,lo=e}function ed(e){e.return!==null&&(ko(e,1),qy(e,1,0))}function R0(e){for(;e===Cu;)Cu=Ii[--Xi],Ii[Xi]=null,ks=Ii[--Xi],Ii[Xi]=null;for(;e===_a;)_a=pl[--bl],pl[bl]=null,lo=pl[--bl],pl[bl]=null,no=pl[--bl],pl[bl]=null}function Qy(e,t){pl[bl++]=no,pl[bl++]=lo,pl[bl++]=_a,no=t.id,lo=t.overflow,_a=e}var cn=null,Lt=null,Ue=!1,la=null,wl=!1,kf=Error(H(519));function fa(e){var t=Error(H(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Cs(xl(t,e)),kf}function I1(e){var t=e.stateNode,n=e.type,l=e.memoizedProps;switch(t[mn]=e,t[Vn]=l,n){case"dialog":Qe("cancel",t),Qe("close",t);break;case"iframe":case"object":case"embed":Qe("load",t);break;case"video":case"audio":for(n=0;n<Ns.length;n++)Qe(Ns[n],t);break;case"source":Qe("error",t);break;case"img":case"image":case"link":Qe("error",t),Qe("load",t);break;case"details":Qe("toggle",t);break;case"input":Qe("invalid",t),xy(t,l.value,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name,!0);break;case"select":Qe("invalid",t);break;case"textarea":Qe("invalid",t),Sy(t,l.value,l.defaultValue,l.children)}n=l.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||l.suppressHydrationWarning===!0||E5(t.textContent,n)?(l.popover!=null&&(Qe("beforetoggle",t),Qe("toggle",t)),l.onScroll!=null&&Qe("scroll",t),l.onScrollEnd!=null&&Qe("scrollend",t),l.onClick!=null&&(t.onclick=to),t=!0):t=!1,t||fa(e,!0)}function Mu(e){for(cn=e.return;cn;)switch(cn.tag){case 5:case 31:case 13:wl=!1;return;case 27:case 3:wl=!0;return;default:cn=cn.return}}function Ti(e){if(e!==cn)return!1;if(!Ue)return Mu(e),Ue=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||s0(e.type,e.memoizedProps)),n=!n),n&&Lt&&fa(e),Mu(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(H(317));Lt=$g(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(H(317));Lt=$g(e)}else t===27?(t=Lt,pa(e.type)?(e=_0,_0=null,Lt=e):Lt=t):Lt=cn?Sl(e.stateNode.nextSibling):null;return!0}function Fa(){Lt=cn=null,Ue=!1}function j_(){var e=la;return e!==null&&(In===null?In=e:In.push.apply(In,e),la=null),e}function Cs(e){la===null?la=[e]:la.push(e)}var Cf=ro(null),ri=null,Co=null;function Jo(e,t,n){Bt(Cf,t._currentValue),t._currentValue=n}function Eo(e){e._currentValue=Cf.current,yn(Cf)}function ou(e,t,n){for(;e!==null;){var l=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,l!==null&&(l.childLanes|=t)):l!==null&&(l.childLanes&t)!==t&&(l.childLanes|=t),e===n)break;e=e.return}}function Mf(e,t,n,l){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var a=o.dependencies;if(a!==null){var i=o.child;a=a.firstContext;e:for(;a!==null;){var r=a;a=o;for(var s=0;s<t.length;s++)if(r.context===t[s]){a.lanes|=n,r=a.alternate,r!==null&&(r.lanes|=n),ou(a.return,n,e),l||(i=null);break e}a=r.next}}else if(o.tag===18){if(i=o.return,i===null)throw Error(H(341));i.lanes|=n,a=i.alternate,a!==null&&(a.lanes|=n),ou(i,n,e),i=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=n,i=o.alternate,i!==null&&(i.lanes|=n),ou(o.return,n,e),i=o.child,i=i!==null?i.sibling:null):i=o.child;if(i!==null)i.return=o;else for(i=o;i!==null;){if(i===e){i=null;break}if(o=i.sibling,o!==null){o.return=i.return,i=o;break}i=i.return}o=i}}function Za(e,t,n,l){e=null;for(var o=t,a=!1;o!==null;){if(!a){if((o.flags&524288)!==0)a=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var i=o.alternate;if(i===null)throw Error(H(387));if(i=i.memoizedProps,i!==null){var r=o.type;al(o.pendingProps.value,i.value)||(e!==null?e.push(r):e=[r])}}else if(o===pu.current){if(i=o.alternate,i===null)throw Error(H(387));i.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(dr):e=[dr])}o=o.return}return e!==null&&Mf(t,e,n,l),t.flags|=262144,e!==null}function Eu(e){for(e=e.firstContext;e!==null;){if(!al(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ka(e){ri=e,Co=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function gn(e){return Gy(ri,e)}function Yc(e,t){return ri===null&&Ka(e),Gy(e,t)}function Gy(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Co===null){if(e===null)throw Error(H(308));Co=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Co=Co.next=t;return n}var $x=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,l){e.push(l)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},Ux=on.unstable_scheduleCallback,Yx=on.unstable_NormalPriority,Kt={$$typeof:eo,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function A0(){return{controller:new $x,data:new Map,refCount:0}}function Is(e){e.refCount--,e.refCount===0&&Ux(Yx,function(){e.controller.abort()})}function X1(e,t){if((e.pendingLanes&4194048)!==0){var n=e.transitionTypes;for(n===null&&(n=e.transitionTypes=[]),e=0;e<t.length;e++){var l=t[e];n.indexOf(l)===-1&&n.push(l)}}}var as=null;function jx(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var us=null,Ef=0,Ja=0,Wi=null;function Ix(e,t){if(us===null){var n=us=[];Ef=0,Ja=ah(),Wi={status:"pending",value:void 0,then:function(l){n.push(l)}}}return Ef++,t.then(q1,q1),t}function q1(){if(--Ef===0&&(as=null,us!==null)){Wi!==null&&(Wi.status="fulfilled");var e=us;us=null,Ja=0,Wi=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Xx(e,t){var n=[],l={status:"pending",value:null,reason:null,then:function(o){n.push(o)}};return e.then(function(){l.status="fulfilled",l.value=t;for(var o=0;o<n.length;o++)(0,n[o])(t)},function(o){for(l.status="rejected",l.reason=o,o=0;o<n.length;o++)(0,n[o])(void 0)}),l}var Q1=ve.S;ve.S=function(e,t){if(u5=tl(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&Ix(e,t),as!==null)for(var n=sr;n!==null;)X1(n,as),n=n.next;if(n=e.types,n!==null){for(var l=sr;l!==null;)X1(l,n),l=l.next;if(Ja!==0){l=as,l===null&&(l=as=[]);for(var o=0;o<n.length;o++){var a=n[o];l.indexOf(a)===-1&&l.push(a)}}}Q1!==null&&Q1(e,t)};var Ga=ro(null);function D0(){var e=Ga.current;return e!==null?e:Tt.pooledCache}function au(e,t){t===null?Bt(Ga,Ga.current):Bt(Ga,t.pool)}function Vy(){var e=D0();return e===null?null:{parent:Kt._currentValue,pool:e}}var gr=Error(H(460)),z0=Error(H(474)),td=Error(H(542)),Tu={then:function(){}};function G1(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Wy(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(to,to),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,W1(e),e===void 0&&!("reason"in t)?Error(H(600)):e;default:if(typeof t.status=="string")t.then(to,to);else{if(e=Tt,e!==null&&100<e.shellSuspendCounter)throw Error(H(482));e=t,e.status="pending",e.then(function(l){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=l}},function(l){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=l}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,W1(e),e}throw Va=t,gr}}function Ya(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Va=n,gr):n}}var Va=null;function V1(){if(Va===null)throw Error(H(459));var e=Va;return Va=null,e}function W1(e){if(e===gr||e===td)throw Error(H(483))}var Fi=null,Ms=0;function jc(e){var t=Ms;return Ms+=1,Fi===null&&(Fi=[]),Wy(Fi,e,t)}function qo(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Ic(e,t){throw t.$$typeof===Sv?Error(H(525)):(e=Object.prototype.toString.call(t),Error(H(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Fy(e){function t(y,x){if(e){var g=y.deletions;g===null?(y.deletions=[x],y.flags|=16):g.push(x)}}function n(y,x){if(!e)return null;for(;x!==null;)t(y,x),x=x.sibling;return null}function l(y){for(var x=new Map;y!==null;)y.key===null?x.set(y.index,y):x.set(y.key,y),y=y.sibling;return x}function o(y,x){return y=Mo(y,x),y.index=0,y.sibling=null,y}function a(y,x,g){return y.index=g,e?(g=y.alternate,g!==null?(g=g.index,g<x?(y.flags|=2,x):g):(y.flags|=134217730,x)):(y.flags|=1048576,x)}function i(y){return e&&y.alternate===null&&(y.flags|=134217730),y}function r(y,x,g,k){return x===null||x.tag!==6?(x=U_(g,y.mode,k),x.return=y,x):(x=o(x,g),x.return=y,x)}function s(y,x,g,k){var I=g.type;return I===Oi?(y=f(y,x,g.props.children,k,g.key),qo(y,g),y):x!==null&&(x.elementType===I||typeof I=="object"&&I!==null&&I.$$typeof===Vo&&Ya(I)===x.type)?(x=o(x,g.props),qo(x,g),x.return=y,x):(x=lu(g.type,g.key,g.props,null,y.mode,k),qo(x,g),x.return=y,x)}function d(y,x,g,k){return x===null||x.tag!==4||x.stateNode.containerInfo!==g.containerInfo||x.stateNode.implementation!==g.implementation?(x=Y_(g,y.mode,k),x.return=y,x):(x=o(x,g.children||[]),x.return=y,x)}function f(y,x,g,k,I){return x===null||x.tag!==7?(x=Qa(g,y.mode,k,I),x.return=y,x):(x=o(x,g),x.return=y,x)}function h(y,x,g){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return x=U_(""+x,y.mode,g),x.return=y,x;if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Dc:return g=lu(x.type,x.key,x.props,null,y.mode,g),qo(g,x),g.return=y,g;case ns:return x=Y_(x,y.mode,g),x.return=y,x;case Vo:return x=Ya(x),h(y,x,g)}if(ls(x)||Zr(x))return x=Qa(x,y.mode,g,null),x.return=y,x;if(typeof x.then=="function")return h(y,jc(x),g);if(x.$$typeof===eo)return h(y,Yc(y,x),g);Ic(y,x)}return null}function _(y,x,g,k){var I=x!==null?x.key:null;if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return I!==null?null:r(y,x,""+g,k);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Dc:return g.key===I?s(y,x,g,k):null;case ns:return g.key===I?d(y,x,g,k):null;case Vo:return g=Ya(g),_(y,x,g,k)}if(ls(g)||Zr(g))return I!==null?null:f(y,x,g,k,null);if(typeof g.then=="function")return _(y,x,jc(g),k);if(g.$$typeof===eo)return _(y,x,Yc(y,g),k);Ic(y,g)}return null}function b(y,x,g,k,I){if(typeof k=="string"&&k!==""||typeof k=="number"||typeof k=="bigint")return y=y.get(g)||null,r(x,y,""+k,I);if(typeof k=="object"&&k!==null){switch(k.$$typeof){case Dc:return y=y.get(k.key===null?g:k.key)||null,s(x,y,k,I);case ns:return y=y.get(k.key===null?g:k.key)||null,d(x,y,k,I);case Vo:return k=Ya(k),b(y,x,g,k,I)}if(ls(k)||Zr(k))return y=y.get(g)||null,f(x,y,k,I,null);if(typeof k.then=="function")return b(y,x,g,jc(k),I);if(k.$$typeof===eo)return b(y,x,g,Yc(x,k),I);Ic(x,k)}return null}function w(y,x,g,k){for(var I=null,J=null,L=x,F=x=0,Y=null;L!==null&&F<g.length;F++){L.index>F?(Y=L,L=null):Y=L.sibling;var Z=_(y,L,g[F],k);if(Z===null){L===null&&(L=Y);break}e&&L&&Z.alternate===null&&t(y,L),x=a(Z,x,F),J===null?I=Z:J.sibling=Z,J=Z,L=Y}if(F===g.length)return n(y,L),Ue&&ko(y,F),I;if(L===null){for(;F<g.length;F++)L=h(y,g[F],k),L!==null&&(x=a(L,x,F),J===null?I=L:J.sibling=L,J=L);return Ue&&ko(y,F),I}for(L=l(L);F<g.length;F++)Y=b(L,y,F,g[F],k),Y!==null&&(e&&(Z=Y.alternate,Z!==null&&L.delete(Z.key===null?F:Z.key)),x=a(Y,x,F),J===null?I=Y:J.sibling=Y,J=Y);return e&&L.forEach(function(re){return t(y,re)}),Ue&&ko(y,F),I}function N(y,x,g,k){if(g==null)throw Error(H(151));for(var I=null,J=null,L=x,F=x=0,Y=null,Z=g.next();L!==null&&!Z.done;F++,Z=g.next()){L.index>F?(Y=L,L=null):Y=L.sibling;var re=_(y,L,Z.value,k);if(re===null){L===null&&(L=Y);break}e&&L&&re.alternate===null&&t(y,L),x=a(re,x,F),J===null?I=re:J.sibling=re,J=re,L=Y}if(Z.done)return n(y,L),Ue&&ko(y,F),I;if(L===null){for(;!Z.done;F++,Z=g.next())Z=h(y,Z.value,k),Z!==null&&(x=a(Z,x,F),J===null?I=Z:J.sibling=Z,J=Z);return Ue&&ko(y,F),I}for(L=l(L);!Z.done;F++,Z=g.next())Z=b(L,y,F,Z.value,k),Z!==null&&(e&&(Y=Z.alternate,Y!==null&&L.delete(Y.key===null?F:Y.key)),x=a(Z,x,F),J===null?I=Z:J.sibling=Z,J=Z);return e&&L.forEach(function(K){return t(y,K)}),Ue&&ko(y,F),I}function M(y,x,g,k){if(typeof g=="object"&&g!==null&&g.type===Oi&&g.key===null&&g.props.ref===void 0&&(g=g.props.children),typeof g=="object"&&g!==null){switch(g.$$typeof){case Dc:e:{for(var I=g.key;x!==null;){if(x.key===I){if(I=g.type,I===Oi){if(x.tag===7){n(y,x.sibling),k=o(x,g.props.children),qo(k,g),k.return=y,y=k;break e}}else if(x.elementType===I||typeof I=="object"&&I!==null&&I.$$typeof===Vo&&Ya(I)===x.type){n(y,x.sibling),k=o(x,g.props),qo(k,g),k.return=y,y=k;break e}n(y,x);break}else t(y,x);x=x.sibling}g.type===Oi?(k=Qa(g.props.children,y.mode,k,g.key),qo(k,g),k.return=y,y=k):(k=lu(g.type,g.key,g.props,null,y.mode,k),qo(k,g),k.return=y,y=k)}return i(y);case ns:e:{for(I=g.key;x!==null;){if(x.key===I)if(x.tag===4&&x.stateNode.containerInfo===g.containerInfo&&x.stateNode.implementation===g.implementation){n(y,x.sibling),k=o(x,g.children||[]),k.return=y,y=k;break e}else{n(y,x);break}else t(y,x);x=x.sibling}k=Y_(g,y.mode,k),k.return=y,y=k}return i(y);case Vo:return g=Ya(g),M(y,x,g,k)}if(ls(g))return w(y,x,g,k);if(Zr(g)){if(I=Zr(g),typeof I!="function")throw Error(H(150));return g=I.call(g),N(y,x,g,k)}if(typeof g.then=="function")return M(y,x,jc(g),k);if(g.$$typeof===eo)return M(y,x,Yc(y,g),k);Ic(y,g)}return typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint"?(g=""+g,x!==null&&x.tag===6?(n(y,x.sibling),k=o(x,g),k.return=y,y=k):(n(y,x),k=U_(g,y.mode,k),k.return=y,y=k),i(y)):n(y,x)}return function(y,x,g,k){try{Ms=0;var I=M(y,x,g,k);return Fi=null,I}catch(L){if(L===gr||L===td)throw L;var J=qn(29,L,null,y.mode);return J.lanes=k,J.return=y,J}}}var Pa=Fy(!0),Zy=Fy(!1),Wo=!1;function O0(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Tf(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function oa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function aa(e,t,n){var l=e.updateQueue;if(l===null)return null;if(l=l.shared,(_t&2)!==0){var o=l.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),l.pending=t,t=ku(e),jy(e,null,n),t}return Pu(e,l,t,n),ku(e)}function ds(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var l=t.lanes;l&=e.pendingLanes,n|=l,t.lanes=n,fy(e,n)}}function I_(e,t){var n=e.updateQueue,l=e.alternate;if(l!==null&&(l=l.updateQueue,n===l)){var o=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?o=a=i:a=a.next=i,n=n.next}while(n!==null);a===null?o=a=t:a=a.next=t}else o=a=t;n={baseState:l.baseState,firstBaseUpdate:o,lastBaseUpdate:a,shared:l.shared,callbacks:l.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Nf=!1;function _s(){if(Nf){var e=Wi;if(e!==null)throw e}}function fs(e,t,n,l){Nf=!1;var o=e.updateQueue;Wo=!1;var a=o.firstBaseUpdate,i=o.lastBaseUpdate,r=o.shared.pending;if(r!==null){o.shared.pending=null;var s=r,d=s.next;s.next=null,i===null?a=d:i.next=d,i=s;var f=e.alternate;f!==null&&(f=f.updateQueue,r=f.lastBaseUpdate,r!==i&&(r===null?f.firstBaseUpdate=d:r.next=d,f.lastBaseUpdate=s))}if(a!==null){var h=o.baseState;i=0,f=d=s=null,r=a;do{var _=r.lane&-536870913,b=_!==r.lane;if(b?(We&_)===_:(l&_)===_){_!==0&&_===Ja&&(Nf=!0),f!==null&&(f=f.next={lane:0,tag:r.tag,payload:r.payload,callback:null,next:null});e:{var w=e,N=r;_=t;var M=n;switch(N.tag){case 1:if(w=N.payload,typeof w=="function"){h=w.call(M,h,_);break e}h=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=N.payload,_=typeof w=="function"?w.call(M,h,_):w,_==null)break e;h=Nt({},h,_);break e;case 2:Wo=!0}}_=r.callback,_!==null&&(e.flags|=64,b&&(e.flags|=8192),b=o.callbacks,b===null?o.callbacks=[_]:b.push(_))}else b={lane:_,tag:r.tag,payload:r.payload,callback:r.callback,next:null},f===null?(d=f=b,s=h):f=f.next=b,i|=_;if(r=r.next,r===null){if(r=o.shared.pending,r===null)break;b=r,r=b.next,b.next=null,o.lastBaseUpdate=b,o.shared.pending=null}}while(!0);f===null&&(s=h),o.baseState=s,o.firstBaseUpdate=d,o.lastBaseUpdate=f,a===null&&(o.shared.lanes=0),ga|=i,e.lanes=i,e.memoizedState=h}}function Ky(e,t){if(typeof e!="function")throw Error(H(191,e));e.call(t)}function Jy(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Ky(n[e],t)}var ha=ro(null),Nu=ro(0);function F1(e,t){e=zo,Bt(Nu,e),Bt(ha,t),zo=e|t.baseLanes}function Rf(){Bt(Nu,zo),Bt(ha,ha.current)}function L0(){zo=Nu.current,yn(ha),yn(Nu)}var vn=ro(null),Nn=null;function ia(e){var t=e.alternate;Bt(pn,pn.current&1),Bt(vn,e),Nn===null&&(t===null||ha.current!==null||t.memoizedState!==null)&&(Nn=e)}function Af(e){Bt(pn,pn.current),Bt(vn,e),Nn===null&&(Nn=e)}function Py(e){e.tag===22?(Bt(pn,pn.current),Bt(vn,e),Nn===null&&(Nn=e)):ra()}function ra(){Bt(pn,pn.current),Bt(vn,vn.current)}function Jn(e){yn(vn),Nn===e&&(Nn=null),yn(pn)}var pn=ro(0);function Es(e,t){Bt(vn,vn.current),Bt(pn,t)}function B0(e){yn(pn),yn(vn),Nn===e&&(Nn=null)}function Ru(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||d0(n)||ch(n)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Ro=0,Le=null,Ct=null,Zt=null,Au=!1,Zi=!1,ei=!1,Du=0,Ts=0,Ki=null,qx=0;function Qt(){throw Error(H(321))}function H0(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!al(e[n],t[n]))return!1;return!0}function $0(e,t,n,l,o,a){return Ro=a,Le=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,ve.H=e===null||e.memoizedState===null?Rp:Ap,ei=!1,a=n(l,o),ei=!1,Zi&&(a=tp(t,n,l,o)),ep(e),a}function ep(e){ve.H=zu;var t=Ct!==null&&Ct.next!==null;if(Ro=0,Zt=Ct=Le=null,Au=!1,Ts=0,Ki=null,t)throw Error(H(300));e===null||Jt||(e=e.dependencies,e!==null&&Eu(e)&&(Jt=!0))}function tp(e,t,n,l){Le=e;var o=0;do{if(Zi&&(Ki=null),Ts=0,Zi=!1,25<=o)throw Error(H(301));if(o+=1,Zt=Ct=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}ve.H=Jx,a=t(n,l)}while(Zi);return a}function Qx(){var e=ve.H,t=e.useState()[0];return t=typeof t.then=="function"?Xs(t):t,e=e.useState()[0],(Ct!==null?Ct.memoizedState:null)!==e&&(Le.flags|=1024),t}function U0(){var e=Du!==0;return Du=0,e}function Y0(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function j0(e){if(Au){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Au=!1}Ro=0,Zt=Ct=Le=null,Zi=!1,Ts=Du=0,Ki=null}function Ln(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Zt===null?Le.memoizedState=Zt=e:Zt=Zt.next=e,Zt}function Wt(){if(Ct===null){var e=Le.alternate;e=e!==null?e.memoizedState:null}else e=Ct.next;var t=Zt===null?Le.memoizedState:Zt.next;if(t!==null)Zt=t,Ct=e;else{if(e===null)throw Le.alternate===null?Error(H(467)):Error(H(310));Ct=e,e={memoizedState:Ct.memoizedState,baseState:Ct.baseState,baseQueue:Ct.baseQueue,queue:Ct.queue,next:null},Zt===null?Le.memoizedState=Zt=e:Zt=Zt.next=e}return Zt}function nd(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Xs(e){var t=Ts;return Ts+=1,Ki===null&&(Ki=[]),e=Wy(Ki,e,t),t=Le,(Zt===null?t.memoizedState:Zt.next)===null&&(t=t.alternate,ve.H=t===null||t.memoizedState===null?Rp:Ap),e}function ld(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Xs(e);if(e.$$typeof===Mv)return;if(e.$$typeof===eo)return gn(e)}throw Error(H(438,String(e)))}function I0(e){var t=null,n=Le.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var l=Le.alternate;l!==null&&(l=l.updateQueue,l!==null&&(l=l.memoCache,l!=null&&(t={data:l.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=nd(),Le.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),l=0;l<e;l++)n[l]=Cv;return t.index++,n}function Ao(e,t){return typeof t=="function"?t(e):t}function iu(e){var t=Wt();return X0(t,Ct,e)}function X0(e,t,n){var l=e.queue;if(l===null)throw Error(H(311));l.lastRenderedReducer=n;var o=e.baseQueue,a=l.pending;if(a!==null){if(o!==null){var i=o.next;o.next=a.next,a.next=i}t.baseQueue=o=a,l.pending=null}if(a=e.baseState,o===null)e.memoizedState=a;else{t=o.next;var r=i=null,s=null,d=t,f=!1;do{var h=d.lane&-536870913;if(h!==d.lane?(We&h)===h:(Ro&h)===h){var _=d.revertLane;if(_===0)s!==null&&(s=s.next={lane:0,revertLane:0,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),h===Ja&&(f=!0);else if((Ro&_)===_){d=d.next,_===Ja&&(f=!0);continue}else h={lane:0,revertLane:d.revertLane,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},s===null?(r=s=h,i=a):s=s.next=h,Le.lanes|=_,ga|=_;h=d.action,ei&&n(a,h),a=d.hasEagerState?d.eagerState:n(a,h)}else _={lane:h,revertLane:d.revertLane,gesture:d.gesture,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},s===null?(r=s=_,i=a):s=s.next=_,Le.lanes|=h,ga|=h;d=d.next}while(d!==null&&d!==t);if(s===null?i=a:s.next=r,!al(a,e.memoizedState)&&(Jt=!0,f&&(n=Wi,n!==null)))throw n;e.memoizedState=a,e.baseState=i,e.baseQueue=s,l.lastRenderedState=a}return o===null&&(l.lanes=0),[e.memoizedState,l.dispatch]}function X_(e){var t=Wt(),n=t.queue;if(n===null)throw Error(H(311));n.lastRenderedReducer=e;var l=n.dispatch,o=n.pending,a=t.memoizedState;if(o!==null){n.pending=null;var i=o=o.next;do a=e(a,i.action),i=i.next;while(i!==o);al(a,t.memoizedState)||(Jt=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,l]}function np(e,t,n){var l=Le,o=Wt(),a=Ue;if(a){if(n===void 0)throw Error(H(407));n=n()}else n=t();var i=!al((Ct||o).memoizedState,n);if(i&&(o.memoizedState=n,Jt=!0),o=o.queue,q0(ap.bind(null,l,o,e),[e]),e=o.getSnapshot!==t||i||Zt!==null&&(Zt.memoizedState.tag&1)!==0,or(e?9:8,{destroy:void 0},op.bind(null,l,o,n,t),null),e){if(l.flags|=2048,Tt===null)throw Error(H(349));a||(Ro&127)!==0||lp(l,t,n)}return n}function lp(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Le.updateQueue,t===null?(t=nd(),Le.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function op(e,t,n,l){t.value=n,t.getSnapshot=l,ip(t)&&rp(e)}function ap(e,t,n){return n(function(){ip(t)&&rp(e)})}function ip(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!al(e,n)}catch{return!0}}function rp(e){var t=ii(e,2);t!==null&&Qn(t,e,2)}function Df(e){var t=Ln();if(typeof e=="function"){var n=e;if(e=n(),ei){Zo(!0);try{n()}finally{Zo(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ao,lastRenderedState:e},t}function sp(e,t,n,l){return e.baseState=n,X0(e,Ct,typeof l=="function"?l:Ao)}function Gx(e,t,n,l,o){if(ad(e))throw Error(H(485));if(e=t.action,e!==null){var a={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){a.listeners.push(i)}};ve.T!==null?n(!0):a.isTransition=!1,l(a),n=t.pending,n===null?(a.next=t.pending=a,cp(t,a)):(a.next=n.next,t.pending=n.next=a)}}function cp(e,t){var n=t.action,l=t.payload,o=e.state;if(t.isTransition){var a=ve.T,i={};i.types=a!==null?a.types:null,ve.T=i;try{var r=n(o,l),s=ve.S;s!==null&&s(i,r),Z1(e,t,r)}catch(d){zf(e,t,d)}finally{a!==null&&i.types!==null&&(a.types=i.types),ve.T=a}}else try{a=n(o,l),Z1(e,t,a)}catch(d){zf(e,t,d)}}function Z1(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(l){K1(e,t,l)},function(l){return zf(e,t,l)}):K1(e,t,n)}function K1(e,t,n){t.status="fulfilled",t.value=n,up(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,cp(e,n)))}function zf(e,t,n){var l=e.pending;if(e.pending=null,l!==null){l=l.next;do t.status="rejected",t.reason=n,up(t),t=t.next;while(t!==l)}e.action=null}function up(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function dp(e,t){return t}function J1(e,t){if(Ue){var n=Tt.formState;if(n!==null){e:{var l=Le;if(Ue){if(Lt){t:{for(var o=Lt,a=wl;o.nodeType!==8;){if(!a){o=null;break t}if(o=Sl(o.nextSibling),o===null){o=null;break t}}a=o.data,o=a==="F!"||a==="F"?o:null}if(o){Lt=Sl(o.nextSibling),l=o.data==="F!";break e}}fa(l)}l=!1}l&&(t=n[0])}}return n=Ln(),n.memoizedState=n.baseState=t,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:dp,lastRenderedState:t},n.queue=l,n=Ep.bind(null,Le,l),l.dispatch=n,l=Df(!1),a=W0.bind(null,Le,!1,l.queue),l=Ln(),o={state:t,dispatch:null,action:e,pending:null},l.queue=o,n=Gx.bind(null,Le,o,a,n),o.dispatch=n,l.memoizedState=e,[t,n,!1]}function P1(e){var t=Wt();return _p(t,Ct,e)}function _p(e,t,n){if(t=X0(e,t,dp)[0],e=iu(Ao)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var l=Xs(t)}catch(i){throw i===gr?td:i}else l=t;t=Wt();var o=t.queue,a=o.dispatch;return n!==t.memoizedState&&(Le.flags|=2048,or(9,{destroy:void 0},Vx.bind(null,o,n),null)),[l,a,e]}function Vx(e,t){e.action=t}function eg(e){var t=Wt(),n=Ct;if(n!==null)return _p(t,n,e);Wt(),t=t.memoizedState,n=Wt();var l=n.queue.dispatch;return n.memoizedState=e,[t,l,!1]}function or(e,t,n,l){return e={tag:e,create:n,deps:l,inst:t,next:null},t=Le.updateQueue,t===null&&(t=nd(),Le.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(l=n.next,n.next=e,e.next=l,t.lastEffect=e),e}function fp(){return Wt().memoizedState}function ru(e,t,n,l){var o=Ln();Le.flags|=e,o.memoizedState=or(1|t,{destroy:void 0},n,l===void 0?null:l)}function od(e,t,n,l){var o=Wt();l=l===void 0?null:l;var a=o.memoizedState.inst;Ct!==null&&l!==null&&H0(l,Ct.memoizedState.deps)?o.memoizedState=or(t,a,n,l):(Le.flags|=e,o.memoizedState=or(1|t,a,n,l))}function tg(e,t){ru(8390656,8,e,t)}function q0(e,t){od(2048,8,e,t)}function Wx(e){Le.flags|=4;var t=Le.updateQueue;if(t===null)t=nd(),Le.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function hp(e){var t=Wt().memoizedState;return Wx({ref:t,nextImpl:e}),function(){if((_t&2)!==0)throw Error(H(440));return t.impl.apply(void 0,arguments)}}function mp(e,t){return od(4,2,e,t)}function gp(e,t){return od(4,4,e,t)}function yp(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function pp(e,t,n){n=n!=null?n.concat([e]):null,od(4,4,yp.bind(null,t,e),n)}function Q0(){}function bp(e,t){var n=Wt();t=t===void 0?null:t;var l=n.memoizedState;return t!==null&&H0(t,l[1])?l[0]:(n.memoizedState=[e,t],e)}function vp(e,t){var n=Wt();t=t===void 0?null:t;var l=n.memoizedState;if(t!==null&&H0(t,l[1]))return l[0];if(l=e(),ei){Zo(!0);try{e()}finally{Zo(!1)}}return n.memoizedState=[l,t],l}function G0(e,t,n){return n===void 0||(Ro&1073741824)!==0&&(We&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=_5(),Le.lanes|=e,ga|=e,n)}function xp(e,t,n,l){return al(n,t)?n:ha.current!==null?(e=G0(e,n,l),al(e,t)||(Jt=!0),e):(Ro&106)===0||(Ro&1073741824)!==0&&(We&261930)===0?(Jt=!0,e.memoizedState=n):(e=_5(),Le.lanes|=e,ga|=e,t)}function wp(e,t,n,l,o){var a=ft.p;ft.p=a!==0&&8>a?a:8;var i=ve.T,r={};r.types=i!==null?i.types:null,ve.T=r,W0(e,!1,t,n);try{var s=o(),d=ve.S;if(d!==null&&d(r,s),s!==null&&typeof s=="object"&&typeof s.then=="function"){var f=Xx(s,l);hs(e,t,f,ol(e))}else hs(e,t,l,ol(e))}catch(h){hs(e,t,{then:function(){},status:"rejected",reason:h},ol())}finally{ft.p=a,i!==null&&r.types!==null&&(i.types=r.types),ve.T=i}}function Fx(){}function Of(e,t,n,l){if(e.tag!==5)throw Error(H(476));var o=Sp(e).queue;wp(e,o,t,qa,n===null?Fx:function(){return kp(e),n(l)})}function Sp(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:qa,baseState:qa,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ao,lastRenderedState:qa},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ao,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function kp(e){var t=Sp(e);t.next===null&&(t=e.alternate.memoizedState),hs(e,t.next.queue,{},ol())}function V0(){return gn(dr)}function Cp(){return Wt().memoizedState}function Mp(){return Wt().memoizedState}function Zx(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=ol();e=oa(n);var l=aa(t,e,n);l!==null&&(Qn(l,t,n),ds(l,t,n)),t={cache:A0()},e.payload=t;return}t=t.return}}function Kx(e,t,n){var l=ol();n={lane:l,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},ad(e)?Tp(t,n):(n=T0(e,t,n,l),n!==null&&(Qn(n,e,l),Np(n,t,l)))}function Ep(e,t,n){var l=ol();hs(e,t,n,l)}function hs(e,t,n,l){var o={lane:l,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(ad(e))Tp(t,o);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var i=t.lastRenderedState,r=a(i,n);if(o.hasEagerState=!0,o.eagerState=r,al(r,i))return Pu(e,t,o,0),Tt===null&&Ju(),!1}catch{}if(n=T0(e,t,o,l),n!==null)return Qn(n,e,l),Np(n,t,l),!0}return!1}function W0(e,t,n,l){if(l={lane:2,revertLane:ah(),gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null},ad(e)){if(t)throw Error(H(479))}else t=T0(e,n,l,2),t!==null&&Qn(t,e,2)}function ad(e){var t=e.alternate;return e===Le||t!==null&&t===Le}function Tp(e,t){Zi=Au=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Np(e,t,n){if((n&4194048)!==0){var l=t.lanes;l&=e.pendingLanes,n|=l,t.lanes=n,fy(e,n)}}var zu={readContext:gn,use:ld,useCallback:Qt,useContext:Qt,useEffect:Qt,useImperativeHandle:Qt,useLayoutEffect:Qt,useInsertionEffect:Qt,useMemo:Qt,useReducer:Qt,useRef:Qt,useState:Qt,useDebugValue:Qt,useDeferredValue:Qt,useTransition:Qt,useSyncExternalStore:Qt,useId:Qt,useHostTransitionStatus:Qt,useFormState:Qt,useActionState:Qt,useOptimistic:Qt,useMemoCache:Qt,useCacheRefresh:Qt,useEffectEvent:Qt},Rp={readContext:gn,use:ld,useCallback:function(e,t){return Ln().memoizedState=[e,t===void 0?null:t],e},useContext:gn,useEffect:tg,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,ru(4194308,4,yp.bind(null,t,e),n)},useLayoutEffect:function(e,t){return ru(4194308,4,e,t)},useInsertionEffect:function(e,t){ru(4,2,e,t)},useMemo:function(e,t){var n=Ln();t=t===void 0?null:t;var l=e();if(ei){Zo(!0);try{e()}finally{Zo(!1)}}return n.memoizedState=[l,t],l},useReducer:function(e,t,n){var l=Ln();if(n!==void 0){var o=n(t);if(ei){Zo(!0);try{n(t)}finally{Zo(!1)}}}else o=t;return l.memoizedState=l.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},l.queue=e,e=e.dispatch=Kx.bind(null,Le,e),[l.memoizedState,e]},useRef:function(e){var t=Ln();return e={current:e},t.memoizedState=e},useState:function(e){e=Df(e);var t=e.queue,n=Ep.bind(null,Le,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:Q0,useDeferredValue:function(e,t){var n=Ln();return G0(n,e,t)},useTransition:function(){var e=Df(!1);return e=wp.bind(null,Le,e.queue,!0,!1),Ln().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var l=Le,o=Ln();if(Ue){if(n===void 0)throw Error(H(407));n=n()}else{if(n=t(),Tt===null)throw Error(H(349));(We&127)!==0||lp(l,t,n)}o.memoizedState=n;var a={value:n,getSnapshot:t};return o.queue=a,tg(ap.bind(null,l,a,e),[e]),l.flags|=2048,or(9,{destroy:void 0},op.bind(null,l,a,n,t),null),n},useId:function(){var e=Ln(),t=Tt.identifierPrefix;if(Ue){var n=lo,l=no;n=(l&~(1<<32-ll(l)-1)).toString(32)+n,t="_"+t+"R_"+n,n=Du++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=qx++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:V0,useFormState:J1,useActionState:J1,useOptimistic:function(e){var t=Ln();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=W0.bind(null,Le,!0,n),n.dispatch=t,[e,t]},useMemoCache:I0,useCacheRefresh:function(){return Ln().memoizedState=Zx.bind(null,Le)},useEffectEvent:function(e){var t=Ln(),n={impl:e};return t.memoizedState=n,function(){if((_t&2)!==0)throw Error(H(440));return n.impl.apply(void 0,arguments)}}},Ap={readContext:gn,use:ld,useCallback:bp,useContext:gn,useEffect:q0,useImperativeHandle:pp,useInsertionEffect:mp,useLayoutEffect:gp,useMemo:vp,useReducer:iu,useRef:fp,useState:function(){return iu(Ao)},useDebugValue:Q0,useDeferredValue:function(e,t){var n=Wt();return xp(n,Ct.memoizedState,e,t)},useTransition:function(){var e=iu(Ao)[0],t=Wt().memoizedState;return[typeof e=="boolean"?e:Xs(e),t]},useSyncExternalStore:np,useId:Cp,useHostTransitionStatus:V0,useFormState:P1,useActionState:P1,useOptimistic:function(e,t){var n=Wt();return sp(n,Ct,e,t)},useMemoCache:I0,useCacheRefresh:Mp,useEffectEvent:hp},Jx={readContext:gn,use:ld,useCallback:bp,useContext:gn,useEffect:q0,useImperativeHandle:pp,useInsertionEffect:mp,useLayoutEffect:gp,useMemo:vp,useReducer:X_,useRef:fp,useState:function(){return X_(Ao)},useDebugValue:Q0,useDeferredValue:function(e,t){var n=Wt();return Ct===null?G0(n,e,t):xp(n,Ct.memoizedState,e,t)},useTransition:function(){var e=X_(Ao)[0],t=Wt().memoizedState;return[typeof e=="boolean"?e:Xs(e),t]},useSyncExternalStore:np,useId:Cp,useHostTransitionStatus:V0,useFormState:eg,useActionState:eg,useOptimistic:function(e,t){var n=Wt();return Ct!==null?sp(n,Ct,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:I0,useCacheRefresh:Mp,useEffectEvent:hp};function q_(e,t,n,l){t=e.memoizedState,n=n(l,t),n=n==null?t:Nt({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Lf={enqueueSetState:function(e,t,n){e=e._reactInternals;var l=ol(),o=oa(l);o.payload=t,n!=null&&(o.callback=n),t=aa(e,o,l),t!==null&&(Qn(t,e,l),ds(t,e,l))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var l=ol(),o=oa(l);o.tag=1,o.payload=t,n!=null&&(o.callback=n),t=aa(e,o,l),t!==null&&(Qn(t,e,l),ds(t,e,l))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=ol(),l=oa(n);l.tag=2,t!=null&&(l.callback=t),t=aa(e,l,n),t!==null&&(Qn(t,e,n),ds(t,e,n))}};function ng(e,t,n,l,o,a,i){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(l,a,i):t.prototype&&t.prototype.isPureReactComponent?!Ss(n,l)||!Ss(o,a):!0}function lg(e,t,n,l){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,l),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,l),t.state!==e&&Lf.enqueueReplaceState(t,t.state,null)}function ti(e,t){var n=t;if("ref"in t){n={};for(var l in t)l!=="ref"&&(n[l]=t[l])}if(e=e.defaultProps){n===t&&(n=Nt({},n));for(var o in e)n[o]===void 0&&(n[o]=e[o])}return n}function Dp(e){Su(e)}function zp(e){console.error(e)}function Op(e){Su(e)}function Ou(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(l){setTimeout(function(){throw l})}}function og(e,t,n){try{var l=e.onCaughtError;l(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Bf(e,t,n){return n=oa(n),n.tag=3,n.payload={element:null},n.callback=function(){Ou(e,t)},n}function Lp(e){return e=oa(e),e.tag=3,e}function Bp(e,t,n,l){var o=n.type.getDerivedStateFromError;if(typeof o=="function"){var a=l.value;e.payload=function(){return o(a)},e.callback=function(){og(t,n,l)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(e.callback=function(){og(t,n,l),typeof o!="function"&&(sa===null?sa=new Set([this]):sa.add(this));var r=l.stack;this.componentDidCatch(l.value,{componentStack:r!==null?r:""})})}function Px(e,t,n,l,o){if(n.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){if(t=n.alternate,t!==null&&Za(t,n,o,!0),n=vn.current,n!==null){switch(n.tag){case 31:case 13:case 19:return Nn===null?Iu():n.alternate===null&&Gt===0&&(Gt=3),n.flags&=-257,n.flags|=65536,n.lanes=o,l===Tu?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([l]):t.add(l),K_(e,l,o)),!1;case 22:return n.flags|=65536,l===Tu?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([l])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([l]):n.add(l)),K_(e,l,o)),!1}throw Error(H(435,n.tag))}return K_(e,l,o),Iu(),!1}if(Ue)return t=vn.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,l!==kf&&(e=Error(H(422),{cause:l}),Cs(xl(e,n)))):(l!==kf&&(t=Error(H(423),{cause:l}),Cs(xl(t,n))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,l=xl(l,n),o=Bf(e.stateNode,l,o),I_(e,o),Gt!==4&&(Gt=2)),!1;var a=Error(H(520),{cause:l});if(a=xl(a,n),ps===null?ps=[a]:ps.push(a),Gt!==4&&(Gt=2),t===null)return!0;l=xl(l,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=o&-o,n.lanes|=e,e=Bf(n.stateNode,l,e),I_(n,e),!1;case 1:if(t=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(sa===null||!sa.has(a))))return n.flags|=65536,o&=-o,n.lanes|=o,o=Lp(o),Bp(o,e,n,l),I_(n,o),!1;break;case 22:if(n.memoizedState!==null)return n.flags|=65536,!1}n=n.return}while(n!==null);return!1}var F0=Error(H(461)),Jt=!1;function nn(e,t,n,l){t.child=e===null?Zy(t,null,n,l):Pa(t,e.child,n,l)}function ag(e,t,n,l,o){n=n.render;var a=t.ref;if("ref"in l){var i={};for(var r in l)r!=="ref"&&(i[r]=l[r])}else i=l;return Ka(t),l=$0(e,t,n,i,a,o),r=U0(),e!==null&&!Jt?(Y0(e,t,o),Do(e,t,o)):(Ue&&r&&ed(t),t.flags|=1,nn(e,t,l,o),t.child)}function ig(e,t,n,l,o){if(e===null){var a=n.type;return typeof a=="function"&&!N0(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Hp(e,t,a,l,o)):(e=lu(n.type,null,l,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!K0(e,o)){var i=a.memoizedProps;if(n=n.compare,n=n!==null?n:Ss,n(i,l)&&e.ref===t.ref)return Do(e,t,o)}return t.flags|=1,e=Mo(a,l),e.ref=t.ref,e.return=t,t.child=e}function Hp(e,t,n,l,o){if(e!==null){var a=e.memoizedProps;if(Ss(a,l)&&e.ref===t.ref)if(Jt=!1,t.pendingProps=l=a,K0(e,o))(e.flags&131072)!==0&&(Jt=!0);else return t.lanes=e.lanes,Do(e,t,o)}return Hf(e,t,n,l,o)}function $p(e,t,n,l){var o=l.children,a=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),l.mode==="hidden"){if((t.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,e!==null){for(l=t.child=e.child,o=0;l!==null;)o=o|l.lanes|l.childLanes,l=l.sibling;l=o&~a}else l=0,t.child=null;return rg(e,t,a,n,l)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&au(t,a!==null?a.cachePool:null),a!==null?F1(t,a):Rf(),Py(t);else return l=t.lanes=536870912,rg(e,t,a!==null?a.baseLanes|n:n,n,l)}else a!==null?(au(t,a.cachePool),F1(t,a),ra(),t.memoizedState=null):(e!==null&&au(t,null),Rf(),ra());return nn(e,t,o,n),t.child}function ms(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function rg(e,t,n,l,o){var a=D0();return a=a===null?null:{parent:Kt._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&au(t,null),Rf(),Py(t),e!==null&&Za(e,t,l,!0),t.childLanes=o,null}function su(e,t){return t=id({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function sg(e,t,n){return Pa(t,e.child,null,n),e=su(t,t.pendingProps),e.flags|=2,Jn(t),t.memoizedState=null,e}function ew(e,t,n){var l=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(Ue){if(l.mode==="hidden")return e=su(t,l),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},ms(null,e);if(Af(t),(e=Lt)?(e=$5(e,wl),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:_a!==null?{id:no,overflow:lo}:null,retryLane:536870912,hydrationErrors:null},n=Xy(e),n.return=t,t.child=n,cn=t,Lt=null)):e=null,e===null)throw fa(t);return t.lanes=536870912,null}return su(t,l)}var a=e.memoizedState;if(a!==null){var i=a.dehydrated;if(Af(t),o)if(t.flags&256)t.flags&=-257,t=sg(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(H(558));else if(Jt||Za(e,t,n,!1),o=(n&e.childLanes)!==0,Jt||o){if(ha.current===null){if(l=Tt,l!==null&&(i=hy(l,n),i!==0&&i!==a.retryLane))throw a.retryLane=i,ii(e,i),Qn(l,e,i),F0;Iu()}t=sg(e,t,n)}else e=a.treeContext,Lt=Sl(i.nextSibling),cn=t,Ue=!0,la=null,wl=!1,e!==null&&Qy(t,e),t=su(t,l),t.flags|=134221824;return t}return e=Mo(e.child,{mode:l.mode,children:l.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Ri(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(H(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Hf(e,t,n,l,o){return Ka(t),n=$0(e,t,n,l,void 0,o),l=U0(),e!==null&&!Jt?(Y0(e,t,o),Do(e,t,o)):(Ue&&l&&ed(t),t.flags|=1,nn(e,t,n,o),t.child)}function cg(e,t,n,l,o,a){return Ka(t),t.updateQueue=null,n=tp(t,l,n,o),ep(e),l=U0(),e!==null&&!Jt?(Y0(e,t,a),Do(e,t,a)):(Ue&&l&&ed(t),t.flags|=1,nn(e,t,n,a),t.child)}function ug(e,t,n,l,o){if(Ka(t),t.stateNode===null){var a=ji,i=n.contextType;typeof i=="object"&&i!==null&&(a=gn(i)),a=new n(l,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Lf,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=l,a.state=t.memoizedState,a.refs={},O0(t),i=n.contextType,a.context=typeof i=="object"&&i!==null?gn(i):ji,a.state=t.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(q_(t,n,i,l),a.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(i=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),i!==a.state&&Lf.enqueueReplaceState(a,a.state,null),fs(t,l,a,o),_s(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),l=!0}else if(e===null){a=t.stateNode;var r=t.memoizedProps,s=ti(n,r);a.props=s;var d=a.context,f=n.contextType;i=ji,typeof f=="object"&&f!==null&&(i=gn(f));var h=n.getDerivedStateFromProps;f=typeof h=="function"||typeof a.getSnapshotBeforeUpdate=="function",r=t.pendingProps!==r,f||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(r||d!==i)&&lg(t,a,l,i),Wo=!1;var _=t.memoizedState;a.state=_,fs(t,l,a,o),_s(),d=t.memoizedState,r||_!==d||Wo?(typeof h=="function"&&(q_(t,n,h,l),d=t.memoizedState),(s=Wo||ng(t,n,s,l,_,d,i))?(f||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=l,t.memoizedState=d),a.props=l,a.state=d,a.context=i,l=s):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),l=!1)}else{a=t.stateNode,Tf(e,t),i=t.memoizedProps,f=ti(n,i),a.props=f,h=t.pendingProps,_=a.context,d=n.contextType,s=ji,typeof d=="object"&&d!==null&&(s=gn(d)),r=n.getDerivedStateFromProps,(d=typeof r=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(i!==h||_!==s)&&lg(t,a,l,s),Wo=!1,_=t.memoizedState,a.state=_,fs(t,l,a,o),_s();var b=t.memoizedState;i!==h||_!==b||Wo||e!==null&&e.dependencies!==null&&Eu(e.dependencies)?(typeof r=="function"&&(q_(t,n,r,l),b=t.memoizedState),(f=Wo||ng(t,n,f,l,_,b,s)||e!==null&&e.dependencies!==null&&Eu(e.dependencies))?(d||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(l,b,s),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(l,b,s)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||i===e.memoizedProps&&_===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===e.memoizedProps&&_===e.memoizedState||(t.flags|=1024),t.memoizedProps=l,t.memoizedState=b),a.props=l,a.state=b,a.context=s,l=f):(typeof a.componentDidUpdate!="function"||i===e.memoizedProps&&_===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===e.memoizedProps&&_===e.memoizedState||(t.flags|=1024),l=!1)}return a=l,Ri(e,t),l=(t.flags&128)!==0,a||l?(a=t.stateNode,n=l&&typeof n.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,e!==null&&l?(t.child=Pa(t,e.child,null,o),t.child=Pa(t,null,n,o)):nn(e,t,n,o),t.memoizedState=a.state,e=t.child):e=Do(e,t,o),e}function dg(e,t,n,l){return Fa(),t.flags|=256,nn(e,t,n,l),t.child}var $f={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Uf(e){return{baseLanes:e,cachePool:Vy()}}function Yf(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=el),e}function Up(e,t,n){var l=t.pendingProps,o=!1,a=(t.flags&128)!==0,i;if((i=a)||(i=e!==null&&e.memoizedState===null?!1:(pn.current&2)!==0),i&&(o=!0,t.flags&=-129),i=(t.flags&32)!==0,t.flags&=-33,e===null){if(Ue){if(o?ia(t):ra(),(e=Lt)?(e=$5(e,wl),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:_a!==null?{id:no,overflow:lo}:null,retryLane:536870912,hydrationErrors:null},n=Xy(e),n.return=t,t.child=n,cn=t,Lt=null)):e=null,e===null)throw fa(t);return ch(e)?t.lanes=32:t.lanes=536870912,null}return a=l.children,l=l.fallback,o?(ra(),o=t.mode,a=id({mode:"hidden",children:a},o),l=Qa(l,o,n,null),a.return=t,l.return=t,a.sibling=l,t.child=a,l=t.child,l.memoizedState=Uf(n),l.childLanes=Yf(e,i,n),t.memoizedState=$f,ms(null,l)):(ia(t),Z0(t,a))}var r=e.memoizedState;if(r!==null){var s=r.dehydrated;if(s!==null)return tw(e,t,a,i,l,s,r,n)}return o?(ra(),o=l.fallback,a=t.mode,r=e.child,s=r.sibling,l=Mo(r,{mode:"hidden",children:l.children}),l.subtreeFlags=r.subtreeFlags&1206910976,s!==null?o=Mo(s,o):(o=Qa(o,a,n,null),o.flags|=2),o.return=t,l.return=t,l.sibling=o,t.child=l,ms(null,l),l=t.child,o=e.child.memoizedState,o===null?o=Uf(n):(a=o.cachePool,a!==null?(r=Kt._currentValue,a=a.parent!==r?{parent:r,pool:r}:a):a=Vy(),o={baseLanes:o.baseLanes|n,cachePool:a}),l.memoizedState=o,l.childLanes=Yf(e,i,n),t.memoizedState=$f,ms(e.child,l)):(ia(t),n=e.child,e=n.sibling,n=Mo(n,{mode:"visible",children:l.children}),n.return=t,n.sibling=null,e!==null&&(i=t.deletions,i===null?(t.deletions=[e],t.flags|=16):i.push(e)),t.child=n,t.memoizedState=null,n)}function Z0(e,t){return t=id({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function id(e,t){return e=qn(22,e,null,t),e.lanes=0,e}function Xc(e,t,n){return Pa(t,e.child,null,n),e=Z0(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function tw(e,t,n,l,o,a,i,r){if(n)return t.flags&256?(ia(t),t.flags&=-257,Xc(e,t,r)):t.memoizedState!==null?(ra(),t.child=e.child,t.flags|=128,null):(ra(),a=o.fallback,i=t.mode,o=id({mode:"visible",children:o.children},i),a=Qa(a,i,r,null),a.flags|=2,o.return=t,a.return=t,o.sibling=a,t.child=o,Pa(t,e.child,null,r),o=t.child,o.memoizedState=Uf(r),o.childLanes=Yf(e,l,r),t.memoizedState=$f,ms(null,o));if(ia(t),ch(a)){if(l=a.nextSibling&&a.nextSibling.dataset,l)var s=l.dgst;return l=s,l!==""&&(o=Error(H(419)),o.stack="",o.digest=l,Cs({value:o,source:null,stack:null})),Xc(e,t,r)}if(Jt||Za(e,t,r,!1),l=(r&e.childLanes)!==0,Jt||l){if(ha.current!==null)return Xc(e,t,r);if(l=Tt,l!==null&&(o=hy(l,r),o!==0&&o!==i.retryLane))throw i.retryLane=o,ii(e,o),Qn(l,e,o),F0;return d0(a)||Iu(),Xc(e,t,r)}return d0(a)?(t.flags|=192,t.child=e.child,null):(e=i.treeContext,Lt=Sl(a.nextSibling),cn=t,Ue=!0,la=null,wl=!1,e!==null&&Qy(t,e),t=Z0(t,o.children),t.flags|=134221824,t)}function _g(e,t,n){e.lanes|=t;var l=e.alternate;l!==null&&(l.lanes|=t),ou(e.return,t,n)}function fg(e){for(var t=null;e!==null;){var n=e.alternate;n!==null&&Ru(n)===null&&(t=e),e=e.sibling}return t}function qc(e,t,n,l,o,a){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:l,tail:n,tailMode:o,treeForkCount:a}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=l,i.tail=n,i.tailMode=o,i.treeForkCount=a)}function Q_(e){var t=e.child;for(e.child=null;t!==null;){var n=t.sibling;t.sibling=e.child,e.child=t,t=n}}function jf(e,t,n){var l=t.pendingProps,o=l.revealOrder,a=l.tail;l=l.children;var i=pn.current;if(t.flags&128)return Es(t,i),null;var r=(i&2)!==0;if(r?(i=i&1|2,t.flags|=128):i&=1,Es(t,i),o==="backwards"&&e!==null?(Q_(e),nn(e,t,l,n),Q_(e)):nn(e,t,l,n),l=Ue?ks:0,!r&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&_g(e,n,t);else if(e.tag===19)_g(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":n=fg(t.child),n===null?(o=t.child,t.child=null):(o=n.sibling,n.sibling=null,Q_(t)),qc(t,!0,o,null,a,l);break;case"unstable_legacy-backwards":for(n=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Ru(e)===null){t.child=o;break}e=o.sibling,o.sibling=n,n=o,o=e}qc(t,!0,n,null,a,l);break;case"together":qc(t,!1,null,null,void 0,l);break;case"independent":t.memoizedState=null;break;default:n=fg(t.child),n===null?(o=t.child,t.child=null):(o=n.sibling,n.sibling=null),qc(t,!1,o,n,a,l)}return t.child}function hg(e,t,n){var l=t.pendingProps;return Jo(t,t.type,l.value),nn(e,t,l.children,n),t.child}function Do(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),ga|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(Za(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(H(153));if(t.child!==null){for(e=t.child,n=Mo(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Mo(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function K0(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Eu(e)))}function nw(e,t,n){switch(t.tag){case 3:bu(t,t.stateNode.containerInfo),Jo(t,Kt,e.memoizedState.cache),Fa();break;case 27:case 5:hf(t);break;case 4:bu(t,t.stateNode.containerInfo);break;case 10:Jo(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Af(t),null;break;case 13:var l=t.memoizedState;if(l!==null){if(l.dehydrated!==null)return ia(t),t.flags|=128,null;l=Za(e,t,n,!1);var o=t.child.childLanes;return l||(n&o)!==0?Up(e,t,n):(ia(t),e=Do(e,t,n),e!==null?e.sibling:null)}ia(t);break;case 19:if(t.flags&128)return jf(e,t,n);if(o=(e.flags&128)!==0,l=(n&t.childLanes)!==0,l||(Za(e,t,n,!1),l=(n&t.childLanes)!==0),o){if(l)return jf(e,t,n);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Es(t,pn.current),l)break;return null;case 22:return t.lanes=0,$p(e,t,n,t.pendingProps);case 24:Jo(t,Kt,e.memoizedState.cache)}return Do(e,t,n)}function Yp(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)Jt=!0;else{if(!K0(e,n)&&(t.flags&128)===0)return Jt=!1,nw(e,t,n);Jt=(e.flags&131072)!==0}else Jt=!1,Ue&&(t.flags&1048576)!==0&&qy(t,ks,t.index);switch(t.lanes=0,t.tag){case 16:e:{var l=t.pendingProps;if(e=Ya(t.elementType),t.type=e,typeof e=="function")N0(e)?(l=ti(e,l),t.tag=1,t=ug(null,t,e,l,n)):(t.tag=0,t=Hf(null,t,e,l,n));else{if(e!=null){var o=e.$$typeof;if(o===g0){t.tag=11,t=ag(null,t,e,l,n);break e}else if(o===y0){t.tag=14,t=ig(null,t,e,l,n);break e}else if(o===eo){t.tag=10,t.type=e,t=hg(null,t,n);break e}}throw t=_f(e)||e,Error(H(306,t,""))}}return t;case 0:return Hf(e,t,t.type,t.pendingProps,n);case 1:return l=t.type,o=ti(l,t.pendingProps),ug(e,t,l,o,n);case 3:e:{if(bu(t,t.stateNode.containerInfo),e===null)throw Error(H(387));l=t.pendingProps;var a=t.memoizedState;o=a.element,Tf(e,t),fs(t,l,null,n);var i=t.memoizedState;if(l=i.cache,Jo(t,Kt,l),l!==a.cache&&Mf(t,[Kt],n,!0),_s(),l=i.element,a.isDehydrated)if(a={element:l,isDehydrated:!1,cache:i.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=dg(e,t,l,n);break e}else if(l!==o){o=xl(Error(H(424)),t),Cs(o),t=dg(e,t,l,n);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Lt=Sl(e.firstChild),cn=t,Ue=!0,la=null,wl=!0,n=Zy(t,null,l,n),t.child=n;n;)n.flags=n.flags&-3|134221824,n=n.sibling;else{if(Fa(),l===o){t=Do(e,t,n);break e}nn(e,t,l,n)}t=t.child}return t;case 26:return Ri(e,t),e===null?(n=jg(t.type,null,t.pendingProps,null))?t.memoizedState=n:Ue||(t.stateNode=N5(t.type,t.pendingProps,na.current,t)):t.memoizedState=jg(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return hf(t),e===null&&Ue&&(l=t.stateNode=U5(t.type,t.pendingProps,na.current),cn=t,wl=!0,o=Lt,pa(t.type)?(_0=o,Lt=Sl(l.firstChild)):Lt=o),nn(e,t,t.pendingProps.children,n),Ri(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&Ue&&((o=l=Lt)&&(l=Ww(l,t.type,t.pendingProps,wl),l!==null?(t.stateNode=l,cn=t,Lt=Sl(l.firstChild),wl=!1,o=!0):o=!1),o||fa(t)),hf(t),o=t.type,a=t.pendingProps,i=e!==null?e.memoizedProps:null,l=a.children,s0(o,a)?l=null:i!==null&&s0(o,i)&&(t.flags|=32),t.memoizedState!==null&&(o=$0(e,t,Qx,null,null,n),dr._currentValue=o),Ri(e,t),nn(e,t,l,n),t.child;case 6:return e===null&&Ue&&((e=n=Lt)&&(n=Fw(n,t.pendingProps,wl),n!==null?(t.stateNode=n,cn=t,Lt=null,e=!0):e=!1),e||fa(t)),null;case 13:return Up(e,t,n);case 4:return bu(t,t.stateNode.containerInfo),l=t.pendingProps,e===null?t.child=Pa(t,null,l,n):nn(e,t,l,n),t.child;case 11:return ag(e,t,t.type,t.pendingProps,n);case 7:return l=t.pendingProps,Ri(e,t),nn(e,t,l,n),t.child;case 8:return nn(e,t,t.pendingProps.children,n),t.child;case 12:return nn(e,t,t.pendingProps.children,n),t.child;case 10:return hg(e,t,n);case 9:return o=t.type._context,l=t.pendingProps.children,Ka(t),o=gn(o),l=l(o),t.flags|=1,nn(e,t,l,n),t.child;case 14:return ig(e,t,t.type,t.pendingProps,n);case 15:return Hp(e,t,t.type,t.pendingProps,n);case 19:return jf(e,t,n);case 31:return ew(e,t,n);case 22:return $p(e,t,n,t.pendingProps);case 24:return Ka(t),l=gn(Kt),e===null?(o=D0(),o===null&&(o=Tt,a=A0(),o.pooledCache=a,a.refCount++,a!==null&&(o.pooledCacheLanes|=n),o=a),t.memoizedState={parent:l,cache:o},O0(t),Jo(t,Kt,o)):((e.lanes&n)!==0&&(Tf(e,t),fs(t,null,null,n),_s()),o=e.memoizedState,a=t.memoizedState,o.parent!==l?(o={parent:l,cache:l},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),Jo(t,Kt,l)):(l=a.cache,Jo(t,Kt,l),l!==o.cache&&Mf(t,[Kt],n,!0))),nn(e,t,t.pendingProps.children,n),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),l=t.pendingProps,l.name!=null&&l.name!=="auto"?t.flags|=e===null?18882560:18874368:Ue&&ed(t),e!==null&&e.memoizedProps.name!==l.name?t.flags|=4194816:Ri(e,t),nn(e,t,l.children,n),t.child;case 29:throw t.pendingProps}throw Error(H(156,t.tag))}function So(e){e.flags|=4}function G_(e,t,n,l,o){var a;if((a=(e.mode&32)!==0)&&(a=n===null?qg(t,l):qg(t,l)&&(l.src!==n.src||l.srcSet!==n.srcSet)),a){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(m5())e.flags|=8192;else throw Va=Tu,z0}else e.flags&=-16777217}function mg(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!X5(t))if(m5())e.flags|=8192;else throw Va=Tu,z0}function Qc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?dy():536870912,e.lanes|=t,ar|=t)}function Jr(e,t){if(!Ue)switch(e.tailMode){case"visible":break;case"collapsed":for(var n=e.tail,l=null;n!==null;)n.alternate!==null&&(l=n),n=n.sibling;l===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:l.sibling=null;break;default:for(t=e.tail,n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null}}function Ot(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,l=0;if(t)for(var o=e.child;o!==null;)n|=o.lanes|o.childLanes,l|=o.subtreeFlags&1206910976,l|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)n|=o.lanes|o.childLanes,l|=o.subtreeFlags,l|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=l,e.childLanes=n,t}function lw(e,t,n){var l=t.pendingProps;switch(R0(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ot(t),null;case 1:return Ot(t),null;case 3:return n=t.stateNode,l=null,e!==null&&(l=e.memoizedState.cache),t.memoizedState.cache!==l&&(t.flags|=2048),Eo(Kt),tr(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Ti(t)?So(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,j_())),Ot(t),null;case 26:var o=t.type,a=t.memoizedState;return e===null?(So(t),a!==null?(Ot(t),mg(t,a)):(Ot(t),G_(t,o,null,l,n))):a?a!==e.memoizedState?(So(t),Ot(t),mg(t,a)):(Ot(t),t.flags&=-16777217):(e=e.memoizedProps,e!==l&&So(t),Ot(t),G_(t,o,e,l,n)),null;case 27:if(vu(t),n=na.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==l&&So(t);else{if(!l){if(t.stateNode===null)throw Error(H(166));return Ot(t),t.subtreeFlags&=-33554433,null}e=oo.current,Ti(t)?I1(t,e):(e=U5(o,l,n),t.stateNode=e,So(t))}return Ot(t),t.subtreeFlags&=-33554433,null;case 5:if(vu(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==l&&So(t);else{if(!l){if(t.stateNode===null)throw Error(H(166));return Ot(t),t.subtreeFlags&=-33554433,null}if(a=oo.current,Ti(t))I1(t,a);else{var i=As(na.current);switch(a){case 1:a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":a=i.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof l.is=="string"?i.createElement("select",{is:l.is}):i.createElement("select"),l.multiple?a.multiple=!0:l.size&&(a.size=l.size);break;default:a=typeof l.is=="string"?i.createElement(o,{is:l.is}):i.createElement(o)}}a[mn]=t,a[Vn]=l;e:for(i=t.child;i!==null;){if(i.tag===5||i.tag===6)a.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===t)break e;for(;i.sibling===null;){if(i.return===null||i.return===t)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}t.stateNode=a;e:switch(bn(a,o,l),o){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break e;case"img":l=!0;break e;default:l=!1}l&&So(t)}}return Ot(t),t.subtreeFlags&=-33554433,G_(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==l&&So(t);else{if(typeof l!="string"&&t.stateNode===null)throw Error(H(166));if(e=na.current,Ti(t)){if(e=t.stateNode,n=t.memoizedProps,l=null,o=cn,o!==null)switch(o.tag){case 27:case 5:l=o.memoizedProps}e[mn]=t,e=!!(e.nodeValue===n||l!==null&&l.suppressHydrationWarning===!0||E5(e.nodeValue,n)),e||fa(t,!0)}else e=As(e).createTextNode(l),e[mn]=t,t.stateNode=e}return Ot(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(l=Ti(t),n!==null){if(e===null){if(!l)throw Error(H(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(H(557));e[mn]=t}else Fa(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ot(t),e=!1}else n=j_(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(Jn(t),t):(Jn(t),null);if((t.flags&128)!==0)throw Error(H(558))}return Ot(t),null;case 13:if(l=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=Ti(t),l!==null&&l.dehydrated!==null){if(e===null){if(!o)throw Error(H(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(H(317));o[mn]=t}else Fa(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ot(t),o=!1}else o=j_(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(Jn(t),t):(Jn(t),null)}return Jn(t),(t.flags&128)!==0?(t.lanes=n,t):(n=l!==null,e=e!==null&&e.memoizedState!==null,n&&(l=t.child,o=null,l.alternate!==null&&l.alternate.memoizedState!==null&&l.alternate.memoizedState.cachePool!==null&&(o=l.alternate.memoizedState.cachePool.pool),a=null,l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(a=l.memoizedState.cachePool.pool),a!==o&&(l.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Qc(t,t.updateQueue),Ot(t),null);case 4:return tr(),e===null&&ih(t.stateNode.containerInfo),t.flags|=67108864,Ot(t),null;case 10:return Eo(t.type),Ot(t),null;case 19:if(B0(t),l=t.memoizedState,l===null)return Ot(t),null;if(o=(t.flags&128)!==0,a=l.rendering,a===null)if(o)Jr(l,!1);else{if(Gt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(a=Ru(e),a!==null){for(t.flags|=128,Jr(l,!1),e=a.updateQueue,t.updateQueue=e,Qc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)Iy(n,e),n=n.sibling;return Es(t,pn.current&1|2),Ue&&ko(t,l.treeForkCount),t.child}e=e.sibling}l.tail!==null&&tl()>Yu&&(t.flags|=128,o=!0,Jr(l,!1),t.lanes=4194304)}else{if(!o)if(e=Ru(a),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,Qc(t,e),Jr(l,!0),l.tail===null&&l.tailMode!=="collapsed"&&l.tailMode!=="visible"&&!a.alternate&&!Ue)return Ot(t),null}else 2*tl()-l.renderingStartTime>Yu&&n!==536870912&&(t.flags|=128,o=!0,Jr(l,!1),t.lanes=4194304);l.isBackwards?(a.sibling=t.child,t.child=a):(e=l.last,e!==null?e.sibling=a:t.child=a,l.last=a)}if(l.tail!==null){e=l.tail;e:{for(n=e;n!==null;){if(n.alternate!==null){n=!1;break e}n=n.sibling}n=!0}return l.rendering=e,l.tail=e.sibling,l.renderingStartTime=tl(),e.sibling=null,a=pn.current,a=o?a&1|2:a&1,l.tailMode==="visible"||l.tailMode==="collapsed"||!n||Ue?Es(t,a):(n=a,Bt(vn,t),Bt(pn,n),Nn===null&&(Nn=t)),Ue&&ko(t,l.treeForkCount),e}return Ot(t),null;case 22:case 23:return Jn(t),L0(),l=t.memoizedState!==null,e!==null?e.memoizedState!==null!==l&&(t.flags|=8192):l&&(t.flags|=8192),l?(n&536870912)!==0&&(t.flags&128)===0&&(Ot(t),t.subtreeFlags&6&&(t.flags|=8192)):Ot(t),n=t.updateQueue,n!==null&&Qc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),l=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(l=t.memoizedState.cachePool.pool),l!==n&&(t.flags|=2048),e!==null&&yn(Ga),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Eo(Kt),Ot(t),null;case 25:return null;case 30:return t.flags|=33554432,Ot(t),null}throw Error(H(156,t.tag))}function ow(e,t){switch(R0(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Eo(Kt),tr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return vu(t),null;case 31:if(t.memoizedState!==null){if(Jn(t),t.alternate===null)throw Error(H(340));Fa()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Jn(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(H(340));Fa()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return B0(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return tr(),null;case 10:return Eo(t.type),null;case 22:case 23:return Jn(t),L0(),e!==null&&yn(Ga),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Eo(Kt),null;case 25:return null;default:return null}}function jp(e,t){switch(R0(t),t.tag){case 3:Eo(Kt),tr();break;case 26:case 27:case 5:vu(t);break;case 4:tr();break;case 31:t.memoizedState!==null&&Jn(t);break;case 13:Jn(t);break;case 19:B0(t);break;case 10:Eo(t.type);break;case 22:case 23:Jn(t),L0(),e!==null&&yn(Ga);break;case 24:Eo(Kt)}}function qs(e,t){try{var n=t.updateQueue,l=n!==null?n.lastEffect:null;if(l!==null){var o=l.next;n=o;do{if((n.tag&e)===e){l=void 0;var a=n.create,i=n.inst;l=a(),i.destroy=l}n=n.next}while(n!==o)}}catch(r){xt(t,t.return,r)}}function ma(e,t,n){try{var l=t.updateQueue,o=l!==null?l.lastEffect:null;if(o!==null){var a=o.next;l=a;do{if((l.tag&e)===e){var i=l.inst,r=i.destroy;if(r!==void 0){i.destroy=void 0,o=t;var s=n,d=r;try{d()}catch(f){xt(o,s,f)}}}l=l.next}while(l!==a)}}catch(f){xt(t,t.return,f)}}function Ip(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Jy(t,n)}catch(l){xt(e,e.return,l)}}}function Xp(e,t,n){n.props=ti(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(l){xt(e,t,l)}}function Jl(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var l=e.stateNode;break;case 30:var o=e.stateNode,a=No(e.memoizedProps,o);(o.ref===null||o.ref.name!==a)&&(o.ref=z5(a)),l=o.ref;break;case 7:if(e.stateNode===null){var i=new il(e);Gn(e.child,!1,Gw,i,void 0,void 0),e.stateNode=i}l=e.stateNode;break;default:l=e.stateNode}typeof n=="function"?e.refCleanup=n(l):n.current=l}}catch(r){xt(e,t,r)}}function hn(e,t){var n=e.ref,l=e.refCleanup;if(n!==null)if(typeof l=="function")try{l()}catch(o){xt(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(o){xt(e,t,o)}else n.current=null}function Lu(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var n=0;n<t.length;n++)H5(e.stateNode,t[n])}function gg(e){for(var t=e.return;t!==null&&(P0(t)&&H5(e.stateNode,t.stateNode),!J0(t));)t=t.return}function gs(e){for(var t=e.return;t!==null&&(P0(t)&&Vw(e.stateNode,t.stateNode),!J0(t));)t=t.return}function J0(e){return e.tag===5||e.tag===3||e.tag===27}function P0(e){return e&&e.tag===7&&e.stateNode!==null}function If(e){var t=e.type,n=e.memoizedProps,l=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&l.focus();break e;case"img":n.src?l.src=n.src:n.srcSet&&(l.srcset=n.srcSet)}}catch(o){xt(e,e.return,o)}}function V_(e,t,n){try{var l=e.stateNode;Tw(l,e.type,n,t),l[Vn]=t}catch(o){xt(e,e.return,o)}}function qp(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&pa(e.type)||e.tag===4}function W_(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||qp(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&pa(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Xf(e,t,n,l){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(o,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(o),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=to)),Lu(e,l),rt=!0;else if(o!==4&&(o===27&&(Lu(e,l),l=null,pa(e.type)&&(n=e.stateNode,t=null)),e=e.child,e!==null))for(Xf(e,t,n,l),e=e.sibling;e!==null;)Xf(e,t,n,l),e=e.sibling}function Bu(e,t,n,l){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?n.insertBefore(o,t):n.appendChild(o),Lu(e,l),rt=!0;else if(o!==4&&(o===27&&(Lu(e,l),l=null,pa(e.type)&&(n=e.stateNode)),e=e.child,e!==null))for(Bu(e,t,n,l),e=e.sibling;e!==null;)Bu(e,t,n,l),e=e.sibling}function Qp(e){var t=e.stateNode,n=e.memoizedProps;try{for(var l=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);bn(t,l,n),t[mn]=e,t[Vn]=n}catch(a){xt(e,e.return,a)}}var Hu=!1,Pn=null;function yg(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Hu=!0)}var Pl=null;function pg(){var e=Pl;return Pl=null,e}var Xn=0;function yr(e,t,n,l,o){return Xn=0,Gp(e.child,t,n,l,o)}function Gp(e,t,n,l,o){for(var a=!1;e!==null;){if(e.tag===5){var i=e.stateNode;if(l!==null){var r=c0(i);l.push(r),r.view&&(a=!0)}else a||c0(i).view&&(a=!0);Hu=!0,R5(i,Xn===0?t:t+"_"+Xn,n),Xn++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||Gp(e.child,t,n,l,o)&&(a=!0));e=e.sibling}return a}function io(e,t){for(;e!==null;)e.tag===5?A5(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||io(e.child,t)),e=e.sibling}function cu(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(cu(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(H(544));var n=t.name;t=Lo(t.default,t.share),t!=="none"&&(yr(e,n,t,null,!1)||io(e.child,!1))}e=e.sibling}}function qf(e,t){if(e.tag===30){var n=e.stateNode,l=e.memoizedProps,o=No(l,n),a=Lo(l.default,n.paired?l.share:l.enter);a!=="none"?yr(e,o,a,null,!1)?(cu(e),n.paired||t||ir(e,l.onEnter)):io(e.child,!1):cu(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)qf(e,t),e=e.sibling;else cu(e)}function Qf(e){if(Pn!==null&&Pn.size!==0){var t=Pn;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var n=e.memoizedProps,l=n.name;if(l!=null&&l!=="auto"){var o=t.get(l);if(o!==void 0){var a=Lo(n.default,n.share);if(a!=="none"&&(yr(e,l,a,null,!1)?(a=e.stateNode,o.paired=a,a.paired=o,ir(e,n.onShare)):io(e.child,!1)),t.delete(l),t.size===0)break}}}Qf(e)}e=e.sibling}}}function Gf(e){if(e.tag===30){var t=e.memoizedProps,n=No(t,e.stateNode),l=Pn!==null?Pn.get(n):void 0,o=Lo(t.default,l!==void 0?t.share:t.exit);o!=="none"&&(yr(e,n,o,null,!1)?l!==void 0?(o=e.stateNode,l.paired=o,o.paired=l,Pn.delete(n),ir(e,t.onShare)):ir(e,t.onExit):io(e.child,!1)),Pn!==null&&Qf(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Gf(e),e=e.sibling;else Pn!==null&&Qf(e)}function Vp(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,n=No(t,e.stateNode);t=Lo(t.default,t.update),e.flags&=-5,t!=="none"&&yr(e,n,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Vp(e);e=e.sibling}}function Vf(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,io(e.child,!1))}Vf(e)}e=e.sibling}}function uu(e){if(e.tag===30)e.stateNode.paired=null,io(e.child,!1),Vf(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)uu(e),e=e.sibling;else Vf(e)}function Wp(e){for(e=e.child;e!==null;)e.tag===30?io(e.child,!1):(e.subtreeFlags&33554432)!==0&&Wp(e),e=e.sibling}function eh(e,t,n,l,o,a,i){for(var r=!1;t!==null;){if(t.tag===5){var s=t.stateNode;if(a!==null&&Xn<a.length){var d=a[Xn],f=c0(s);(d.view||f.view)&&(r=!0);var h;if(h=(e.flags&4)===0)if(f.clip)h=!0;else{h=d.rect;var _=f.rect;h=h.y!==_.y||h.x!==_.x||h.height!==_.height||h.width!==_.width}h&&(e.flags|=4),f.abs?f=!d.abs:(d=d.rect,f=f.rect,f=d.height!==f.height||d.width!==f.width),f&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&R5(s,Xn===0?n:n+"_"+Xn,o),r&&(e.flags&4)!==0||(Pl===null&&(Pl=[]),Pl.push(s,Xn===0?l:l+"_"+Xn,t.memoizedProps)),Xn++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&i?e.flags|=t.flags&32:eh(e,t.child,n,l,o,a,i)&&(r=!0));t=t.sibling}return r}function Fp(e,t){for(e=e.child;e!==null;){if(e.tag===30){var n=e.memoizedProps,l=e.stateNode,o=No(n,l),a=Lo(n.default,n.update);if(t){l=l.clones;var i=l===null?null:l.map(Ow)}else i=e.memoizedState,e.memoizedState=null;l=e;var r=e.child;Xn=0,o=eh(l,r,o,o,a,i,!1),(e.flags&4)!==0&&o&&(t||ir(e,n.onUpdate))}else(e.subtreeFlags&33554432)!==0&&Fp(e,t);e=e.sibling}}var an=!1,yt=!1,Fl=!1,F_=!1,bg=typeof WeakSet=="function"?WeakSet:Set,rn=null,Zl=!1,is=!1,$u=!1,Wf=!1;function aw(e,t,n){if(e=e.containerInfo,i0=_r,e=Oy(e),M0(e)){if("selectionStart"in e)var l={start:e.selectionStart,end:e.selectionEnd};else e:{l=(l=e.ownerDocument)&&l.defaultView||window;var o=l.getSelection&&l.getSelection();if(o&&o.rangeCount!==0){l=o.anchorNode;var a=o.anchorOffset,i=o.focusNode;o=o.focusOffset;try{l.nodeType,i.nodeType}catch{l=null;break e}var r=0,s=-1,d=-1,f=0,h=0,_=e,b=null;t:for(;;){for(var w;_!==l||a!==0&&_.nodeType!==3||(s=r+a),_!==i||o!==0&&_.nodeType!==3||(d=r+o),_.nodeType===3&&(r+=_.nodeValue.length),(w=_.firstChild)!==null;)b=_,_=w;for(;;){if(_===e)break t;if(b===l&&++f===a&&(s=r),b===i&&++h===o&&(d=r),(w=_.nextSibling)!==null)break;_=b,b=_.parentNode}_=w}l=s===-1||d===-1?null:{start:s,end:d}}else l=null}l=l||{start:0,end:0}}else l=null;for(r0={focusedElem:e,selectionRange:l},_r=!1,n=(n&335544064)===n,rn=t,t=n?9270:1024;rn!==null;){if(e=rn,n&&(l=e.deletions,l!==null))for(a=0;a<l.length;a++)n&&Gf(l[a]);if(e.alternate===null&&(e.flags&2)!==0)n&&yg(e),Gc(n);else{if(e.tag===22){if(l=e.alternate,e.memoizedState!==null){l!==null&&l.memoizedState===null&&n&&Gf(l),Gc(n);continue}else if(l!==null&&l.memoizedState!==null){n&&yg(e),Gc(n);continue}}l=e.child,(e.subtreeFlags&t)!==0&&l!==null?(l.return=e,rn=l):(n&&Vp(e),Gc(n))}}Pn=null}function Gc(e){for(;rn!==null;){var t=rn,n=e,l=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&l!==null){n=void 0,o=l.memoizedProps,l=l.memoizedState;var a=t.stateNode;try{var i=ti(t.type,o);n=a.getSnapshotBeforeUpdate(i,l),a.__reactInternalSnapshotBeforeUpdate=n}catch(r){xt(t,t.return,r)}}break;case 3:if((o&1024)!==0){if(l=t.stateNode.containerInfo,n=l.nodeType,n===9)u0(l);else if(n===1)switch(l.nodeName){case"HEAD":case"HTML":case"BODY":u0(l);break;default:l.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:n&&l!==null&&(n=No(l.memoizedProps,l.stateNode),o=t.memoizedProps,o=Lo(o.default,o.update),o!=="none"&&yr(l,n,o,l.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(H(163))}if(l=t.sibling,l!==null){l.return=t.return,rn=l;break}rn=t.return}}function Zp(e,t,n){var l=n.flags;switch(n.tag){case 0:case 11:case 15:Kl(e,n),l&4&&qs(5,n);break;case 1:if(Kl(e,n),l&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(i){xt(n,n.return,i)}else{var o=ti(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(i){xt(n,n.return,i)}}l&64&&Ip(n),l&512&&Jl(n,n.return);break;case 3:if(Kl(e,n),l&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Jy(e,t)}catch(i){xt(n,n.return,i)}}break;case 27:t===null&&l&4&&Qp(n);case 26:case 5:Kl(e,n),t===null&&l&4&&If(n),l&512&&Jl(n,n.return);break;case 12:Kl(e,n);break;case 31:Kl(e,n),l&4&&e5(e,n);break;case 13:Kl(e,n),l&4&&t5(e,n),l&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=yw.bind(null,n),Zw(e,n))));break;case 22:if(l=n.memoizedState!==null||an,!l){var a=t!==null&&t.memoizedState!==null||yt;t=an,o=yt,an=l,(yt=a)&&!o?(l=2,(n.subtreeFlags&8772)!==0&&(l|=1),Ol(e,n,l)):Kl(e,n),an=t,yt=o}break;case 30:Kl(e,n),l&512&&Jl(n,n.return);break;case 7:l&512&&Jl(n,n.return);default:Kl(e,n)}}function Ff(e,t){for(e=e.child;e!==null;)Kp(e,t),e=e.sibling}function Kp(e,t){switch(e.tag){case 5:case 26:try{var n=e.stateNode;if(t){var l=n.style;typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none"}else{var o=e.stateNode,a=e.memoizedProps.style,i=a!=null&&a.hasOwnProperty("display")?a.display:null;o.style.display=i==null||typeof i=="boolean"?"":(""+i).trim()}}catch(s){xt(e,e.return,s)}Zf(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,rt=!0}catch(s){xt(e,e.return,s)}break;case 18:try{var r=e.stateNode;t?Lg(r,!0):Lg(e.stateNode,!1)}catch(s){xt(e,e.return,s)}break;case 22:case 23:e.memoizedState===null&&Ff(e,t);break;default:Ff(e,t)}}function Zf(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var n=e,l=t;switch(n.tag){case 4:Kp(n,l);break e;case 22:n.memoizedState===null&&Zf(n,l);break e;default:Zf(n,l)}}e=e.sibling}}function Jp(e){var t=e.alternate;t!==null&&(e.alternate=null,Jp(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Wu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var jt=null,jn=!1;function zl(e,t,n){for(n=n.child;n!==null;)Pp(e,t,n),n=n.sibling}function Pp(e,t,n){if(nl&&typeof nl.onCommitFiberUnmount=="function")try{nl.onCommitFiberUnmount(Hs,n)}catch{}switch(n.tag){case 26:yt||hn(n,t),zl(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&!yt&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:yt||hn(n,t),gs(n);var l=jt,o=jn;pa(n.type)&&(jt=n.stateNode,jn=!1),zl(e,t,n),Y5(n.stateNode,n.type,n.memoizedProps),jt=l,jn=o;break;case 5:yt||hn(n,t),gs(n);case 6:if(n.tag===6&&gs(n),l=jt,o=jn,jt=null,zl(e,t,n),jt=l,jn=o,jt!==null)if(jn)try{(jt.nodeType===9?jt.body:jt.nodeName==="HTML"?jt.ownerDocument.body:jt).removeChild(n.stateNode),rt=!0}catch(a){xt(n,t,a)}else try{jt.removeChild(n.stateNode),rt=!0}catch(a){xt(n,t,a)}break;case 18:jt!==null&&(jn?(e=jt,Og(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),fr(e)):Og(jt,n.stateNode));break;case 4:l=jt,o=jn,jt=n.stateNode.containerInfo,jn=!0,zl(e,t,n),jt=l,jn=o;break;case 0:case 11:case 14:case 15:ma(2,n,t),yt||ma(4,n,t),zl(e,t,n);break;case 1:yt||(hn(n,t),l=n.stateNode,typeof l.componentWillUnmount=="function"&&Xp(n,t,l)),zl(e,t,n);break;case 21:zl(e,t,n);break;case 22:yt=(l=yt)||n.memoizedState!==null,zl(e,t,n),yt=l;break;case 30:hn(n,t),zl(e,t,n);break;case 7:yt||hn(n,t),zl(e,t,n);break;default:zl(e,t,n)}}function e5(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{fr(e)}catch(n){xt(t,t.return,n)}}}function t5(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{fr(e)}catch(n){xt(t,t.return,n)}}function iw(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new bg),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new bg),t;default:throw Error(H(435,e.tag))}}function Vc(e,t){var n=iw(e);t.forEach(function(l){if(!n.has(l)){n.add(l);var o=pw.bind(null,e,l);l.then(o,o)}})}function zn(e,t,n){var l=t.deletions;if(l!==null)for(var o=0;o<l.length;o++){var a=l[o],i=e,r=t,s=r;e:for(;s!==null;){switch(s.tag){case 27:if(pa(s.type)){jt=s.stateNode,jn=!1;break e}break;case 5:jt=s.stateNode,jn=!1;break e;case 3:case 4:jt=s.stateNode.containerInfo,jn=!0;break e}s=s.return}if(jt===null)throw Error(H(160));Pp(i,r,a),jt=null,jn=!1,i=a.alternate,i!==null&&(i.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)n5(t,e,n),t=t.sibling}var Ll=null;function n5(e,t,n){var l=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(l=e.updateQueue,l=l!==null?l.events:null,l!==null))for(var a=0;a<l.length;a++){var i=l[a];i.ref.impl=i.nextImpl}zn(t,e,n),On(e),o&4&&(ma(3,e,e.return),qs(3,e),ma(5,e,e.return));break;case 1:zn(t,e,n),On(e),o&512&&(yt||l===null||hn(l,l.return)),o&64&&an&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?t:n.concat(t))));break;case 26:if(a=Ll,zn(t,e,n),On(e),o&512&&(yt||l===null||hn(l,l.return)),o&4)if(o=l!==null?l.memoizedState:null,n=e.memoizedState,l===null)if(n===null)if(e.stateNode===null)if(an)e.stateNode=N5(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,n=e.memoizedProps,o=a.ownerDocument||a;t:switch(t){case"title":l=o.getElementsByTagName("title")[0],(!l||l[Ys]||l[mn]||l.namespaceURI==="http://www.w3.org/2000/svg"||l.hasAttribute("itemprop"))&&(l=o.createElement(t),o.head.insertBefore(l,o.querySelector("head > title"))),bn(l,t,n),l[mn]=e,sn(l),t=l;break e;case"link":if(a=Xg("link","href",o).get(t+(n.href||""))){for(i=0;i<a.length;i++)if(l=a[i],l.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&l.getAttribute("rel")===(n.rel==null?null:n.rel)&&l.getAttribute("title")===(n.title==null?null:n.title)&&l.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){a.splice(i,1);break t}}l=o.createElement(t),bn(l,t,n),o.head.appendChild(l);break;case"meta":if(a=Xg("meta","content",o).get(t+(n.content||""))){for(i=0;i<a.length;i++)if(l=a[i],l.getAttribute("content")===(n.content==null?null:""+n.content)&&l.getAttribute("name")===(n.name==null?null:n.name)&&l.getAttribute("property")===(n.property==null?null:n.property)&&l.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&l.getAttribute("charset")===(n.charSet==null?null:n.charSet)){a.splice(i,1);break t}}l=o.createElement(t),bn(l,t,n),o.head.appendChild(l);break;default:throw Error(H(468,t))}l[mn]=e,sn(l),t=l}e.stateNode=t}else an||f0(a,e.type,e.stateNode);else e.stateNode=Ig(a,n,e.memoizedProps);else o!==n?(o===null?(t=l.stateNode,t===null||yt||t.parentNode.removeChild(t)):o.count--,n===null?an||f0(a,e.type,e.stateNode):Ig(a,n,e.memoizedProps)):n===null&&e.stateNode!==null&&V_(e,e.memoizedProps,l.memoizedProps);break;case 27:zn(t,e,n),On(e),o&512&&(yt||l===null||hn(l,l.return)),l!==null&&o&4&&V_(e,e.memoizedProps,l.memoizedProps);break;case 5:if(a=Fl,Fl=!1,zn(t,e,n),Fl=a,On(e),o&512&&(yt||l===null||hn(l,l.return)),e.flags&32){t=e.stateNode;try{lr(t,""),rt=!0}catch(f){xt(e,e.return,f)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,V_(e,t,l!==null?l.memoizedProps:t)),o&1024&&(F_=!0);break;case 6:if(zn(t,e,n),On(e),o&4){if(e.stateNode===null)throw Error(H(162));t=e.memoizedProps,n=e.stateNode;try{n.nodeValue=t,rt=!0}catch(f){xt(e,e.return,f)}}break;case 3:if(rt=!1,hu=null,a=Ll,Ll=Ds(t.containerInfo),zn(t,e,n),Ll=a,On(e),o&4&&l!==null&&l.memoizedState.isDehydrated)try{fr(t.containerInfo)}catch(f){xt(e,e.return,f)}F_&&(F_=!1,l5(e)),rt=!1;break;case 4:o=Fl,Fl=an,l=C1(),a=Ll,Ll=Ds(e.stateNode.containerInfo),zn(t,e,n),On(e),Ll=a,rt&&is&&($u=!0),rt=l,Fl=o;break;case 12:zn(t,e,n),On(e);break;case 31:zn(t,e,n),On(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Vc(e,t)));break;case 13:zn(t,e,n),On(e),e.child.flags&8192&&e.memoizedState!==null!=(l!==null&&l.memoizedState!==null)&&(rd=tl()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Vc(e,t)));break;case 22:a=e.memoizedState!==null,i=l!==null&&l.memoizedState!==null;var r=an,s=yt,d=Fl;an=r||a,Fl=d||a,yt=s||i,zn(t,e,n),yt=s,Fl=d,an=r,On(e),o&8192&&(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,!a||l===null||i||an||yt||(t=i||yt,n=an,l=yt,an=a||an,yt=t,Go(e,2),an=n,yt=l),!a&&Fl||Ff(e,a)),o&4&&(t=e.updateQueue,t!==null&&(n=t.retryQueue,n!==null&&(t.retryQueue=null,Vc(e,n))));break;case 19:zn(t,e,n),On(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Vc(e,t)));break;case 30:o&512&&(yt||l===null||hn(l,l.return)),o=C1(),a=is,i=(n&335544064)===n,r=e.memoizedProps,is=i&&Lo(r.default,r.update)!=="none",zn(t,e,n),On(e),i&&l!==null&&rt&&(e.flags|=4),is=a,rt=o;break;case 21:break;case 7:o&512&&(yt||l===null||hn(l,l.return)),l&&l.stateNode!==null&&(l.stateNode._fragmentFiber=e);default:zn(t,e,n),On(e)}}function On(e){var t=e.flags;if(t&2){try{for(var n,l=e.return;l!==null;){if(qp(l)){n=l;break}l=l.return}l=null;for(var o=e.return;o!==null;){if(P0(o)){var a=o.stateNode;l===null?l=[a]:l.push(a)}if(J0(o))break;o=o.return}var i=l;if(n==null)throw Error(H(160));switch(n.tag){case 27:var r=n.stateNode,s=W_(e);Bu(e,s,r,i);break;case 5:var d=n.stateNode;n.flags&32&&(lr(d,""),n.flags&=-33);var f=W_(e);Bu(e,f,d,i);break;case 3:case 4:var h=n.stateNode.containerInfo,_=W_(e);Xf(e,_,h,i);break;default:throw Error(H(161))}}catch(b){xt(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function l5(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;l5(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,_r=!0,t.reset(),_r=!1),e=e.sibling}}function Ni(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)o5(t,e),t=t.sibling;else Fp(t,!1)}function o5(e,t){var n=e.alternate;if(n===null)qf(e,!1);else switch(e.tag){case 3:if(Wf=Zl=!1,pg(),Ni(t,e),!Zl&&!$u){if(e=Pl,e!==null)for(var l=0;l<e.length;l+=3){n=e[l];var o=e[l+1];A5(n,e[l+2]),n=n.ownerDocument.documentElement,n!==null&&n.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Wf=!0}Pl=null;break;case 5:Ni(t,e);break;case 4:l=Zl,Zl=!1,Ni(t,e),Zl&&($u=!0),Zl=l;break;case 22:e.memoizedState===null&&(n.memoizedState!==null?qf(e,!1):Ni(t,e));break;case 30:l=Zl,o=pg(),Zl=!1,Ni(t,e),Zl&&(e.flags|=4);var a=e.memoizedProps,i=e.stateNode;t=No(a,i),i=No(n.memoizedProps,i);var r=Lo(a.default,a.update);r==="none"?t=!1:(a=n.memoizedState,n.memoizedState=null,n=e.child,Xn=0,t=eh(e,n,t,i,r,a,!0),Xn!==(a===null?0:a.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(ir(e,e.memoizedProps.onUpdate),Pl=o):o!==null&&(o.push.apply(o,Pl),Pl=o),Zl=(e.flags&32)!==0?!0:l;break;default:Ni(t,e)}}function Kl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Zp(e,t.alternate,t),t=t.sibling}function Go(e,t){for(e=e.child;e!==null;){var n=e,l=t;switch(n.tag){case 0:case 11:case 14:case 15:ma(4,n,n.return),Go(n,l);break;case 1:hn(n,n.return);var o=n.stateNode;typeof o.componentWillUnmount=="function"&&Xp(n,n.return,o),Go(n,l);break;case 27:(l&2)!==0&&Y5(n.stateNode,n.type,n.memoizedProps);case 5:hn(n,n.return),n.tag!==5&&n.tag!==27||gs(n),Go(n,l);break;case 6:gs(n);break;case 26:hn(n,n.return),o=n.stateNode,n.memoizedState!==null||o===null||yt||o.parentNode.removeChild(o),Go(n,l);break;case 22:n.memoizedState===null&&Go(n,l);break;case 30:hn(n,n.return),Go(n,l);break;case 7:hn(n,n.return);default:Go(n,l)}e=e.sibling}}function Ol(e,t,n){for(n=(t.subtreeFlags&8772)!==0?n:n&-2,t=t.child;t!==null;){var l=t.alternate,o=e,a=t,i=a.flags,r=(n&1)!==0;switch(a.tag){case 0:case 11:case 15:Ol(o,a,n),qs(4,a);break;case 1:if(Ol(o,a,n),l=a,o=l.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(f){xt(l,l.return,f)}if(l=a,o=l.updateQueue,o!==null){var s=l.stateNode;try{var d=o.shared.hiddenCallbacks;if(d!==null)for(o.shared.hiddenCallbacks=null,o=0;o<d.length;o++)Ky(d[o],s)}catch(f){xt(l,l.return,f)}}r&&i&64&&Ip(a),Jl(a,a.return);break;case 27:(n&2)!==0&&Qp(a);case 5:a.tag!==5&&a.tag!==27||gg(a),Ol(o,a,n),r&&l===null&&i&4&&If(a),Jl(a,a.return);break;case 6:gg(a);break;case 26:s=a.stateNode,a.memoizedState!==null||s===null||an||f0(Ds(s.ownerDocument),a.type,s),Ol(o,a,n),r&&l===null&&i&4&&If(a),Jl(a,a.return);break;case 12:Ol(o,a,n);break;case 31:Ol(o,a,n),r&&i&4&&e5(o,a);break;case 13:Ol(o,a,n),r&&i&4&&t5(o,a);break;case 22:a.memoizedState===null&&Ol(o,a,n),Jl(a,a.return);break;case 30:Ol(o,a,n),Jl(a,a.return);break;case 7:Jl(a,a.return);default:Ol(o,a,n)}t=t.sibling}}function th(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Is(n))}function nh(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Is(e))}function gl(e,t,n,l){var o=(n&335544064)===n;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)a5(e,t,n,l),t=t.sibling;else o&&Wp(t)}function a5(e,t,n,l){var o=(n&335544064)===n;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&uu(t);var a=t.flags;switch(t.tag){case 0:case 11:case 15:gl(e,t,n,l),a&2048&&qs(9,t);break;case 1:gl(e,t,n,l);break;case 3:gl(e,t,n,l),o&&Wf&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),a&2048&&(a=null,t.alternate!==null&&(a=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==a&&(t.refCount++,a!=null&&Is(a)));break;case 12:if(a&2048){gl(e,t,n,l),a=t.stateNode;try{var i=t.memoizedProps,r=i.id,s=i.onPostCommit;typeof s=="function"&&s(r,t.alternate===null?"mount":"update",a.passiveEffectDuration,-0)}catch(d){xt(t,t.return,d)}}else gl(e,t,n,l);break;case 31:gl(e,t,n,l);break;case 13:gl(e,t,n,l);break;case 23:break;case 22:i=t.stateNode,r=t.alternate,t.memoizedState!==null?(o&&r!==null&&r.memoizedState===null&&uu(r),i._visibility&2?gl(e,t,n,l):ys(e,t)):(o&&r!==null&&r.memoizedState!==null&&uu(t),i._visibility&2?gl(e,t,n,l):(i._visibility|=2,Ai(e,t,n,l,(t.subtreeFlags&10256)!==0||!1))),a&2048&&th(r,t);break;case 24:gl(e,t,n,l),a&2048&&nh(t.alternate,t);break;case 30:o&&(a=t.alternate,a!==null&&(io(a.child,!0),io(t.child,!0))),gl(e,t,n,l);break;default:gl(e,t,n,l)}}function Ai(e,t,n,l,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=e,i=t,r=n,s=l,d=i.flags;switch(i.tag){case 0:case 11:case 15:Ai(a,i,r,s,o),qs(8,i);break;case 23:break;case 22:var f=i.stateNode;i.memoizedState!==null?f._visibility&2?Ai(a,i,r,s,o):ys(a,i):(f._visibility|=2,Ai(a,i,r,s,o)),o&&d&2048&&th(i.alternate,i);break;case 24:Ai(a,i,r,s,o),o&&d&2048&&nh(i.alternate,i);break;default:Ai(a,i,r,s,o)}t=t.sibling}}function ys(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,l=t,o=l.flags;switch(l.tag){case 22:ys(n,l),o&2048&&th(l.alternate,l);break;case 24:ys(n,l),o&2048&&nh(l.alternate,l);break;default:ys(n,l)}t=t.sibling}}var ja=8192;function $a(e,t,n){if(e.subtreeFlags&ja)for(e=e.child;e!==null;)i5(e,t,n),e=e.sibling}function i5(e,t,n){switch(e.tag){case 26:$a(e,t,n),e.flags&ja&&(e.memoizedState!==null?u4(n,Ll,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Qg(n,e)));break;case 5:$a(e,t,n),e.flags&ja&&(e=e.stateNode,(t&335544128)===t&&Qg(n,e));break;case 3:case 4:var l=Ll;Ll=Ds(e.stateNode.containerInfo),$a(e,t,n),Ll=l;break;case 22:e.memoizedState===null&&(l=e.alternate,l!==null&&l.memoizedState!==null?(l=ja,ja=16777216,$a(e,t,n),ja=l):$a(e,t,n));break;case 30:if((e.flags&ja)!==0&&(l=e.memoizedProps.name,l!=null&&l!=="auto")){var o=e.stateNode;o.paired=null,Pn===null&&(Pn=new Map),Pn.set(l,o)}$a(e,t,n);break;default:$a(e,t,n)}}function r5(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Pr(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var l=t[n];rn=l,c5(l,e)}r5(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)s5(e),e=e.sibling}function s5(e){switch(e.tag){case 0:case 11:case 15:Pr(e),e.flags&2048&&ma(9,e,e.return);break;case 3:Pr(e);break;case 12:Pr(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,du(e)):Pr(e);break;default:Pr(e)}}function du(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var l=t[n];rn=l,c5(l,e)}r5(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:ma(8,t,t.return),du(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,du(t));break;default:du(t)}e=e.sibling}}function c5(e,t){for(;rn!==null;){var n=rn;switch(n.tag){case 0:case 11:case 15:ma(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var l=n.memoizedState.cachePool.pool;l!=null&&l.refCount++}break;case 24:Is(n.memoizedState.cache)}if(l=n.child,l!==null)l.return=n,rn=l;else e:for(n=e;rn!==null;){l=rn;var o=l.sibling,a=l.return;if(Jp(l),l===n){rn=null;break e}if(o!==null){o.return=a,rn=o;break e}rn=a}}}var rw={getCacheForType:function(e){var t=gn(Kt),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return gn(Kt).controller.signal}},sw=typeof WeakMap=="function"?WeakMap:Map,_t=0,Tt=null,Ge=null,We=0,bt=0,Zn=null,Po=!1,pr=!1,lh=!1,zo=0,Gt=0,ga=0,Wa=0,Uu=0,el=0,ar=0,ps=null,In=null,Kf=!1,rd=0,u5=0,Yu=1/0,ju=null,sa=null,It=0,Hl=null,ni=null,ao=0,Jf=0,Pf=null,d5=null,Ji=null,Pi=null,er=null,bs=0,_u=null;function ol(){return(_t&2)!==0&&We!==0?We&-We:ve.T!==null?ah():my()}function _5(){if(el===0)if((We&536870912)===0||Ue){var e=Oc;Oc<<=1,(Oc&3932160)===0&&(Oc=262144),el=e}else el=536870912;return e=vn.current,e!==null&&(e.flags|=32),el}function ir(e,t){if(t!=null){var n=e.stateNode,l=n.ref;l===null&&(l=n.ref=z5(No(e.memoizedProps,n))),Pi===null&&(Pi=[]),Pi.push(t.bind(null,l))}}function Qn(e,t,n){(e===Tt&&(bt===2||bt===9)||e.cancelPendingCommit!==null)&&(rr(e,0),ea(e,We,el,!1)),Us(e,n),((_t&2)===0||e!==Tt)&&(e===Tt&&((_t&2)===0&&(Wa|=n),Gt===4&&ea(e,We,el,!1)),so(e))}function f5(e,t,n){if((_t&6)!==0)throw Error(H(327));var l=!n&&(t&127)===0&&(t&e.expiredLanes)===0||$s(e,t),o=l?dw(e,t):Z_(e,t,!0),a=l;do{if(o===0){pr&&!l&&ea(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!cw(n)){o=Z_(e,t,!1),a=!1;continue}if(o===2){if(a=t,e.errorRecoveryDisabledLanes&a)var i=0;else i=e.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){t=i;e:{var r=e;o=ps;var s=r.current.memoizedState.isDehydrated;if(s&&(rr(r,i).flags|=256),i=Z_(r,i,!1),i!==2&&i!==6){if(lh&&!s){r.errorRecoveryDisabledLanes|=a,Wa|=a,o=4;break e}a=In,In=o,a!==null&&(In===null?In=a:In.push.apply(In,a))}o=i}if(a=!1,o!==2)continue}}if(o===1){rr(e,0),ea(e,t,0,!0);break}e:{switch(l=e,a=o,a){case 0:case 1:throw Error(H(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:ea(l,t,el,!Po);break e;case 2:In=null;break;case 3:case 5:break;default:throw Error(H(329))}if((t&62914560)===t&&(o=rd+300-tl(),10<o)){if(ea(l,t,el,!Po),Vu(l,0,!0)!==0)break e;ao=t,l.timeoutHandle=rh(vg.bind(null,l,n,In,ju,Kf,t,el,Wa,ar,Po,a,"Throttled",-0,0),o);break e}vg(l,n,In,ju,Kf,t,el,Wa,ar,Po,a,null,-0,0)}}break}while(!0);so(e)}function vg(e,t,n,l,o,a,i,r,s,d,f,h,_,b){e.timeoutHandle=-1;var w=t.subtreeFlags,N=(a&335544064)===a;if(h=null,(N||w&8192||(w&16785408)===16785408)&&(h={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:to},Pn=null,i5(t,a,h),N&&(w=h,N=e.containerInfo,N=(N.nodeType===9?N:N.ownerDocument).__reactViewTransition,N!=null&&(w.count++,w.waitingForViewTransition=!0,w=zs.bind(w),N.finished.then(w,w))),w=(a&62914560)===a?rd-tl():(a&4194048)===a?u5-tl():0,w=d4(h,w),w!==null)){ao=a,e.cancelPendingCommit=w(wg.bind(null,e,t,a,n,l,o,i,r,s,d,f,h,null,_,b)),ea(e,a,i,!d);return}wg(e,t,a,n,l,o,i,r,s,d,f,h)}function cw(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var l=0;l<n.length;l++){var o=n[l],a=o.getSnapshot;o=o.value;try{if(!al(a(),o))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ea(e,t,n,l){t=uy(e,t),t&=~Uu,t&=~Wa,e.suspendedLanes|=t,e.pingedLanes&=~t,l&&(e.warmLanes|=t),l=e.expirationTimes;for(var o=t;0<o;){var a=31-ll(o),i=1<<a;l[a]=-1,o&=~i}n!==0&&_y(e,n,t)}function sd(){return(_t&6)===0?(Qs(0,!1),!1):!0}function oh(){if(Ge!==null){if(bt===0)var e=Ge.return;else e=Ge,Co=ri=null,j0(e),Fi=null,Ms=0,e=Ge;for(;e!==null;)jp(e.alternate,e),e=e.return;Ge=null}}function rr(e,t){var n=e.timeoutHandle;return n!==-1&&(e.timeoutHandle=-1,Aw(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),ao=0,oh(),Tt=e,Ge=n=Mo(e.current,null),We=t,bt=0,Zn=null,Po=!1,pr=$s(e,t),lh=!1,ar=el=Uu=Wa=ga=Gt=0,In=ps=null,Kf=!1,zo=uy(e,t),Ju(),n}function h5(e,t){Le=null,ve.H=zu,t===gr||t===td?(t=V1(),bt=3):t===z0?(t=V1(),bt=4):bt=t===F0?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Zn=t,Ge===null&&(Gt=1,Ou(e,xl(t,e.current)))}function m5(){var e=vn.current;return e===null?!0:(We&4194048)===We?Nn===null:(We&62914560)===We||(We&536870912)!==0?e===Nn:!1}function g5(){var e=ve.H;return ve.H=zu,e===null?zu:e}function y5(){var e=ve.A;return ve.A=rw,e}function Iu(){Gt=4,Po||(We&4194048)!==We&&vn.current!==null||(pr=!0),(ga&134217727)===0&&(Wa&134217727)===0||Tt===null||ea(Tt,We,el,!1)}function Z_(e,t,n){var l=_t;_t|=2;var o=g5(),a=y5();(Tt!==e||We!==t)&&(ju=null,rr(e,t)),t=!1;var i=Gt;e:do try{if(bt!==0&&Ge!==null){var r=Ge,s=Zn;switch(bt){case 8:oh(),i=6;break e;case 3:case 2:case 9:case 6:vn.current===null&&(t=!0);var d=bt;if(bt=0,Zn=null,qi(e,r,s,d),n&&pr){i=0;break e}break;default:d=bt,bt=0,Zn=null,qi(e,r,s,d)}}uw(),i=Gt;break}catch(f){h5(e,f)}while(!0);return t&&e.shellSuspendCounter++,Co=ri=null,_t=l,ve.H=o,ve.A=a,Ge===null&&(Tt=null,We=0,Ju()),i}function uw(){for(;Ge!==null;)p5(Ge)}function dw(e,t){var n=_t;_t|=2;var l=g5(),o=y5();Tt!==e||We!==t?(ju=null,Yu=tl()+500,rr(e,t)):pr=$s(e,t);e:do try{if(bt!==0&&Ge!==null){t=Ge;var a=Zn;t:switch(bt){case 1:bt=0,Zn=null,qi(e,t,a,1);break;case 2:case 9:if(G1(a)){bt=0,Zn=null,xg(t);break}t=function(){bt!==2&&bt!==9||Tt!==e||(bt=7),so(e)},a.then(t,t);break e;case 3:bt=7;break e;case 4:bt=5;break e;case 7:G1(a)?(bt=0,Zn=null,xg(t)):(bt=0,Zn=null,qi(e,t,a,7));break;case 5:var i=null;switch(Ge.tag){case 26:i=Ge.memoizedState;case 5:case 27:var r=Ge;if(i?X5(i):r.stateNode.complete){bt=0,Zn=null;var s=r.sibling;if(s!==null)Ge=s;else{var d=r.return;d!==null?(Ge=d,cd(d)):Ge=null}break t}}bt=0,Zn=null,qi(e,t,a,5);break;case 6:bt=0,Zn=null,qi(e,t,a,6);break;case 8:oh(),Gt=6;break e;default:throw Error(H(462))}}_w();break}catch(f){h5(e,f)}while(!0);return Co=ri=null,ve.H=l,ve.A=o,_t=n,Ge!==null?0:(Tt=null,We=0,Ju(),Gt)}function _w(){for(;Ge!==null&&!Nv();)p5(Ge)}function p5(e){var t=Yp(e.alternate,e,zo);e.memoizedProps=e.pendingProps,t===null?cd(e):Ge=t}function xg(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=cg(n,t,t.pendingProps,t.type,void 0,We);break;case 11:t=cg(n,t,t.pendingProps,t.type.render,t.ref,We);break;case 5:j0(t);var l=t;l===cn&&(Ue?(Mu(l),l.tag===5&&l.stateNode!=null&&(Lt=l.stateNode)):(Mu(l),Ue=!0));default:jp(n,t),t=Ge=Iy(t,zo),t=Yp(n,t,zo)}e.memoizedProps=e.pendingProps,t===null?cd(e):Ge=t}function qi(e,t,n,l){Co=ri=null,j0(t),Fi=null,Ms=0;var o=t.return;try{if(Px(e,o,t,n,We)){Gt=1,Ou(e,xl(n,e.current)),Ge=null;return}}catch(a){if(o!==null)throw Ge=o,a;Gt=1,Ou(e,xl(n,e.current)),Ge=null;return}t.flags&32768?(Ue||l===1?e=!0:pr||(We&536870912)!==0?e=!1:(Po=e=!0,(l===2||l===9||l===3||l===6)&&(l=vn.current,l!==null&&l.tag===13&&(l.flags|=16384))),b5(t,e)):cd(t)}function cd(e){var t=e;do{if((t.flags&32768)!==0){b5(t,Po);return}e=t.return;var n=lw(t.alternate,t,zo);if(n!==null){Ge=n;return}if(t=t.sibling,t!==null){Ge=t;return}Ge=t=e}while(t!==null);Gt===0&&(Gt=5)}function b5(e,t){do{var n=ow(e.alternate,e);if(n!==null){n.flags&=32767,Ge=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Ge=e;return}Ge=e=n}while(e!==null);Gt=6,Ge=null}function wg(e,t,n,l,o,a,i,r,s,d,f,h){e.cancelPendingCommit=null;do ud();while(It!==0);if((_t&6)!==0)throw Error(H(327));if(t!==null){if(t===e.current)throw Error(H(177));e===Tt&&(Ge=Tt=null,We=0),ni=t,Hl=e,ao=n,Pf=o,d5=l,fw(e,t,n,i,r,s,h)}}function fw(e,t,n,l,o,a,i){var r=t.lanes|t.childLanes;if(Jf=r,r|=E0,Uv(e,n,r,l,o,a),Pi=null,(n&335544064)===n?(er=jx(e),l=10262):(er=null,l=10256),(t.subtreeFlags&l)!==0||(t.flags&l)!==0?(e.callbackNode=null,e.callbackPriority=0,bw(xu,function(){return l0(),null})):(e.callbackNode=null,e.callbackPriority=0),Hu=!1,l=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||l){l=ve.T,ve.T=null,o=ft.p,ft.p=2,a=_t,_t|=4;try{aw(e,t,n)}finally{_t=a,ft.p=o,ve.T=l}}It=1,Hu?Ji=Hw(i,e.containerInfo,er,e0,t0,mw,n0,l0,hw,null,null):(e0(),t0(),n0())}function hw(e){if(It!==0){var t=Hl.onRecoverableError;t(e,{componentStack:null})}}function mw(){It===3&&(It=0,o5(ni,Hl),It=4)}function e0(){if(It===1){It=0;var e=Hl,t=ni,n=ao,l=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||l){l=ve.T,ve.T=null;var o=ft.p;ft.p=2;var a=_t;_t|=4;try{is=$u=!1,n5(t,e,n),n=r0;var i=Oy(e.containerInfo),r=n.focusedElem,s=n.selectionRange;if(i!==r&&r&&r.ownerDocument&&zy(r.ownerDocument.documentElement,r)){if(s!==null&&M0(r)){var d=s.start,f=s.end;if(f===void 0&&(f=d),"selectionStart"in r)r.selectionStart=d,r.selectionEnd=Math.min(f,r.value.length);else{var h=r.ownerDocument||document,_=h&&h.defaultView||window;if(_.getSelection){var b=_.getSelection(),w=r.textContent.length,N=Math.min(s.start,w),M=s.end===void 0?N:Math.min(s.end,w);!b.extend&&N>M&&(i=M,M=N,N=i);var y=$1(r,N),x=$1(r,M);if(y&&x&&(b.rangeCount!==1||b.anchorNode!==y.node||b.anchorOffset!==y.offset||b.focusNode!==x.node||b.focusOffset!==x.offset)){var g=h.createRange();g.setStart(y.node,y.offset),b.removeAllRanges(),N>M?(b.addRange(g),b.extend(x.node,x.offset)):(g.setEnd(x.node,x.offset),b.addRange(g))}}}}for(h=[],b=r;b=b.parentNode;)b.nodeType===1&&h.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof r.focus=="function"&&r.focus(),r=0;r<h.length;r++){var k=h[r];k.element.scrollLeft=k.left,k.element.scrollTop=k.top}}_r=!!i0,r0=i0=null}finally{_t=a,ft.p=o,ve.T=l}}e.current=t,It=2}}function t0(){if(It===2){It=0;var e=Hl,t=ni,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=ve.T,ve.T=null;var l=ft.p;ft.p=2;var o=_t;_t|=4;try{Zp(e,t.alternate,t)}finally{_t=o,ft.p=l,ve.T=n}}It=3}}function n0(){if(It===4||It===3){It=0;var e=Ji;Ji=null,Rv();var t=Hl,n=ni,l=ao,o=d5,a=(l&335544064)===l?10262:10256;if((n.subtreeFlags&a)!==0||(n.flags&a)!==0?It=5:(It=0,ni=Hl=null,v5(t,t.pendingLanes)),a=t.pendingLanes,a===0&&(sa=null),v0(l),n=n.stateNode,nl&&typeof nl.onCommitFiberRoot=="function")try{nl.onCommitFiberRoot(Hs,n,void 0,(n.current.flags&128)===128)}catch{}if(o!==null){n=ve.T,a=ft.p,ft.p=2,ve.T=null;try{for(var i=t.onRecoverableError,r=0;r<o.length;r++){var s=o[r];i(s.value,{componentStack:s.stack})}}finally{ve.T=n,ft.p=a}}if(o=Pi,i=er,er=null,o!==null&&(Pi=null,i===null&&(i=[]),e!==null))for(s=0;s<o.length;s++)n=(0,o[s])(i),n!==void 0&&e.finished.finally(n);(ao&3)!==0&&ud(),so(t),a=t.pendingLanes,(l&261930)!==0&&(a&42)!==0?t===_u?bs++:(bs=0,_u=t):(bs=0,_u=null),Qs(0,!1)}}function v5(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Is(t)))}function ud(){return Ji!==null&&(Ji.skipTransition(),Ji=null),e0(),t0(),n0(),l0()}function l0(){if(It!==5)return!1;var e=Hl,t=Jf;Jf=0;var n=v0(ao),l=ve.T,o=ft.p;try{ft.p=32>n?32:n,ve.T=null,n=Pf,Pf=null;var a=Hl,i=ao;if(It=0,ni=Hl=null,ao=0,(_t&6)!==0)throw Error(H(331));var r=_t;if(_t|=4,s5(a.current),a5(a,a.current,i,n),_t=r,Qs(0,!1),nl&&typeof nl.onPostCommitFiberRoot=="function")try{nl.onPostCommitFiberRoot(Hs,a)}catch{}return!0}finally{ft.p=o,ve.T=l,v5(e,t)}}function Sg(e,t,n){t=xl(n,t),t=Bf(e.stateNode,t,2),e=aa(e,t,2),e!==null&&(Us(e,2),so(e))}function xt(e,t,n){if(e.tag===3)Sg(e,e,n);else for(;t!==null;){if(t.tag===3){Sg(t,e,n);break}else if(t.tag===1){var l=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(sa===null||!sa.has(l))){e=xl(n,e),n=Lp(2),l=aa(t,n,2),l!==null&&(Bp(n,l,t,e),Us(l,2),so(l));break}}t=t.return}}function K_(e,t,n){var l=e.pingCache;if(l===null){l=e.pingCache=new sw;var o=new Set;l.set(t,o)}else o=l.get(t),o===void 0&&(o=new Set,l.set(t,o));o.has(n)||(lh=!0,o.add(n),e=gw.bind(null,e,t,n),t.then(e,e))}function gw(e,t,n){var l=e.pingCache;l!==null&&l.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Tt===e&&(We&n)===n&&((Gt===4||Gt===3&&(We&62914560)===We&&300>tl()-rd)&&(_t&2)===0?rr(e,0):Uu|=n,ar===We&&(ar=0)),so(e)}function x5(e,t){t===0&&(t=dy()),e=ii(e,t),e!==null&&(Us(e,t),so(e))}function yw(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),x5(e,n)}function pw(e,t){var n=0;switch(e.tag){case 31:case 13:var l=e.stateNode,o=e.memoizedState;o!==null&&(n=o.retryLane);break;case 19:l=e.stateNode;break;case 22:l=e.stateNode._retryCache;break;default:throw Error(H(314))}l!==null&&l.delete(t),x5(e,n)}function bw(e,t){return p0(e,t)}var sr=null,Di=null,o0=!1,Xu=!1,J_=!1,ta=0;function so(e){e!==Di&&e.next===null&&(Di===null?sr=Di=e:Di=Di.next=e),Xu=!0,o0||(o0=!0,xw())}function Qs(e,t){if(!J_&&Xu){J_=!0;do for(var n=!1,l=sr;l!==null;){if(!t)if(e!==0){var o=l.pendingLanes;if(o===0)var a=0;else{var i=l.suspendedLanes,r=l.pingedLanes;a=(1<<31-ll(42|e)+1)-1,a&=o&~(i&~r),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,kg(l,a))}else a=We,a=Vu(l,l===Tt?a:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),(a&3)===0||$s(l,a)||(n=!0,kg(l,a));l=l.next}while(n);J_=!1}}function vw(){w5()}function w5(){Xu=o0=!1;var e=0;ta!==0&&Rw()&&(e=ta);for(var t=tl(),n=null,l=sr;l!==null;){var o=l.next,a=S5(l,t);a===0?(l.next=null,n===null?sr=o:n.next=o,o===null&&(Di=n)):(n=l,(e!==0||(a&3)!==0)&&(Xu=!0)),l=o}It!==0&&It!==5||Qs(e,!1),ta!==0&&(ta=0)}function S5(e,t){for(var n=e.suspendedLanes,l=e.pingedLanes,o=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var i=31-ll(a),r=1<<i,s=o[i];s===-1?((r&n)===0||(r&l)!==0)&&(o[i]=$v(r,t)):s<=t&&(e.expiredLanes|=r),a&=~r}if(t=Tt,n=We,n=Vu(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),l=e.callbackNode,n===0||e===t&&(bt===2||bt===9)||e.cancelPendingCommit!==null)return l!==null&&l!==null&&R_(l),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||$s(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(l!==null&&R_(l),v0(n)){case 2:case 8:n=sy;break;case 32:n=xu;break;case 268435456:n=cy;break;default:n=xu}return l=k5.bind(null,e),n=p0(n,l),e.callbackPriority=t,e.callbackNode=n,t}return l!==null&&l!==null&&R_(l),e.callbackPriority=2,e.callbackNode=null,2}function k5(e,t){if(It!==0&&It!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(ud()&&e.callbackNode!==n)return null;var l=We;return l=Vu(e,e===Tt?l:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),l===0?null:(f5(e,l,t),S5(e,tl()),e.callbackNode!=null&&e.callbackNode===n?k5.bind(null,e):null)}function kg(e,t){if(ud())return null;f5(e,t,!0)}function xw(){Dw(function(){(_t&6)!==0?p0(ry,vw):w5()})}function ah(){if(ta===0){var e=Ja;e===0&&(e=zc,zc<<=1,(zc&261888)===0&&(zc=256)),ta=e}return ta}function Cg(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:eu(e)}function ww(e,t,n,l,o){if(t==="submit"&&n&&n.stateNode===o){var a=Cg((o[Vn]||null).action),i=l.submitter;i&&(t=(t=i[Vn]||null)?Cg(t.formAction):i.getAttribute("formAction"),t!==null&&(a=t,i=null));var r=new Fu("action","action",null,l,o);e.push({event:r,listeners:[{instance:null,listener:function(){if(l.defaultPrevented){if(ta!==0){var s=new FormData(o,i);Of(n,{pending:!0,data:s,method:o.method,action:a},null,s)}}else typeof a=="function"&&(r.preventDefault(),s=new FormData(o,i),Of(n,{pending:!0,data:s,method:o.method,action:a},a,s))},currentTarget:o}]})}}for(Wc=0;Wc<Sf.length;Wc++)Fc=Sf[Wc],Mg=Fc.toLowerCase(),Eg=Fc[0].toUpperCase()+Fc.slice(1),$l(Mg,"on"+Eg);var Fc,Mg,Eg,Wc;$l(By,"onAnimationEnd");$l(Hy,"onAnimationIteration");$l($y,"onAnimationStart");$l("dblclick","onDoubleClick");$l("focusin","onFocus");$l("focusout","onBlur");$l(zx,"onTransitionRun");$l(Ox,"onTransitionStart");$l(Lx,"onTransitionCancel");$l(Uy,"onTransitionEnd");nr("onMouseEnter",["mouseout","mouseover"]);nr("onMouseLeave",["mouseout","mouseover"]);nr("onPointerEnter",["pointerout","pointerover"]);nr("onPointerLeave",["pointerout","pointerover"]);oi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));oi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));oi("onBeforeInput",["compositionend","keypress","textInput","paste"]);oi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));oi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));oi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ns="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Sw=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ns));function C5(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var l=e[n],o=l.event;l=l.listeners;e:{var a=void 0;if(t)for(var i=l.length-1;0<=i;i--){var r=l[i],s=r.instance,d=r.currentTarget;if(r=r.listener,s!==a&&o.isPropagationStopped())break e;a=r,o.currentTarget=d;try{a(o)}catch(f){Su(f)}o.currentTarget=null,a=s}else for(i=0;i<l.length;i++){if(r=l[i],s=r.instance,d=r.currentTarget,r=r.listener,s!==a&&o.isPropagationStopped())break e;a=r,o.currentTarget=d;try{a(o)}catch(f){Su(f)}o.currentTarget=null,a=s}}}}function Qe(e,t){var n=t[x1];n===void 0&&(n=t[x1]=new Set);var l=e+"__bubble";n.has(l)||(M5(t,e,2,!1),n.add(l))}function P_(e,t,n){var l=0;t&&(l|=4),M5(n,e,l,t)}var Zc="_reactListening"+Math.random().toString(36).slice(2);function ih(e){if(!e[Zc]){e[Zc]=!0,yy.forEach(function(n){n!=="selectionchange"&&(Sw.has(n)||P_(n,!1,e),P_(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Zc]||(t[Zc]=!0,P_("selectionchange",!1,t))}}function M5(e,t,n,l){switch(Z5(t)){case 2:var o=m4;break;case 8:o=g4;break;default:o=fh}n=o.bind(null,t,n,e),o=void 0,!bf||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),l?o!==void 0?e.addEventListener(t,n,{capture:!0,passive:o}):e.addEventListener(t,n,!0):o!==void 0?e.addEventListener(t,n,{passive:o}):e.addEventListener(t,n,!1)}function ef(e,t,n,l,o){var a=l;if((t&1)===0&&(t&2)===0&&l!==null)e:for(;;){if(l===null)return;var i=l.tag;if(i===3||i===4){var r=l.stateNode.containerInfo;if(r===o)break;if(i===4)for(i=l.return;i!==null;){var s=i.tag;if((s===3||s===4)&&i.stateNode.containerInfo===o)return;i=i.return}for(;r!==null;){if(i=Ia(r),i===null)return;if(s=i.tag,s===5||s===6||s===26||s===27){l=a=i;continue e}r=r.parentNode}}l=l.return}Cy(function(){var d=a,f=w0(n),h=[];e:{var _=Yy.get(e);if(_!==void 0){var b=Fu,w=e;switch(e){case"keypress":if(nu(n)===0)break e;case"keydown":case"keyup":b=cx;break;case"focusin":w="focus",b=B_;break;case"focusout":w="blur",b=B_;break;case"beforeblur":case"afterblur":b=B_;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=N1;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=Kv;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=hx;break;case By:case Hy:case $y:b=ex;break;case Uy:b=gx;break;case"scroll":case"scrollend":b=Fv;break;case"wheel":b=px;break;case"copy":case"cut":case"paste":b=nx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=A1;break;case"submit":b=_x;break;case"toggle":case"beforetoggle":b=vx}var N=(t&4)!==0,M=!N&&(e==="scroll"||e==="scrollend"),y=N?_!==null?_+"Capture":null:_;N=[];for(var x=d,g;x!==null;){var k=x;if(g=k.stateNode,k=k.tag,k!==5&&k!==26&&k!==27||g===null||y===null||(k=xs(x,y),k!=null&&N.push(Rs(x,k,g))),M)break;x=x.return}0<N.length&&(_=new b(_,w,null,n,f),h.push({event:_,listeners:N}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",_=e==="mouseout"||e==="pointerout",b&&n!==pf&&(w=n.relatedTarget||n.fromElement)&&(Ia(w)||w[hr]))break e;(_||b)&&(w=f.window===f?f:(b=f.ownerDocument)?b.defaultView||b.parentWindow:window,_?(b=n.relatedTarget||n.toElement,_=d,b=b?Ia(b):null,b!==null&&(M=Bs(b),N=b.tag,b!==M||N!==5&&N!==27&&N!==6)&&(b=null)):(_=null,b=d),_!==b&&(N=N1,k="onMouseLeave",y="onMouseEnter",x="mouse",(e==="pointerout"||e==="pointerover")&&(N=A1,k="onPointerLeave",y="onPointerEnter",x="pointer"),M=_==null?w:os(_),g=b==null?w:os(b),w=new N(k,x+"leave",_,n,f),w.target=M,w.relatedTarget=g,k=null,Ia(f)===d&&(N=new N(y,x+"enter",b,n,f),N.target=g,N.relatedTarget=M,k=N),M=k,N=_&&b?af(_,b,kw):null,_!==null&&Tg(h,w,_,N,!1),b!==null&&M!==null&&Tg(h,M,b,N,!0)))}e:{if(_=d?os(d):window,b=_.nodeName&&_.nodeName.toLowerCase(),b==="select"||b==="input"&&_.type==="file")var I=L1;else if(O1(_))if(Ay)I=Rx;else{I=Tx;var J=Ex}else b=_.nodeName,!b||b.toLowerCase()!=="input"||_.type!=="checkbox"&&_.type!=="radio"?d&&x0(d.elementType)&&(I=L1):I=Nx;if(I&&(I=I(e,d))){Ry(h,I,n,f);break e}J&&J(e,_,d)}switch(J=d?os(d):window,e){case"focusin":(O1(J)||J.contentEditable==="true")&&($i=J,xf=d,cs=null);break;case"focusout":cs=xf=$i=null;break;case"mousedown":wf=!0;break;case"contextmenu":case"mouseup":case"dragend":wf=!1,U1(h,n,f);break;case"selectionchange":if(Dx)break;case"keydown":case"keyup":U1(h,n,f)}var L;if(C0)e:{switch(e){case"compositionstart":var F="onCompositionStart";break e;case"compositionend":F="onCompositionEnd";break e;case"compositionupdate":F="onCompositionUpdate";break e}F=void 0}else Hi?Ty(e,n)&&(F="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(F="onCompositionStart");F&&(Ey&&n.locale!=="ko"&&(Hi||F!=="onCompositionStart"?F==="onCompositionEnd"&&Hi&&(L=My()):(Ko=f,S0="value"in Ko?Ko.value:Ko.textContent,Hi=!0)),J=qu(d,F),0<J.length&&(F=new R1(F,e,null,n,f),h.push({event:F,listeners:J}),L?F.data=L:(L=Ny(n),L!==null&&(F.data=L)))),(L=wx?Sx(e,n):kx(e,n))&&(F=qu(d,"onBeforeInput"),0<F.length&&(J=new R1("onBeforeInput","beforeinput",null,n,f),h.push({event:J,listeners:F}),J.data=L)),ww(h,e,d,n,f)}C5(h,t)})}function Rs(e,t,n){return{instance:e,listener:t,currentTarget:n}}function qu(e,t){for(var n=t+"Capture",l=[];e!==null;){var o=e,a=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||a===null||(o=xs(e,n),o!=null&&l.unshift(Rs(e,o,a)),o=xs(e,t),o!=null&&l.push(Rs(e,o,a))),e.tag===3)return l;e=e.return}return[]}function kw(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Tg(e,t,n,l,o){for(var a=t._reactName,i=[];n!==null&&n!==l;){var r=n,s=r.alternate,d=r.stateNode;if(r=r.tag,s!==null&&s===l)break;r!==5&&r!==26&&r!==27||d===null||(s=d,o?(d=xs(n,a),d!=null&&i.unshift(Rs(n,d,s))):o||(d=xs(n,a),d!=null&&i.push(Rs(n,d,s)))),n=n.return}i.length!==0&&e.push({event:t,listeners:i})}var Cw=/\r\n?/g,Mw=/\u0000|\uFFFD/g;function Ng(e){return(typeof e=="string"?e:""+e).replace(Cw,`
`).replace(Mw,"")}function E5(e,t){return t=Ng(t),Ng(e)===t}function vt(e,t,n,l,o,a){switch(n){case"children":if(typeof l=="string")t==="body"||t==="textarea"&&l===""||lr(e,l);else if(typeof l=="number"||typeof l=="bigint")t!=="body"&&lr(e,""+l);else return;break;case"className":Bc(e,"class",l);break;case"tabIndex":Bc(e,"tabindex",l);break;case"dir":case"role":case"viewBox":case"width":case"height":Bc(e,n,l);break;case"style":ky(e,l,a);return;case"data":if(t!=="object"){Bc(e,"data",l);break}case"src":case"href":if(l===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(l==null||typeof l=="function"||typeof l=="symbol"||typeof l=="boolean"){e.removeAttribute(n);break}l=eu(l),e.setAttribute(n,l);break;case"action":case"formAction":if(typeof l=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(t!=="input"&&vt(e,t,"name",o.name,o,null),vt(e,t,"formEncType",o.formEncType,o,null),vt(e,t,"formMethod",o.formMethod,o,null),vt(e,t,"formTarget",o.formTarget,o,null)):(vt(e,t,"encType",o.encType,o,null),vt(e,t,"method",o.method,o,null),vt(e,t,"target",o.target,o,null)));if(l==null||typeof l=="symbol"||typeof l=="boolean"){e.removeAttribute(n);break}l=eu(l),e.setAttribute(n,l);break;case"onClick":l!=null&&(e.onclick=to);return;case"onScroll":l!=null&&Qe("scroll",e);return;case"onScrollEnd":l!=null&&Qe("scrollend",e);return;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(H(61));if(n=l.__html,n!=null){if(o.children!=null)throw Error(H(60));a?.__html!==n&&(e.innerHTML=n)}}break;case"multiple":e.multiple=l&&typeof l!="function"&&typeof l!="symbol";break;case"muted":e.muted=l&&typeof l!="function"&&typeof l!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(l==null||typeof l=="function"||typeof l=="boolean"||typeof l=="symbol"){e.removeAttribute("xlink:href");break}n=eu(l),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":l!=null&&typeof l!="function"&&typeof l!="symbol"?e.setAttribute(n,l):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":l&&typeof l!="function"&&typeof l!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":l===!0?e.setAttribute(n,""):l!==!1&&l!=null&&typeof l!="function"&&typeof l!="symbol"?e.setAttribute(n,l):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":l!=null&&typeof l!="function"&&typeof l!="symbol"&&!isNaN(l)&&1<=l?e.setAttribute(n,l):e.removeAttribute(n);break;case"rowSpan":case"start":l==null||typeof l=="function"||typeof l=="symbol"||isNaN(l)?e.removeAttribute(n):e.setAttribute(n,l);break;case"popover":Qe("beforetoggle",e),Qe("toggle",e),Pc(e,"popover",l);break;case"xlinkActuate":wo(e,"http://www.w3.org/1999/xlink","xlink:actuate",l);break;case"xlinkArcrole":wo(e,"http://www.w3.org/1999/xlink","xlink:arcrole",l);break;case"xlinkRole":wo(e,"http://www.w3.org/1999/xlink","xlink:role",l);break;case"xlinkShow":wo(e,"http://www.w3.org/1999/xlink","xlink:show",l);break;case"xlinkTitle":wo(e,"http://www.w3.org/1999/xlink","xlink:title",l);break;case"xlinkType":wo(e,"http://www.w3.org/1999/xlink","xlink:type",l);break;case"xmlBase":wo(e,"http://www.w3.org/XML/1998/namespace","xml:base",l);break;case"xmlLang":wo(e,"http://www.w3.org/XML/1998/namespace","xml:lang",l);break;case"xmlSpace":wo(e,"http://www.w3.org/XML/1998/namespace","xml:space",l);break;case"is":Pc(e,"is",l);break;case"innerText":case"textContent":return;default:if(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")n=Vv.get(n)||n,Pc(e,n,l);else return}rt=!0}function a0(e,t,n,l,o,a){switch(n){case"style":ky(e,l,a);return;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(H(61));if(n=l.__html,n!=null){if(o.children!=null)throw Error(H(60));a?.__html!==n&&(e.innerHTML=n)}}break;case"children":if(typeof l=="string")lr(e,l);else if(typeof l=="number"||typeof l=="bigint")lr(e,""+l);else return;break;case"onScroll":l!=null&&Qe("scroll",e);return;case"onScrollEnd":l!=null&&Qe("scrollend",e);return;case"onClick":l!=null&&(e.onclick=to);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!py.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(o=n.endsWith("Capture"),a=n.slice(2,o?n.length-7:void 0),t=e[Vn]||null,t=t!=null?t[n]:null,typeof t=="function"&&e.removeEventListener(a,t,o),typeof l=="function")){typeof t!="function"&&t!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(a,l,o);break e}rt=!0,n in e?e[n]=l:l===!0?e.setAttribute(n,""):Pc(e,n,l)}return}rt=!0}function bn(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Qe("error",e),Qe("load",e);var l=!1,o=!1,a;for(a in n)if(n.hasOwnProperty(a)){var i=n[a];if(i!=null)switch(a){case"src":l=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(H(137,t));default:vt(e,t,a,i,n,null)}}o&&vt(e,t,"srcSet",n.srcSet,n,null),l&&vt(e,t,"src",n.src,n,null);return;case"input":Qe("invalid",e);var r=a=i=o=null,s=null,d=null;for(l in n)if(n.hasOwnProperty(l)){var f=n[l];if(f!=null)switch(l){case"name":o=f;break;case"type":i=f;break;case"checked":s=f;break;case"defaultChecked":d=f;break;case"value":a=f;break;case"defaultValue":r=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(H(137,t));break;default:vt(e,t,l,f,n,null)}}xy(e,a,r,s,d,i,o,!1);return;case"select":Qe("invalid",e),l=i=a=null;for(o in n)if(n.hasOwnProperty(o)&&(r=n[o],r!=null))switch(o){case"value":a=r;break;case"defaultValue":i=r;break;case"multiple":l=r;default:vt(e,t,o,r,n,null)}t=a,n=i,e.multiple=!!l,t!=null?Gi(e,!!l,t,!1):n!=null&&Gi(e,!!l,n,!0);return;case"textarea":Qe("invalid",e),a=o=l=null;for(i in n)if(n.hasOwnProperty(i)&&(r=n[i],r!=null))switch(i){case"value":l=r;break;case"defaultValue":o=r;break;case"children":a=r;break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(H(91));break;default:vt(e,t,i,r,n,null)}Sy(e,l,o,a);return;case"option":for(s in n)n.hasOwnProperty(s)&&(l=n[s],l!=null)&&(s==="selected"?e.selected=l&&typeof l!="function"&&typeof l!="symbol":vt(e,t,s,l,n,null));return;case"dialog":Qe("beforetoggle",e),Qe("toggle",e),Qe("cancel",e),Qe("close",e);break;case"iframe":case"object":Qe("load",e);break;case"video":case"audio":for(l=0;l<Ns.length;l++)Qe(Ns[l],e);break;case"image":Qe("error",e),Qe("load",e);break;case"details":Qe("toggle",e);break;case"embed":case"source":case"link":Qe("error",e),Qe("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(d in n)if(n.hasOwnProperty(d)&&(l=n[d],l!=null))switch(d){case"children":case"dangerouslySetInnerHTML":throw Error(H(137,t));default:vt(e,t,d,l,n,null)}return;default:if(x0(t)){for(f in n)n.hasOwnProperty(f)&&(l=n[f],l!==void 0&&a0(e,t,f,l,n,void 0));return}}for(r in n)n.hasOwnProperty(r)&&(l=n[r],l!=null&&vt(e,t,r,l,n,null))}var Ew={};function Tw(e,t,n,l){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,a=null,i=null,r=null,s=null,d=null,f=null;for(b in n){var h=n[b];if(n.hasOwnProperty(b)&&h!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":s=h;default:l.hasOwnProperty(b)||vt(e,t,b,null,l,h)}}for(var _ in l){var b=l[_];if(h=n[_],l.hasOwnProperty(_)&&(b!=null||h!=null))switch(_){case"type":b!==h&&(rt=!0),a=b;break;case"name":b!==h&&(rt=!0),o=b;break;case"checked":b!==h&&(rt=!0),d=b;break;case"defaultChecked":b!==h&&(rt=!0),f=b;break;case"value":b!==h&&(rt=!0),i=b;break;case"defaultValue":b!==h&&(rt=!0),r=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(H(137,t));break;default:b!==h&&vt(e,t,_,b,l,h)}}yf(e,i,r,s,d,f,a,o);return;case"select":b=i=r=_=null;for(a in n)if(s=n[a],n.hasOwnProperty(a)&&s!=null)switch(a){case"value":break;case"multiple":b=s;default:l.hasOwnProperty(a)||vt(e,t,a,null,l,s)}for(o in l)if(a=l[o],s=n[o],l.hasOwnProperty(o)&&(a!=null||s!=null))switch(o){case"value":a!==s&&(rt=!0),_=a;break;case"defaultValue":a!==s&&(rt=!0),r=a;break;case"multiple":a!==s&&(rt=!0),i=a;default:a!==s&&vt(e,t,o,a,l,s)}t=r,n=i,l=b,_!=null?Gi(e,!!n,_,!1):!!l!=!!n&&(t!=null?Gi(e,!!n,t,!0):Gi(e,!!n,n?[]:"",!1));return;case"textarea":b=_=null;for(r in n)if(o=n[r],n.hasOwnProperty(r)&&o!=null&&!l.hasOwnProperty(r))switch(r){case"value":break;case"children":break;default:vt(e,t,r,null,l,o)}for(i in l)if(o=l[i],a=n[i],l.hasOwnProperty(i)&&(o!=null||a!=null))switch(i){case"value":o!==a&&(rt=!0),_=o;break;case"defaultValue":o!==a&&(rt=!0),b=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(H(91));break;default:o!==a&&vt(e,t,i,o,l,a)}wy(e,_,b);return;case"option":for(var w in n)_=n[w],n.hasOwnProperty(w)&&_!=null&&!l.hasOwnProperty(w)&&(w==="selected"?e.selected=!1:vt(e,t,w,null,l,_));for(s in l)_=l[s],b=n[s],l.hasOwnProperty(s)&&_!==b&&(_!=null||b!=null)&&(s==="selected"?(_!==b&&(rt=!0),e.selected=_&&typeof _!="function"&&typeof _!="symbol"):vt(e,t,s,_,l,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var N in n)_=n[N],n.hasOwnProperty(N)&&_!=null&&!l.hasOwnProperty(N)&&vt(e,t,N,null,l,_);for(d in l)if(_=l[d],b=n[d],l.hasOwnProperty(d)&&_!==b&&(_!=null||b!=null))switch(d){case"children":case"dangerouslySetInnerHTML":if(_!=null)throw Error(H(137,t));break;default:vt(e,t,d,_,l,b)}return;default:if(x0(t)){for(var M in n)_=n[M],n.hasOwnProperty(M)&&_!==void 0&&!l.hasOwnProperty(M)&&a0(e,t,M,void 0,l,_);for(f in l)_=l[f],b=n[f],!l.hasOwnProperty(f)||_===b||_===void 0&&b===void 0||a0(e,t,f,_,l,b);return}}for(var y in n)_=n[y],n.hasOwnProperty(y)&&_!=null&&!l.hasOwnProperty(y)&&vt(e,t,y,null,l,_);for(h in l)_=l[h],b=n[h],!l.hasOwnProperty(h)||_===b||_==null&&b==null||vt(e,t,h,_,l,b)}function Rg(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function Nw(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),l=0;l<n.length;l++){var o=n[l],a=o.transferSize,i=o.initiatorType,r=o.duration;if(a&&r&&Rg(i)){for(i=0,r=o.responseEnd,l+=1;l<n.length;l++){var s=n[l],d=s.startTime;if(d>r)break;var f=s.transferSize,h=s.initiatorType;f&&Rg(h)&&(s=s.responseEnd,i+=f*(s<r?1:(r-d)/(s-d)))}if(--l,t+=8*(a+i)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var i0=null,r0=null;function As(e){return e.nodeType===9?e:e.ownerDocument}function Ag(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function T5(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function N5(e,t,n,l){return n=As(n).createElement(e),n[mn]=l,n[Vn]=t,bn(n,e,t),sn(n),n}function s0(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var tf=null;function Rw(){var e=window.event;return e&&e.type==="popstate"?e===tf?!1:(tf=e,!0):(tf=null,!1)}var rh=typeof setTimeout=="function"?setTimeout:void 0,Aw=typeof clearTimeout=="function"?clearTimeout:void 0,Dg=typeof Promise=="function"?Promise:void 0,zg=typeof requestAnimationFrame=="function"?requestAnimationFrame:rh,Dw=typeof queueMicrotask=="function"?queueMicrotask:typeof Dg<"u"?function(e){return Dg.resolve(null).then(e).catch(zw)}:rh;function zw(e){setTimeout(function(){throw e})}function pa(e){return e==="head"}function Og(e,t){var n=t,l=0;do{var o=n.nextSibling;if(e.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"||n==="/&"){if(l===0){e.removeChild(o),fr(t);return}l--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")l++;else if(n==="html")lf(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,lf(n);for(var a=n.firstChild;a;){var i=a.nextSibling,r=a.nodeName;a[Ys]||r==="SCRIPT"||r==="STYLE"||r==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=i}}else n==="body"&&lf(e.ownerDocument.body);n=o}while(n);fr(t)}function Lg(e,t){var n=e;e=0;do{var l=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),l&&l.nodeType===8)if(n=l.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=l}while(n)}function R5(e,t,n){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,n!=null&&(e.style.viewTransitionClass=n),n=getComputedStyle(e),n.display==="inline"){if(t=e.getClientRects(),t.length===1)var l=1;else for(var o=l=0;o<t.length;o++){var a=t[o];0<a.width&&0<a.height&&l++}l===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+n.paddingTop,e.marginBottom="-"+n.paddingBottom)}}function A5(e,t){e=e.style,t=t.style;var n=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=n==null||typeof n=="boolean"?"":(""+n).trim(),n=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=n==null||typeof n=="boolean"?"":(""+n).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(n=t.display,e.display=n==null||typeof n=="boolean"?"":n,n=t.margin,n!=null?e.margin=n:(n=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=n==null||typeof n=="boolean"?"":n,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function D5(e,t,n){return n=n.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=n.innerHeight&&e.left<=n.innerWidth}}function c0(e){var t=e.getBoundingClientRect(),n=getComputedStyle(e);return D5(t,n,e)}function Ow(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var n=getComputedStyle(e);return D5(t,n,e)}function Lw(e){return e.documentElement.clientHeight}function Bw(e){this.addEventListener("load",e),this.addEventListener("error",e)}function Hw(e,t,n,l,o,a,i,r,s){var d=t.nodeType===9?t:t.ownerDocument;try{var f=d.startViewTransition({update:function(){var _=d.defaultView,b=_.navigation&&_.navigation.transition,w=d.fonts.status;l();var N=[];if(w==="loaded"&&(Lw(d),d.fonts.status==="loading"&&N.push(d.fonts.ready)),w=N.length,e!==null)for(var M=e.suspenseyImages,y=0,x=0;x<M.length;x++){var g=M[x];if(!g.complete){var k=g.getBoundingClientRect();if(0<k.bottom&&0<k.right&&k.top<_.innerHeight&&k.left<_.innerWidth){if(y+=q5(g),y>mu){N.length=w;break}g=new Promise(Bw.bind(g)),N.push(g)}}}if(0<N.length)return _=Promise.race([Promise.all(N),new Promise(function(I){return setTimeout(I,500)})]).then(o,o),(b?Promise.allSettled([b.finished,_]):_).then(a,a);if(o(),b)return b.finished.then(a,a);a()},types:n});d.__reactViewTransition=f;var h=[];return f.ready.then(function(){for(var _=d.documentElement.getAnimations({subtree:!0}),b=0;b<_.length;b++){var w=_[b],N=w.effect,M=N.pseudoElement;if(M!=null&&M.startsWith("::view-transition")){h.push(w),w=N.getKeyframes();for(var y=M=void 0,x=!0,g=0;g<w.length;g++){var k=w[g],I=k.width;if(M===void 0)M=I;else if(M!==I){x=!1;break}if(I=k.height,y===void 0)y=I;else if(y!==I){x=!1;break}delete k.width,delete k.height,k.transform==="none"&&delete k.transform}x&&M!==void 0&&y!==void 0&&(N.setKeyframes(w),x=getComputedStyle(N.target,N.pseudoElement),x.width!==M||x.height!==y)&&(x=w[0],x.width=M,x.height=y,x=w[w.length-1],x.width=M,x.height=y,N.setKeyframes(w))}}i()},function(_){d.__reactViewTransition===f&&(d.__reactViewTransition=null);try{typeof _=="object"&&_!==null&&_.name==="InvalidStateError"&&(_.message==="View transition was skipped because document visibility state is hidden."||_.message==="Skipping view transition because document visibility state has become hidden."||_.message==="Skipping view transition because viewport size changed."||_.message==="Transition was aborted because of invalid state")&&(_=null),_!==null&&s(_)}finally{l(),o(),i()}}),f.finished.finally(function(){for(var _=0;_<h.length;_++)h[_].cancel();d.__reactViewTransition===f&&(d.__reactViewTransition=null),r()}),f}catch{return l(),o(),i(),null}}function Xa(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Xa.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Nt({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Xa.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,n=e.getAnimations({subtree:!0}),l=[],o=0;o<n.length;o++){var a=n[o].effect;a!==null&&a.target===e&&a.pseudoElement===t&&l.push(n[o])}return l};Xa.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function z5(e){return{name:e,group:new Xa("group",e),imagePair:new Xa("image-pair",e),old:new Xa("old",e),new:new Xa("new",e)}}function il(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}il.prototype.addEventListener=function(e,t,n){var l=null,o=null;if(!(n!=null&&typeof n!="boolean"&&(l=n.signal||null,l!==null&&l.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var a=this._eventListeners;if(O5(a,e,t,n)===-1){var i=this,r=t;n!=null&&typeof n!="boolean"&&n.once===!0&&(r=function(s){i.removeEventListener(e,t,n),typeof t=="function"?t.call(this,s):t.handleEvent(s)}),l!==null&&(o=i.removeEventListener.bind(i,e,t,n),l.addEventListener("abort",o,{once:!0}),o=l.removeEventListener.bind(l,"abort",o)),l=cr(n),a.push({type:e,listener:t,optionsOrUseCapture:n,attachedListener:r,cleanup:o}),Gn(this._fragmentFiber.child,!1,$w,e,r,l)}this._eventListeners=a}};function $w(e,t,n,l){return ln(e).addEventListener(t,n,l),!1}il.prototype.removeEventListener=function(e,t,n){var l=this._eventListeners;if(l!==null&&(t=O5(l,e,t,n),t!==-1)){var o=l[t];n=o.attachedListener;var a=o.cleanup;o=cr(o.optionsOrUseCapture),Gn(this._fragmentFiber.child,!1,Uw,e,n,o),l.splice(t,1),a!==null&&a()}};function Uw(e,t,n,l){return ln(e).removeEventListener(t,n,l),!1}function cr(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Bg(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function O5(e,t,n,l){if(e.length===0)return-1;l=Bg(l);for(var o=0;o<e.length;o++){var a=e[o];if(a.type===t&&a.listener===n&&Bg(a.optionsOrUseCapture)===l)return o}return-1}il.prototype.dispatchEvent=function(e){var t=li(this._fragmentFiber);if(t===null)return!0;t=ln(t);var n=this._eventListeners;if(n!==null&&0<n.length||!e.bubbles){var l=t.nodeType===9?t.createComment(""):document.createTextNode("");if(n)for(var o=0;o<n.length;o++){var a=n[o];l.addEventListener(a.type,a.attachedListener,cr(a.optionsOrUseCapture))}if(t.appendChild(l),e=l.dispatchEvent(e),n)for(o=0;o<n.length;o++)a=n[o],l.removeEventListener(a.type,a.attachedListener,cr(a.optionsOrUseCapture));return t.removeChild(l),e}return t.dispatchEvent(e)};il.prototype.focus=function(e){Gn(this._fragmentFiber.child,!0,L5,e,void 0,void 0)};function L5(e,t){return e.tag===6?!1:(e=ln(e),Kw(e,t))}il.prototype.focusLast=function(e){var t=[];Gn(this._fragmentFiber.child,!0,sh,t,void 0,void 0);for(var n=t.length-1;0<=n&&!L5(t[n],e);n--);};function sh(e,t){return t.push(e),!1}il.prototype.blur=function(){var e=li(this._fragmentFiber);e!==null&&(e=ln(e),e=As(e).activeElement,e!==null&&Gn(this._fragmentFiber.child,!1,Yw,e,void 0,void 0))};function Yw(e,t){return e.tag===6?!1:(e=ln(e),e===t||e.contains(t)?(t.blur(),!0):!1)}il.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Gn(this._fragmentFiber.child,!1,jw,e,void 0,void 0)};function jw(e,t){return e.tag===6||(e=ln(e),t.observe(e)),!1}il.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Gn(this._fragmentFiber.child,!1,Iw,e,void 0,void 0);for(var n=t=0;n<Bl.length;n++){var l=Bl[n];l.fragmentInstance===this&&l.observer===e?e.unobserve(l.instance):Bl[t++]=l}Bl.length=t}};function Iw(e,t){return e.tag===6||(e=ln(e),t.unobserve(e)),!1}var Bl=[],nf=!1;function Xw(e,t,n){Bl.push({fragmentInstance:e,observer:t,instance:n}),nf||(nf=!0,Jw(function(){nf=!1;var l=Bl;Bl=[];for(var o=0;o<l.length;o++){var a=l[o];a.observer.unobserve(a.instance)}}))}il.prototype.getClientRects=function(){var e=[];return Gn(this._fragmentFiber.child,!1,qw,e,void 0,void 0),e};function qw(e,t){if(e.tag===6){e=e.stateNode;var n=e.ownerDocument.createRange();n.selectNodeContents(e),t.push.apply(t,n.getClientRects())}else e=ln(e),t.push.apply(t,e.getClientRects());return!1}il.prototype.getRootNode=function(e){var t=li(this._fragmentFiber);return t===null?this:ln(t).getRootNode(e)};il.prototype.compareDocumentPosition=function(e){var t=li(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var n=[];Gn(this._fragmentFiber.child,!1,sh,n,void 0,void 0);var l=ln(t);if(n.length===0){if(n=l,m1(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(n=t)}t=this._fragmentFiber;var o=l=n.compareDocumentPosition(e);return n===e?o=Node.DOCUMENT_POSITION_CONTAINS:l&Node.DOCUMENT_POSITION_CONTAINED_BY&&(n=ly(t)[1],n===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=ln(n).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=ln(n[0]),o=ln(n[n.length-1]);var a=m1(this._fragmentFiber)?t.parentElement:l;if(a==null)return Node.DOCUMENT_POSITION_DISCONNECTED;l=a.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,a=a.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var i=t.compareDocumentPosition(e),r=o.compareDocumentPosition(e),s=i&Node.DOCUMENT_POSITION_CONTAINED_BY||r&Node.DOCUMENT_POSITION_CONTAINED_BY;return r=l&&a&&i&Node.DOCUMENT_POSITION_FOLLOWING&&r&Node.DOCUMENT_POSITION_PRECEDING,t=l&&t===e||a&&o===e||s||r?Node.DOCUMENT_POSITION_CONTAINED_BY:!l&&t===e||!a&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:i,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||Qw(t,this._fragmentFiber,n[0],n[n.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function Qw(e,t,n,l,o){var a=Ia(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(n=!!a)e:{for(;a!==null;){if(a.tag===7&&(a===t||a.alternate===t)){n=!0;break e}a=a.return}n=!1}return n}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(a===null)return a=o.ownerDocument,o===a||o===a.documentElement||o===a.body;e:{for(a=t,t=li(t);a!==null;){if(!(a.tag!==5&&a.tag!==3&&a.tag!==27||a!==t&&a.alternate!==t)){a=!0;break e}a=a.return}a=!1}return a}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!a)&&!(t=a===n)&&(t=af(n,a,g1),t===null?t=!1:(Gn(t,!0,xv,a,n),a=zi,zi=null,t=a!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!a)&&!(t=a===l)&&(t=af(l,a,g1),t===null?t=!1:(Gn(t,!0,wv,a,l),a=zi,of=zi=null,t=a!==null)),t):!1}function Hg(e,t){var n=e.ownerDocument.createRange();n.selectNodeContents(e),e=n.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}il.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(H(566));var t=[];Gn(this._fragmentFiber.child,!1,sh,t,void 0,void 0);var n=e!==!1;if(t.length===0){var l=ly(this._fragmentFiber);if(l=n?l[1]||l[0]||li(this._fragmentFiber):l[0]||l[1],l===null)return;if(l.tag===6){e=ln(l),Hg(e,n);return}if(l=ln(l),l.nodeType!==9){if(l.nodeType===11){n="host"in l?l.host:null,n!==null&&n.scrollIntoView(e);return}l.scrollIntoView(e)}}for(l=n?t.length-1:0;l!==(n?-1:t.length);){var o=t[l];o.tag===6?(o=ln(o),Hg(o,n)):ln(o).scrollIntoView(e),l+=n?-1:1}};function Gw(e,t){return e=ln(e),B5(e,t),!1}function B5(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function H5(e,t){var n=t._eventListeners;if(n!==null)for(var l=0;l<n.length;l++){var o=n[l];e.addEventListener(o.type,o.attachedListener,cr(o.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(a){for(var i=0,r=0;r<Bl.length;r++){var s=Bl[r];(s.fragmentInstance!==t||s.observer!==a||s.instance!==e)&&(Bl[i++]=s)}Bl.length=i,a.observe(e)}),B5(e,t))}function Vw(e,t){var n=t._eventListeners;if(n!==null)for(var l=0;l<n.length;l++){var o=n[l];e.removeEventListener(o.type,o.attachedListener,cr(o.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(a){typeof a.rootMargin=="string"?Xw(t,a,e):a.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function u0(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":u0(n),Wu(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function Ww(e,t,n,l){for(;e.nodeType===1;){var o=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!l&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(l){if(!e[Ys])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(a=e.getAttribute("rel"),a==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(a!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(a=e.getAttribute("src"),(a!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&a&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var a=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===a)return e}else return e;if(e=Sl(e.nextSibling),e===null)break}return null}function Fw(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=Sl(e.nextSibling),e===null))return null;return e}function $5(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Sl(e.nextSibling),e===null))return null;return e}function d0(e){return e.data==="$?"||e.data==="$~"}function ch(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function Zw(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var l=function(){t(),n.removeEventListener("DOMContentLoaded",l)};n.addEventListener("DOMContentLoaded",l),e._reactRetry=l}}function Sl(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var _0=null;function $g(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return Sl(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function Ug(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function Kw(e,t){function n(){l=!0}if(e.ownerDocument.activeElement===e)return!0;var l=!1;try{e.ownerDocument.addEventListener("focus",n,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",n,!0)}return l}function Jw(e){zg(function(){zg(function(t){return e(t)})})}function U5(e,t,n){switch(t=As(n),e){case"html":if(e=t.documentElement,!e)throw Error(H(452));return e;case"head":if(e=t.head,!e)throw Error(H(453));return e;case"body":if(e=t.body,!e)throw Error(H(454));return e;default:throw Error(H(451))}}function Y5(e,t,n){for(var l in n){var o=n[l];n.hasOwnProperty(l)&&o!=null&&vt(e,t,l,null,Ew,o)}n.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===to&&(e.onclick=null),Wu(e)}function lf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Wu(e)}var kl=new Map,Yg=new Set;function Ds(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Bo=ft.d;ft.d={f:Pw,r:e4,D:t4,C:n4,L:l4,m:o4,X:i4,S:a4,M:r4};function Pw(){var e=Bo.f(),t=sd();return e||t}function e4(e){var t=mr(e);t!==null&&t.tag===5&&t.type==="form"?kp(t):Bo.r(e)}var br=typeof document>"u"?null:document;function j5(e,t,n){var l=br;if(l&&typeof t=="string"&&t){var o=vl(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof n=="string"&&(o+='[crossorigin="'+n+'"]'),Yg.has(o)||(Yg.add(o),e={rel:e,crossOrigin:n,href:t},l.querySelector(o)===null&&(t=l.createElement("link"),bn(t,"link",e),sn(t),l.head.appendChild(t)))}}function t4(e){Bo.D(e),j5("dns-prefetch",e,null)}function n4(e,t){Bo.C(e,t),j5("preconnect",e,t)}function l4(e,t,n){Bo.L(e,t,n);var l=br;if(l&&e&&t){var o='link[rel="preload"][as="'+vl(t)+'"]';t==="image"&&n&&n.imageSrcSet?(o+='[imagesrcset="'+vl(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(o+='[imagesizes="'+vl(n.imageSizes)+'"]')):o+='[href="'+vl(e)+'"]';var a=o;switch(t){case"style":a=ur(e);break;case"script":a=vr(e)}if(!(kl.has(a)||(e=Nt({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),kl.set(a,e),l.querySelector(o)!==null||t==="style"&&l.querySelector(Gs(a))||t==="script"&&l.querySelector(Vs(a))))){var i=l.createElement("link");bn(i,"link",e),t==="style"&&(i[wu]=!0,i.onload=i.onerror=function(){gy(i)}),sn(i),l.head.appendChild(i)}}}function o4(e,t){Bo.m(e,t);var n=br;if(n&&e){var l=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+vl(l)+'"][href="'+vl(e)+'"]',a=o;switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=vr(e)}if(!kl.has(a)&&(e=Nt({rel:"modulepreload",href:e},t),kl.set(a,e),n.querySelector(o)===null)){switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Vs(a)))return}l=n.createElement("link"),bn(l,"link",e),sn(l),n.head.appendChild(l)}}}function a4(e,t,n){Bo.S(e,t,n);var l=br;if(l&&e){var o=Qi(l).hoistableStyles,a=ur(e);t=t||"default";var i=o.get(a);if(!i){var r={loading:0,preload:null};if(i=l.querySelector(Gs(a)))r.loading=5;else{e=Nt({rel:"stylesheet",href:e,"data-precedence":t},n),(n=kl.get(a))&&uh(e,n);var s=i=l.createElement("link");sn(s),bn(s,"link",e),s._p=new Promise(function(d,f){s.onload=d,s.onerror=f}),s.addEventListener("load",function(){r.loading|=1}),s.addEventListener("error",function(){r.loading|=2}),r.loading|=4,fu(i,t,l)}i={type:"stylesheet",instance:i,count:1,state:r},o.set(a,i)}}}function i4(e,t){Bo.X(e,t);var n=br;if(n&&e){var l=Qi(n).hoistableScripts,o=vr(e),a=l.get(o);a||(a=n.querySelector(Vs(o)),a||(e=Nt({src:e,async:!0},t),(t=kl.get(o))&&dh(e,t),a=n.createElement("script"),sn(a),bn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},l.set(o,a))}}function r4(e,t){Bo.M(e,t);var n=br;if(n&&e){var l=Qi(n).hoistableScripts,o=vr(e),a=l.get(o);a||(a=n.querySelector(Vs(o)),a||(e=Nt({src:e,async:!0,type:"module"},t),(t=kl.get(o))&&dh(e,t),a=n.createElement("script"),sn(a),bn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},l.set(o,a))}}function jg(e,t,n,l){var o=(o=na.current)?Ds(o):null;if(!o)throw Error(H(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(n=ur(n.href),t=Qi(o).hoistableStyles,l=t.get(n),l||(l={type:"style",instance:null,count:0,state:null},t.set(n,l)),l):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=ur(n.href);var a=Qi(o).hoistableStyles,i=a.get(e);if(i||(o=o.ownerDocument||o,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(e,i),(a=o.querySelector(Gs(e)))?a._p||(i.instance=a,i.state.loading=5):(a=kl.get(e),a||(a={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},kl.set(e,a)),s4(o,e,a,i.state))),t&&l===null)throw Error(H(528,""));return i}if(t&&l!==null)throw Error(H(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(n=vr(n),t=Qi(o).hoistableScripts,l=t.get(n),l||(l={type:"script",instance:null,count:0,state:null},t.set(n,l)),l):{type:"void",instance:null,count:0,state:null};default:throw Error(H(444,e))}}function ur(e){return'href="'+vl(e)+'"'}function Gs(e){return'link[rel="stylesheet"]['+e+"]"}function I5(e){return Nt({},e,{"data-precedence":e.precedence,precedence:null})}function s4(e,t,n,l){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[wu]!==!0){l.loading=1;return}}else t=e.createElement("link"),t[wu]=!0,t.onload=t.onerror=gy.bind(null,t),bn(t,"link",n),sn(t),e.head.appendChild(t);l.preload=t,t.addEventListener("load",function(){return l.loading|=1}),t.addEventListener("error",function(){return l.loading|=2})}function vr(e){return'[src="'+vl(e)+'"]'}function Vs(e){return"script[async]"+e}function Ig(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var l=e.querySelector('style[data-href~="'+vl(n.href)+'"]');if(l)return t.instance=l,sn(l),l;var o=Nt({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return l=(e.ownerDocument||e).createElement("style"),sn(l),bn(l,"style",o),fu(l,n.precedence,e),t.instance=l;case"stylesheet":o=ur(n.href);var a=e.querySelector(Gs(o));if(a)return t.state.loading|=4,t.instance=a,sn(a),a;l=I5(n),(o=kl.get(o))&&uh(l,o),a=(e.ownerDocument||e).createElement("link"),sn(a);var i=a;return i._p=new Promise(function(r,s){i.onload=r,i.onerror=s}),bn(a,"link",l),t.state.loading|=4,fu(a,n.precedence,e),t.instance=a;case"script":return a=vr(n.src),(o=e.querySelector(Vs(a)))?(t.instance=o,sn(o),o):(l=n,(o=kl.get(a))&&(l=Nt({},n),dh(l,o)),e=e.ownerDocument||e,o=e.createElement("script"),sn(o),bn(o,"link",l),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(H(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(l=t.instance,t.state.loading|=4,fu(l,n.precedence,e));return t.instance}function fu(e,t,n){for(var l=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=l.length?l[l.length-1]:null,a=o,i=0;i<l.length;i++){var r=l[i];if(r.dataset.precedence===t)a=r;else if(a!==o)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function uh(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function dh(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var hu=null;function Xg(e,t,n){if(hu===null){var l=new Map,o=hu=new Map;o.set(n,l)}else o=hu,l=o.get(n),l||(l=new Map,o.set(n,l));if(l.has(e))return l;for(l.set(e,null),n=n.getElementsByTagName(e),o=0;o<n.length;o++){var a=n[o];if(!(a[Ys]||a[mn]||e==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var i=a.getAttribute(t)||"";i=e+i;var r=l.get(i);r?r.push(a):l.set(i,[a])}}return l}function f0(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function c4(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function qg(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function X5(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function q5(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Qg(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=q5(t),e.suspenseyImages.push(t)),e=_4.bind(e),t.decode().then(e,e))}function u4(e,t,n,l){if(n.type==="stylesheet"&&(typeof l.media!="string"||matchMedia(l.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var o=ur(l.href),a=t.querySelector(Gs(o));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=zs.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,sn(a);return}a=t.ownerDocument||t,l=I5(l),(o=kl.get(o))&&uh(l,o),a=a.createElement("link"),sn(a);var i=a;i._p=new Promise(function(r,s){i.onload=r,i.onerror=s}),bn(a,"link",l),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=zs.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var mu=0;function d4(e,t){return e.stylesheets&&e.count===0&&gu(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var l=setTimeout(function(){if(e.stylesheets&&gu(e,e.stylesheets),e.unsuspend){var a=e.unsuspend;e.unsuspend=null,a()}},6e4+t);0<e.imgBytes&&mu===0&&(mu=62500*Nw());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&gu(e,e.stylesheets),e.unsuspend)){var a=e.unsuspend;e.unsuspend=null,a()}},(e.imgBytes>mu?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(l),clearTimeout(o)}}:null}function Q5(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)gu(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function zs(){this.count--,Q5(this)}function _4(){this.imgCount--,Q5(this)}var Qu=null;function gu(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Qu=new Map,t.forEach(f4,e),Qu=null,zs.call(e))}function f4(e,t){if(!(t.state.loading&4)){var n=Qu.get(e);if(n)var l=n.get(null);else{n=new Map,Qu.set(e,n);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<o.length;a++){var i=o[a];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),l=i)}l&&n.set(null,l)}o=t.instance,i=o.getAttribute("data-precedence"),a=n.get(i)||l,a===l&&n.set(null,o),n.set(i,o),this.count++,l=zs.bind(this),o.addEventListener("load",l),o.addEventListener("error",l),a?a.parentNode.insertBefore(o,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var dr={$$typeof:eo,Provider:null,Consumer:null,_currentValue:qa,_currentValue2:qa,_threadCount:0};function h4(e,t,n,l,o,a,i,r,s){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=A_(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=A_(0),this.hiddenUpdates=A_(null),this.identifierPrefix=l,this.onUncaughtError=o,this.onCaughtError=a,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=s,this.transitionTypes=null,this.incompleteTransitions=new Map}function G5(e,t,n,l,o,a,i,r,s,d,f,h){return e=new h4(e,t,n,i,s,d,f,h,r),t=1,a===!0&&(t|=24),a=qn(3,null,null,t),e.current=a,a.stateNode=e,t=A0(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:l,isDehydrated:n,cache:t},O0(a),e}function V5(e){return e?(e=ji,e):ji}function W5(e,t,n,l,o,a){o=V5(o),l.context===null?l.context=o:l.pendingContext=o,l=oa(t),l.payload={element:n},a=a===void 0?null:a,a!==null&&(l.callback=a),n=aa(e,l,t),n!==null&&(Qn(n,e,t),ds(n,e,t))}function Gg(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function _h(e,t){Gg(e,t),(e=e.alternate)&&Gg(e,t)}function F5(e){if(e.tag===13||e.tag===31){var t=ii(e,67108864);t!==null&&Qn(t,e,67108864),_h(e,67108864)}}function Vg(e){if(e.tag===13||e.tag===31){var t=ol();t=b0(t);var n=ii(e,t);n!==null&&Qn(n,e,t),_h(e,t)}}var _r=!0;function m4(e,t,n,l){var o=ve.T;ve.T=null;var a=ft.p;try{ft.p=2,fh(e,t,n,l)}finally{ft.p=a,ve.T=o}}function g4(e,t,n,l){var o=ve.T;ve.T=null;var a=ft.p;try{ft.p=8,fh(e,t,n,l)}finally{ft.p=a,ve.T=o}}function fh(e,t,n,l){if(_r){var o=h0(l);if(o===null)ef(e,t,l,Gu,n),Wg(e,l);else if(p4(o,e,t,n,l))l.stopPropagation();else if(Wg(e,l),t&4&&-1<y4.indexOf(e)){for(;o!==null;){var a=mr(o);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var i=Ua(a.pendingLanes);if(i!==0){var r=a;for(r.pendingLanes|=2,r.entangledLanes|=2;i;){var s=1<<31-ll(i);r.entanglements[1]|=s,i&=~s}so(a),(_t&6)===0&&(Yu=tl()+500,Qs(0,!1))}}break;case 31:case 13:r=ii(a,2),r!==null&&Qn(r,a,2),sd(),_h(a,2)}if(a=h0(l),a===null&&ef(e,t,l,Gu,n),a===o)break;o=a}o!==null&&l.stopPropagation()}else ef(e,t,l,null,n)}}function h0(e){return e=w0(e),hh(e)}var Gu=null;function hh(e){if(Gu=null,e=Ia(e),e!==null){var t=Bs(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=ey(t),e!==null)return e;e=null}else if(n===31){if(e=ty(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Gu=e,null}function Z5(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Av()){case ry:return 2;case sy:return 8;case xu:case Dv:return 32;case cy:return 268435456;default:return 32}default:return 32}}var m0=!1,ca=null,ua=null,da=null,Os=new Map,Ls=new Map,Fo=[],y4="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Wg(e,t){switch(e){case"focusin":case"focusout":ca=null;break;case"dragenter":case"dragleave":ua=null;break;case"mouseover":case"mouseout":da=null;break;case"pointerover":case"pointerout":Os.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Ls.delete(t.pointerId)}}function es(e,t,n,l,o,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:l,nativeEvent:a,targetContainers:[o]},t!==null&&(t=mr(t),t!==null&&F5(t)),e):(e.eventSystemFlags|=l,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function p4(e,t,n,l,o){switch(t){case"focusin":return ca=es(ca,e,t,n,l,o),!0;case"dragenter":return ua=es(ua,e,t,n,l,o),!0;case"mouseover":return da=es(da,e,t,n,l,o),!0;case"pointerover":var a=o.pointerId;return Os.set(a,es(Os.get(a)||null,e,t,n,l,o)),!0;case"gotpointercapture":return a=o.pointerId,Ls.set(a,es(Ls.get(a)||null,e,t,n,l,o)),!0}return!1}function K5(e){var t=Ia(e.target);if(t!==null){var n=Bs(t);if(n!==null){if(t=n.tag,t===13){if(t=ey(n),t!==null){e.blockedOn=t,v1(e.priority,function(){Vg(n)});return}}else if(t===31){if(t=ty(n),t!==null){e.blockedOn=t,v1(e.priority,function(){Vg(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function yu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=h0(e.nativeEvent);if(n===null){n=e.nativeEvent;var l=new n.constructor(n.type,n);pf=l,n.target.dispatchEvent(l),pf=null}else return t=mr(n),t!==null&&F5(t),e.blockedOn=n,!1;t.shift()}return!0}function Fg(e,t,n){yu(e)&&n.delete(t)}function b4(){m0=!1,ca!==null&&yu(ca)&&(ca=null),ua!==null&&yu(ua)&&(ua=null),da!==null&&yu(da)&&(da=null),Os.forEach(Fg),Ls.forEach(Fg)}function Kc(e,t){e.blockedOn===t&&(e.blockedOn=null,m0||(m0=!0,on.unstable_scheduleCallback(on.unstable_NormalPriority,b4)))}var Jc=null;function Zg(e){Jc!==e&&(Jc=e,on.unstable_scheduleCallback(on.unstable_NormalPriority,function(){Jc===e&&(Jc=null);for(var t=0;t<e.length;t+=3){var n=e[t],l=e[t+1],o=e[t+2];if(typeof l!="function"){if(hh(l||n)===null)continue;break}var a=mr(n);a!==null&&(e.splice(t,3),t-=3,Of(a,{pending:!0,data:o,method:n.method,action:l},l,o))}}))}function fr(e){function t(s){return Kc(s,e)}ca!==null&&Kc(ca,e),ua!==null&&Kc(ua,e),da!==null&&Kc(da,e),Os.forEach(t),Ls.forEach(t);for(var n=0;n<Fo.length;n++){var l=Fo[n];l.blockedOn===e&&(l.blockedOn=null)}for(;0<Fo.length&&(n=Fo[0],n.blockedOn===null);)K5(n),n.blockedOn===null&&Fo.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(l=0;l<n.length;l+=3){var o=n[l],a=n[l+1],i=o[Vn]||null;if(typeof a=="function")i||Zg(n);else if(i){var r=null;if(a&&a.hasAttribute("formAction")){if(o=a,i=a[Vn]||null)r=i.formAction;else if(hh(o)!==null)continue}else r=i.action;typeof r=="function"?n[l+1]=r:(n.splice(l,3),l-=3),Zg(n)}}}function J5(){function e(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(i){return o=i})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),l||setTimeout(n,20)}function n(){if(!l&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var l=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){l=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function mh(e){this._internalRoot=e}dd.prototype.render=mh.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(H(409));var n=t.current,l=ol();W5(n,l,e,t,null,null)};dd.prototype.unmount=mh.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;W5(e.current,2,null,e,null,null),sd(),t[hr]=null}};function dd(e){this._internalRoot=e}dd.prototype.unstable_scheduleHydration=function(e){if(e){var t=my();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Fo.length&&t!==0&&t<Fo[n].priority;n++);Fo.splice(n,0,e),n===0&&K5(e)}};var Kg=Jg.version;if(Kg!=="19.3.0")throw Error(H(527,Kg,"19.3.0"));ft.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(H(188)):(e=Object.keys(e).join(","),Error(H(268,e)));return e=vv(t),e=e!==null?ny(e):null,e=e===null?null:e.stateNode,e};var v4={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:ve,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ts=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ts.isDisabled&&ts.supportsFiber))try{Hs=ts.inject(v4),nl=ts}catch{}var ts;_d.createRoot=function(e,t){if(!Pg(e))throw Error(H(299));var n=!1,l="",o=Dp,a=zp,i=Op;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(l=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(i=t.onRecoverableError)),t=G5(e,1,!1,null,null,n,l,null,o,a,i,J5),e[hr]=t.current,ih(e),new mh(t)};_d.hydrateRoot=function(e,t,n){if(!Pg(e))throw Error(H(299));var l=!1,o="",a=Dp,i=zp,r=Op,s=null;return n!=null&&(n.unstable_strictMode===!0&&(l=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(r=n.onRecoverableError),n.formState!==void 0&&(s=n.formState)),t=G5(e,1,!0,t,n??null,l,o,s,a,i,r,J5),t.context=V5(null),n=t.current,l=ol(),l=b0(l),o=oa(l),o.callback=null,aa(n,o,l),n=l,t.current.lanes=n,Us(t,n),so(t),e[hr]=t.current,ih(e),new dd(t)};_d.version="19.3.0"});var n2=Vl((h7,t2)=>{"use strict";function e2(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e2)}catch(e){console.error(e)}}e2(),t2.exports=P5()});var o2=Vl(fd=>{"use strict";var x4=Symbol.for("react.transitional.element"),w4=Symbol.for("react.fragment");function l2(e,t,n){var l=null;if(n!==void 0&&(l=""+n),t.key!==void 0&&(l=""+t.key),"key"in t){n={};for(var o in t)o!=="key"&&(n[o]=t[o])}else n=t;return t=n.ref,{$$typeof:x4,type:e,key:l,ref:t!==void 0?t:null,props:n}}fd.Fragment=w4;fd.jsx=l2;fd.jsxs=l2});var Pt=Vl((g7,a2)=>{"use strict";a2.exports=o2()});var pb=Te(Ut()),bb=Te(n2());var zd=Te(Ut(),1),C=Te(Ut(),1),Ld=Te(Ut(),1),V2=Te(Fr(),1),Tr=Te(Ut(),1),Nr=Te(Ut(),1),W2=Te(Fr(),1),F2=Te(Pt(),1),un=Te(Ut(),1),lc=Te(Ut(),1),K2=Te(Ut(),1),Rn=Te(Ut(),1),et=Te(Pt(),1),Nh=Te(Pt(),1),te=Te(Pt(),1),uo=Te(Ut(),1),eb=Te(Fr(),1),di=Te(Pt(),1),Rh=Te(Pt(),1),ui=Te(Pt(),1),ct=Te(Ut(),1),u=Te(Pt(),1),Rt=Te(Pt(),1),dn=Te(Ut(),1),wa=Te(Ut(),1),c=Te(Pt(),1),ke=Te(Ut(),1),Ze=Te(Pt(),1),v8=Te(Ut(),1),Wn=Te(Ut(),1),Hh=Te(Pt(),1),Cl=Te(Ut(),1),co=Te(Pt(),1),xa=Te(Ut(),1),ac=Te(Pt(),1),hb=Te(Ut(),1),kr=Te(Pt(),1),Cr=Te(Pt(),1),le=Te(Pt(),1),Hd=Te(Ut(),1),ic=Te(Pt(),1),Q=Te(Pt(),1),mb=Te(Ut(),1),U2=["data-feedback-toolbar","data-annotation-popup","data-annotation-marker"],gh=U2.flatMap(e=>[`:not([${e}])`,`:not([${e}] *)`]).join(""),Eh="feedback-freeze-styles",Th="__agentation_freeze";function S4(){return typeof window>"u"?{frozen:!1,installed:!0,origSetTimeout:setTimeout,origSetInterval:setInterval,origRAF:t=>0,pausedAnimations:[],frozenTimeoutQueue:[],frozenRAFQueue:[]}:window[Th]??{frozen:!1,installed:!1,origSetTimeout:window.setTimeout.bind(window),origSetInterval:window.setInterval.bind(window),origRAF:window.requestAnimationFrame.bind(window),pausedAnimations:[],frozenTimeoutQueue:[],frozenRAFQueue:[]}}var Ve=S4();function Y2(){if(typeof window>"u")return;let e=window;Ve=e[Th]??(e[Th]=Ve),!Ve.installed&&(window.setTimeout=(t,n,...l)=>typeof t=="string"?Ve.origSetTimeout(t,n):Ve.origSetTimeout((...o)=>{Ve.frozen?Ve.frozenTimeoutQueue.push(()=>t(...o)):t(...o)},n,...l),window.setInterval=(t,n,...l)=>typeof t=="string"?Ve.origSetInterval(t,n):Ve.origSetInterval((...o)=>{Ve.frozen||t(...o)},n,...l),window.requestAnimationFrame=t=>Ve.origRAF(n=>{Ve.frozen?Ve.frozenRAFQueue.push(t):t(n)}),Ve.installed=!0)}var st=Ve.origSetTimeout,j2=Ve.origSetInterval,Ad=Ve.origRAF;function k4(e){return e?U2.some(t=>!!e.closest?.(`[${t}]`)):!1}function C4(){if(typeof document>"u"||(Y2(),Ve.frozen))return;Ve.frozen=!0,Ve.frozenTimeoutQueue=[],Ve.frozenRAFQueue=[];let e=document.getElementById(Eh);e||(e=document.createElement("style"),e.id=Eh),e.textContent=`
    *${gh},
    *${gh}::before,
    *${gh}::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
  `,document.head.appendChild(e),Ve.pausedAnimations=[];try{document.getAnimations().forEach(t=>{if(t.playState!=="running")return;let n=t.effect?.target;k4(n)||(t.pause(),Ve.pausedAnimations.push(t))})}catch{}document.querySelectorAll("video").forEach(t=>{t.paused||(t.dataset.wasPaused="false",t.pause())})}function i2(){if(typeof document>"u"||!Ve.frozen)return;Ve.frozen=!1;let e=Ve.frozenTimeoutQueue;Ve.frozenTimeoutQueue=[];for(let n of e)Ve.origSetTimeout(()=>{if(Ve.frozen){Ve.frozenTimeoutQueue.push(n);return}try{n()}catch(l){console.warn("[agentation] Error replaying queued timeout:",l)}},0);let t=Ve.frozenRAFQueue;Ve.frozenRAFQueue=[];for(let n of t)Ve.origRAF(l=>{if(Ve.frozen){Ve.frozenRAFQueue.push(n);return}n(l)});for(let n of Ve.pausedAnimations)try{n.play()}catch(l){console.warn("[agentation] Error resuming animation:",l)}Ve.pausedAnimations=[],document.getElementById(Eh)?.remove(),document.querySelectorAll("video").forEach(n=>{n.dataset.wasPaused==="false"&&(n.play().catch(()=>{}),delete n.dataset.wasPaused)})}function r2(){let e=(0,zd.useMemo)(()=>{let t=0,n=new Set,l=()=>(n.forEach(clearTimeout),n.clear(),++t),o=i=>i===t;return{start:l,isCurrent:o,schedule:(i,r,s)=>{if(!o(i))return;let d=st(()=>{n.delete(d),o(i)&&r()},s);n.add(d)}}},[]);return(0,zd.useEffect)(()=>()=>{e.start()},[e]),e}function M4(e,t,n,l){let o=d=>l.get(d.id)??d.id,a=new Map(e.map(d=>[o(d),d])),i=new Map(t.map(d=>[o(d),d])),r=new Set(n.map(d=>d.id)),s=[];for(let d of n){let f=a.get(d.id),h=i.get(d.id);if(f&&!h)continue;let _=h&&f&&h.comment!==f.comment;s.push(_?{...d,comment:h.comment}:d)}for(let[d,f]of i)!a.has(d)&&!r.has(d)&&s.push(f);return s}function rc(e){if(e.tagName!=="IFRAME")return null;try{return e.contentDocument}catch{return null}}function rl(e,t=document){if(e===t)return null;try{return e.defaultView?.frameElement}catch{return null}}function $h(e){return e.nodeType===11&&"host"in e}function Er(e){let t=e.getBoundingClientRect(),n=e.offsetWidth?t.width/e.offsetWidth:1,l=e.offsetHeight?t.height/e.offsetHeight:1,o=e.ownerDocument.defaultView?.getComputedStyle(e),a=f=>parseFloat(f||"0")||0,i=a(o?.paddingLeft),r=a(o?.paddingTop),s=e.clientWidth-i-a(o?.paddingRight),d=e.clientHeight-r-a(o?.paddingBottom);return{x:t.left+(e.clientLeft+i)*n,y:t.top+(e.clientTop+r)*l,sx:n,sy:l,width:s*n,height:d*l}}function s2(e){try{let t=new URL(e);return t.origin+t.pathname}catch{return e}}function E4(e,t,n,l=document){let o=rl(e,l);for(;o;){let a=Er(o);t=a.x+t*a.sx,n=a.y+n*a.sy,o=rl(o.ownerDocument,l)}return{x:t,y:n}}function en(e,t=document){let n=e.getBoundingClientRect();return I2(e.ownerDocument,n,t)}function I2(e,t,n){if(!rl(e,n))return t;let l=t.left,o=t.top,a=t.right,i=t.bottom,r=rl(e,n);for(;r;){let s=Er(r);l=Math.max(s.x,s.x+l*s.sx),o=Math.max(s.y,s.y+o*s.sy),a=Math.min(s.x+s.width,s.x+a*s.sx),i=Math.min(s.y+s.height,s.y+i*s.sy),r=rl(r.ownerDocument,n)}return new DOMRect(l,o,Math.max(0,a-l),Math.max(0,i-o))}function Od(e){let t=[];for(let n of e.querySelectorAll("*"))n.tagName==="IFRAME"&&t.push(n),n.shadowRoot&&n.tagName!=="AGENTATION-TOOLBAR"&&t.push(...Od(n.shadowRoot));return t}function T4(e,t,n,l=document){let o=[];for(let h=rl(e.ownerDocument,l);h;h=rl(h.ownerDocument,l))o.unshift(h);if(!o.length)return;let a=o.map(h=>{let _=Er(h);return t=(t-_.x)/_.sx,n=(n-_.y)/_.sy,{index:Od(h.ownerDocument).indexOf(h),id:h.id||void 0,url:rc(h)?.URL??""}}),i=e.ownerDocument.defaultView,r=!1;for(let h=e;h;h=h.parentElement)if(["fixed","sticky"].includes(i.getComputedStyle(h).position)){r=!0;break}let s=r?0:i.scrollX,d=r?0:i.scrollY,f=e.getBoundingClientRect();return{path:a,x:t+s,y:n+d,fixed:r,boundingBox:{x:f.left+s,y:f.top+d,width:f.width,height:f.height}}}function N4(e=document){let t=new Map,n=l=>{let o=t.get(l);return o||(o=Od(l),t.set(l,o)),o};return l=>R4(l,e,n)}function R4(e,t=document,n=Od){let l=e.frame;if(!l)return e;let o=t;for(let b of l.path){let w=n(o),N=b.id?w.find(y=>y.id===b.id):w[b.index],M=N&&rc(N);if(!M||s2(M.URL)!==s2(b.url))return null;o=M}let a=o.defaultView,i=l.fixed?0:a.scrollX,r=l.fixed?0:a.scrollY,s=l.x-i,d=l.y-r;for(let b=o,w=rl(o,t);w;w=rl(b,t)){let N=b.defaultView;if(s<0||d<0||s>N.innerWidth||d>N.innerHeight)return null;let M=Er(w);if(M.width<=0||M.height<=0)return null;s=M.x+s*M.sx,d=M.y+d*M.sy,b=w.ownerDocument}let f=l.boundingBox,h=I2(o,new DOMRect(f.x-i,f.y-r,f.width,f.height),t),_=t.defaultView;return{...e,x:s/_.innerWidth*100,y:d+(e.isFixed?0:_.scrollY),boundingBox:{x:h.x,y:h.y+(e.isFixed?0:_.scrollY),width:h.width,height:h.height}}}function A4(e,t,n){if(!("clientX"in e)||t===n)return e;let l=E4(t,e.clientX,e.clientY,n);return new Proxy(e,{get(o,a){if(a==="clientX")return l.x;if(a==="clientY")return l.y;let i=Reflect.get(o,a,o);return typeof i=="function"?i.bind(o):i}})}function D4(e,t){let n=new Set([e]),l=new Set,o=[],a=new Set,i=!1,r=!1,s,d=(h,_)=>{let b=w=>h.listener(A4(w,_,e));h.handlers.set(_,b),_.addEventListener(h.type,b,h.options)},f=()=>{if(i=!1,!r)return;let h=new Set,_=new Set,b=[],w=N=>{b.push(N);for(let M of N.querySelectorAll("*"))if(!M.matches("agentation-toolbar, [data-agentation-portal]")&&(M.shadowRoot&&w(M.shadowRoot),M.tagName==="IFRAME")){_.add(M);let y=rc(M);y&&!h.has(y)&&(h.add(y),w(y))}};h.add(e),w(e);for(let N of n)if(!h.has(N)){for(let M of l){let y=M.handlers.get(N);y&&N.removeEventListener(M.type,y,M.options),M.handlers.delete(N)}n.delete(N)}for(let N of h)if(!n.has(N)){n.add(N);for(let M of l)d(M,N)}for(let N of a)_.has(N)||N.removeEventListener("load",f);for(let N of _)a.has(N)||N.addEventListener("load",f);a=_,s?.disconnect(),a.forEach(N=>s?.observe(N)),o.forEach(N=>N.disconnect()),o=b.map(N=>{let M=new MutationObserver(y=>{y.some(g=>[...g.addedNodes,...g.removedNodes].some(k=>k.nodeType===1&&!k.closest("agentation-toolbar, [data-agentation-portal]")&&(k.tagName==="IFRAME"||!!k.shadowRoot||!!k.querySelector("iframe"))))&&!i&&(i=!0,queueMicrotask(f))});return M.observe(N,{childList:!0,subtree:!0}),M}),t?.()};return{start(){r||(r=!0,typeof ResizeObserver=="function"&&(s=new ResizeObserver(()=>t?.())),f())},stop(){r=!1,s?.disconnect(),s=void 0,o.forEach(h=>h.disconnect()),o=[];for(let h of a)h.removeEventListener("load",f);a.clear();for(let h of l)for(let[_,b]of h.handlers)_.removeEventListener(h.type,b,h.options);l.clear(),n.clear(),n.add(e)},addEventListener(h,_,b){let w={type:h,listener:_,options:b,handlers:new Map};l.add(w);for(let N of n)d(w,N)},removeEventListener(h,_,b){for(let w of l)if(w.type===h&&w.listener===_){for(let[N,M]of w.handlers)N.removeEventListener(h,M,w.options);l.delete(w)}},querySelectorAll(h){return[...n].flatMap(_=>[..._.querySelectorAll(h)])}}}var Uh=["data-testid","data-test","data-qa","data-cy","data-component"];function ec(e,t=Uh){let n={};for(let l of[...new Set(t)].slice(0,16)){if(!/^[a-zA-Z_][\w:.-]*$/.test(l))continue;let o=e.getAttribute(l);o!=null&&o.length<=500&&Object.defineProperty(n,l,{value:o,enumerable:!0})}return n}function z4(e,t=Uh){return Object.entries(ec(e,t)).filter(([n,l])=>/^data-[a-z0-9_-]+$/.test(n)&&l.length<=120).slice(0,2).map(([n,l])=>`[${n}="${l.replace(/[\\"\n\r\f\0]/g,o=>o==="\\"||o==='"'?`\\${o}`:`\\${o.charCodeAt(0).toString(16)} `)}"]`).join("")}function Mr(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();return $h(t)?t.host:null}function wn(e,t){let n=e;for(;n;){if(n.matches(t))return n;n=Mr(n)}return null}function X2(e,t=4,n){let l=[],o=e,a=0;for(;o&&a<t;){let r=o.tagName.toLowerCase();if(r==="html"||r==="body"){l.length===0&&l.push(r);break}let s=r;if(o.id)s=`#${o.id}`;else if(o.className&&typeof o.className=="string"){let f=o.className.split(/\s+/).find(h=>h.length>2&&!h.match(/^[a-z]{1,2}$/)&&!h.match(/[A-Z0-9]{5,}/));f&&(s=`.${f.split("_")[0]}`)}s+=z4(o,n);let d=Mr(o);!o.parentElement&&d&&(s=`\u27E8shadow\u27E9 ${s}`),l.unshift(s),o=d,a++}let i=rl(e.ownerDocument);return(i?X2(i,2)+" > \u27E8iframe\u27E9 ":"")+l.join(" > ")}function O4(e){let t="";for(let n of e.childNodes)if(n.nodeType===Node.TEXT_NODE){let l=n.textContent?.trim();l&&(t+=(t?" ":"")+l)}return t}function Sr(e,t){let n=X2(e,4,t);if(e.dataset.element)return{name:e.dataset.element,path:n};let l=e.tagName.toLowerCase();if(["path","circle","rect","line","g"].includes(l)){let o=wn(e,"svg");if(o){let a=Mr(o);if(a?.namespaceURI==="http://www.w3.org/1999/xhtml")return{name:`graphic in ${Sr(a).name}`,path:n}}return{name:"graphic element",path:n}}if(l==="svg"){let o=Mr(e);if(o?.tagName.toLowerCase()==="button"){let a=o.textContent?.trim();return{name:a?`icon in "${a}" button`:"button icon",path:n}}return{name:"icon",path:n}}if(l==="button"){let o=e.textContent?.trim(),a=e.getAttribute("aria-label");return a?{name:`button [${a}]`,path:n}:{name:o?`button "${o.slice(0,25)}"`:"button",path:n}}if(l==="a"){let o=e.textContent?.trim(),a=e.getAttribute("href");return o?{name:`link "${o.slice(0,25)}"`,path:n}:a?{name:`link to ${a.slice(0,30)}`,path:n}:{name:"link",path:n}}if(l==="input"){let o=e.getAttribute("type")||"text",a=e.getAttribute("placeholder"),i=e.getAttribute("name");return a?{name:`input "${a}"`,path:n}:i?{name:`input [${i}]`,path:n}:{name:`${o} input`,path:n}}if(["h1","h2","h3","h4","h5","h6"].includes(l)){let o=e.textContent?.trim();return{name:o?`${l} "${o.slice(0,35)}"`:l,path:n}}if(l==="p"){let o=e.textContent?.trim();return o?{name:`paragraph: "${o.slice(0,40)}${o.length>40?"...":""}"`,path:n}:{name:"paragraph",path:n}}if(l==="span"||l==="label"){let o=e.textContent?.trim();return o&&o.length<40?{name:`"${o}"`,path:n}:{name:l,path:n}}if(l==="li"){let o=e.textContent?.trim();return o&&o.length<40?{name:`list item: "${o.slice(0,35)}"`,path:n}:{name:"list item",path:n}}if(l==="blockquote")return{name:"blockquote",path:n};if(l==="code"){let o=e.textContent?.trim();return o&&o.length<30?{name:`code: \`${o}\``,path:n}:{name:"code",path:n}}if(l==="pre")return{name:"code block",path:n};if(l==="img"){let o=e.getAttribute("alt");return{name:o?`image "${o.slice(0,30)}"`:"image",path:n}}if(l==="video")return{name:"video",path:n};if(["div","section","article","nav","header","footer","aside","main"].includes(l)){let o=e.className,a=e.getAttribute("role"),i=e.getAttribute("aria-label");if(i)return{name:`${l} [${i}]`,path:n};if(a)return{name:`${a}`,path:n};let r=O4(e);if(r&&r.length<50)return{name:`"${r}"`,path:n};if(typeof o=="string"&&o){let s=o.split(/[\s_-]+/).map(d=>d.replace(/[A-Z0-9]{5,}.*$/,"")).filter(d=>d.length>2&&!/^[a-z]{1,2}$/.test(d)).slice(0,2);if(s.length>0)return{name:s.join(" "),path:n}}return{name:l==="div"?"container":l,path:n}}return{name:l,path:n}}function Ws(e){let t=[],n=e.textContent?.trim();n&&n.length<100&&t.push(n);let l=e.previousElementSibling;if(l){let a=l.textContent?.trim();a&&a.length<50&&t.unshift(`[before: "${a.slice(0,40)}"]`)}let o=e.nextElementSibling;if(o){let a=o.textContent?.trim();a&&a.length<50&&t.push(`[after: "${a.slice(0,40)}"]`)}return t.join(" ")}function hd(e){let t=Mr(e);if(!t)return"";let n=e.getRootNode(),o=($h(n)&&e.parentElement?Array.from(e.parentElement.children):Array.from(t.children)).filter(f=>f!==e&&f.namespaceURI==="http://www.w3.org/1999/xhtml");if(o.length===0)return"";let a=o.slice(0,4).map(f=>{let h=f.tagName.toLowerCase(),_=f.className,b="";if(typeof _=="string"&&_){let w=_.split(/\s+/).map(N=>N.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(N=>N.length>2&&!/^[a-z]{1,2}$/.test(N));w&&(b=`.${w}`)}if(h==="button"||h==="a"){let w=f.textContent?.trim().slice(0,15);if(w)return`${h}${b} "${w}"`}return`${h}${b}`}),r=t.tagName.toLowerCase();if(typeof t.className=="string"&&t.className){let f=t.className.split(/\s+/).map(h=>h.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(h=>h.length>2&&!/^[a-z]{1,2}$/.test(h));f&&(r=`.${f}`)}let s=t.children.length,d=s>a.length+1?` (${s} total in ${r})`:"";return a.join(", ")+d}function Fs(e){let t=e.className;return typeof t!="string"||!t?"":t.split(/\s+/).filter(l=>l.length>0).map(l=>{let o=l.match(/^([a-zA-Z][a-zA-Z0-9_-]*?)(?:_[a-zA-Z0-9]{5,})?$/);return o?o[1]:l}).filter((l,o,a)=>a.indexOf(l)===o).join(", ")}var q2=new Set(["none","normal","auto","0px","rgba(0, 0, 0, 0)","transparent","static","visible"]),L4=new Set(["p","span","h1","h2","h3","h4","h5","h6","label","li","td","th","blockquote","figcaption","caption","legend","dt","dd","pre","code","em","strong","b","i","a","time","cite","q"]),B4=new Set(["input","textarea","select"]),H4=new Set(["img","video","canvas","svg"]),$4=new Set(["div","section","article","nav","header","footer","aside","main","ul","ol","form","fieldset"]);function md(e){if(typeof window>"u")return{};let t=(e.ownerDocument.defaultView??window).getComputedStyle(e),n={},l=e.tagName.toLowerCase(),o;L4.has(l)?o=["color","fontSize","fontWeight","fontFamily","lineHeight"]:l==="button"||l==="a"&&e.getAttribute("role")==="button"?o=["backgroundColor","color","padding","borderRadius","fontSize"]:B4.has(l)?o=["backgroundColor","color","padding","borderRadius","fontSize"]:H4.has(l)?o=["width","height","objectFit","borderRadius"]:$4.has(l)?o=["display","padding","margin","gap","backgroundColor"]:o=["color","fontSize","margin","padding","backgroundColor"];for(let a of o){let i=a.replace(/([A-Z])/g,"-$1").toLowerCase(),r=t.getPropertyValue(i);r&&!q2.has(r)&&(n[a]=r)}return n}var U4=["color","backgroundColor","borderColor","fontSize","fontWeight","fontFamily","lineHeight","letterSpacing","textAlign","width","height","padding","margin","border","borderRadius","display","position","top","right","bottom","left","zIndex","flexDirection","justifyContent","alignItems","gap","opacity","visibility","overflow","boxShadow","transform"];function gd(e){if(typeof window>"u")return"";let t=(e.ownerDocument.defaultView??window).getComputedStyle(e),n=[];for(let l of U4){let o=l.replace(/([A-Z])/g,"-$1").toLowerCase(),a=t.getPropertyValue(o);a&&!q2.has(a)&&n.push(`${o}: ${a}`)}return n.join("; ")}function Y4(e){if(!e)return;let t={},n=e.split(";").map(l=>l.trim()).filter(Boolean);for(let l of n){let o=l.indexOf(":");if(o>0){let a=l.slice(0,o).trim(),i=l.slice(o+1).trim();a&&i&&(t[a]=i)}}return Object.keys(t).length>0?t:void 0}function yd(e){let t=[],n=e.getAttribute("role"),l=e.getAttribute("aria-label"),o=e.getAttribute("aria-describedby"),a=e.getAttribute("tabindex"),i=e.getAttribute("aria-hidden");return n&&t.push(`role="${n}"`),l&&t.push(`aria-label="${l}"`),o&&t.push(`aria-describedby="${o}"`),a&&t.push(`tabindex=${a}`),i==="true"&&t.push("aria-hidden"),e.matches("a, button, input, select, textarea, [tabindex]")&&t.push("focusable"),t.join(", ")}function tc(e){let t=[],n=e;for(;n&&n.tagName.toLowerCase()!=="html";){let o=n.tagName.toLowerCase(),a=o;if(n.id)a=`${o}#${n.id}`;else if(n.className&&typeof n.className=="string"){let r=n.className.split(/\s+/).map(s=>s.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(s=>s.length>2);r&&(a=`${o}.${r}`)}let i=Mr(n);!n.parentElement&&i&&(a=`\u27E8shadow\u27E9 ${a}`),t.unshift(a),n=i}let l=rl(e.ownerDocument);return(l?tc(l)+" > \u27E8iframe\u27E9 ":"")+t.join(" > ")}var Q2="agentation-toolbar, [data-agentation-root], [data-feedback-toolbar], [data-annotation-popup], [data-annotation-marker]",j4=new Set(["DIV","SPAN","SECTION","ARTICLE","MAIN","ASIDE","HEADER","FOOTER","NAV"]);function Nd(e,t){let n=document.elementFromPoint(e,t),l=new Set;for(;n&&!l.has(n);){l.add(n);let o=rc(n),a;if(o){let i=Er(n);e=(e-i.x)/i.sx,t=(t-i.y)/i.sy,a=o.elementFromPoint?.(e,t)}else a=n.shadowRoot?.elementFromPoint?.(e,t);if(!a||a===n)break;n=a}return n}function I4(e){if(typeof e.checkVisibility=="function")return e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0});let t=getComputedStyle(e);if(t.visibility==="hidden"||t.visibility==="collapse")return!1;let n=e;for(;n;){let l=getComputedStyle(n);if(l.opacity==="0"||l.display==="none"||l.contentVisibility==="hidden")return!1;let o=n.getRootNode();n=n.parentElement||($h(o)?o.host:null)}return!0}function G2(e,t){let n=[],l=new Set,o=(a,i,r)=>{for(let s of a){if(l.has(s))continue;if(l.add(s),s.shadowRoot){let f=s.shadowRoot,h=f.elementsFromPoint?.(i,r)??[];o(h.length?h:[f.elementFromPoint?.(i,r)].filter(Boolean),i,r)}let d=rc(s);if(d){let f=Er(s),h=(i-f.x)/f.sx,_=(r-f.y)/f.sy;o(d.elementsFromPoint?.(h,_)??[d.elementFromPoint?.(h,_)].filter(Boolean),h,_)}s!==s.ownerDocument.body&&s!==s.ownerDocument.documentElement&&!wn(s,Q2)&&I4(s)&&n.push(s)}};return o(document.elementsFromPoint?.(e,t)??[document.elementFromPoint(e,t)].filter(Boolean),e,t),n}function pd(e,t,n){if(n.width<=0||n.height<=0)return null;let l=null,o=1/0;for(let a of G2(e,t)){let i=en(a),r=i.width/n.width,s=i.height/n.height;if(r<.5||r>2||s<.5||s>2)continue;let d=Math.abs(Math.log(r))+Math.abs(Math.log(s));d<o&&(l=a,o=d)}return l}function c2(e,t){let n=Nd(e,t);if(!n||wn(n,Q2))return null;let l=G2(e,t);for(let i of l)if(!j4.has(i.tagName)&&!i.shadowRoot||Array.from(i.childNodes).some(r=>r.nodeType===Node.TEXT_NODE&&r.textContent?.trim()))return i;let o=null,a=1/0;for(let i of l){let r=en(i),s=r.width*r.height;s>0&&s<a&&(o=i,a=s)}return o}function X4(e){let t=(0,Ld.useCallback)(n=>e?(window.addEventListener("hashchange",n),window.addEventListener("popstate",n),()=>{window.removeEventListener("hashchange",n),window.removeEventListener("popstate",n)}):()=>{},[e]);return(0,Ld.useSyncExternalStore)(t,()=>window.location.pathname+(e?window.location.hash:""),()=>"/")}var bd=new Map;function q4(e,t){let n=(bd.get(e)??Promise.resolve()).then(t),l=n.then(()=>{},()=>{});return bd.set(e,l),l.then(()=>{bd.get(e)===l&&bd.delete(e)}),n}function Q4(e,t,n){try{let l=new URL(e,n);return l.origin===n&&l.pathname+l.hash===t}catch{return!1}}var u2=typeof window>"u"?Tr.useEffect:Tr.useLayoutEffect;function G4(e){let[t,n]=(0,Tr.useState)(null);return u2(()=>{let l=document.createElement("div");return l.setAttribute("data-agentation-portal",""),l.style.display="contents",n(l),()=>l.remove()},[]),u2(()=>{if(!t)return;let l=e??document.body;if(l.ownerDocument!==document){console.warn("[Agentation] portalContainer belongs to another document; the toolbar will not render.");return}let o=document.activeElement;for(;o?.shadowRoot?.activeElement;)o=o.shadowRoot.activeElement;let a=o&&t.contains(document.activeElement)?o:null;typeof t.hidePopover=="function"&&t.matches(":popover-open")&&t.hidePopover(),l.appendChild(t),e&&typeof t.showPopover=="function"?(t.setAttribute("popover","manual"),t.style.cssText="position:fixed;inset:0 auto auto 0;margin:0;padding:0;border:0;background:transparent;width:0;height:0;overflow:visible;pointer-events:none",t.showPopover()):(t.removeAttribute("popover"),t.style.cssText="display:contents"),a?.focus({preventScroll:!0})},[t,e]),t}var V4=({mode:e="open",delegatesFocus:t,slotAssignment:n,host:l="div",children:o,className:a,...i})=>{let r=(0,Nr.useRef)(null),[s,d]=(0,Nr.useState)(null);return(0,Nr.useLayoutEffect)(()=>{let h=r.current;if(!h||h.shadowRoot)return;let _=h.attachShadow({mode:e,delegatesFocus:t,slotAssignment:n});d(_)},[]),(0,F2.jsx)(l,{ref:r,...i,...l.includes("-")?{class:a}:{className:a},children:s&&(0,W2.createPortal)(o,s)})};function Yh(e,t,n){let l=(0,lc.useRef)(n);(0,lc.useLayoutEffect)(()=>{l.current=n},[n]),(0,lc.useLayoutEffect)(()=>{let o=e.current;if(!t||!o)return;let a=!1,i=o.getAnimations?.()??[];return Promise.allSettled(i.map(r=>r.finished)).then(()=>{a||l.current()}),()=>{a=!0}},[e,t])}var Z2=`@charset "UTF-8";
.styles-module__popup___IhzrD svg[fill=none] {
  fill: none !important;
}
.styles-module__popup___IhzrD svg[fill=none] :not([fill]) {
  fill: none !important;
}

@keyframes styles-module__popupEnter___AuQDN {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
}
@keyframes styles-module__popupExit___JJKQX {
  from {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
}
@keyframes styles-module__shake___jdbWe {
  0%, 100% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(0);
  }
  20% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-3px);
  }
  40% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(3px);
  }
  60% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-2px);
  }
  80% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(2px);
  }
}
.styles-module__popup___IhzrD {
  position: fixed;
  transform: translateX(-50%);
  width: 280px;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  z-index: 100001;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  will-change: transform, opacity;
  opacity: 0;
}
.styles-module__popup___IhzrD.styles-module__enter___L7U7N {
  animation: styles-module__popupEnter___AuQDN 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.styles-module__popup___IhzrD.styles-module__entered___COX-w {
  opacity: 1;
  transform: translateX(-50%) scale(1) translateY(0);
}
.styles-module__popup___IhzrD.styles-module__exit___5eGjE {
  pointer-events: none;
  animation: styles-module__popupExit___JJKQX 0.15s ease-in forwards;
}
.styles-module__popup___IhzrD.styles-module__entered___COX-w.styles-module__shake___jdbWe {
  animation: styles-module__shake___jdbWe 0.25s ease-out;
}

.styles-module__header___wWsSi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5625rem;
}

.styles-module__element___fTV2z {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.styles-module__headerToggle___WpW0b {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  text-align: left;
}
.styles-module__headerToggle___WpW0b .styles-module__element___fTV2z {
  flex: 1;
}

.styles-module__chevron___ZZJlR {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}
.styles-module__chevron___ZZJlR.styles-module__expanded___2Hxgv {
  transform: rotate(90deg);
}

.styles-module__stylesWrapper___pnHgy {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.styles-module__stylesWrapper___pnHgy.styles-module__expanded___2Hxgv {
  grid-template-rows: 1fr;
}

.styles-module__stylesInner___YYZe2 {
  overflow: hidden;
}

.styles-module__stylesBlock___VfQKn {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.6875rem;
  line-height: 1.5;
}

.styles-module__styleLine___1YQiD {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
}

.styles-module__styleProperty___84L1i {
  color: #c792ea;
}

.styles-module__styleValue___q51-h {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__timestamp___Dtpsv {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.styles-module__quote___mcMmQ {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  line-height: 1.45;
}

.styles-module__textarea___jrSae {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem 0.625rem;
  font-size: 0.8125rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
}
.styles-module__textarea___jrSae:focus {
  border-color: var(--agentation-color-blue);
}
.styles-module__textarea___jrSae.styles-module__green___99l3h:focus {
  border-color: var(--agentation-color-green);
}
.styles-module__textarea___jrSae::placeholder {
  color: rgba(255, 255, 255, 0.35);
}
.styles-module__textarea___jrSae::-webkit-scrollbar {
  width: 6px;
}
.styles-module__textarea___jrSae::-webkit-scrollbar-track {
  background: transparent;
}
.styles-module__textarea___jrSae::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.styles-module__actions___D6x3f {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.styles-module__sourceAction___EabJb {
  display: block;
  max-width: 100%;
  margin: -2px 0 8px;
  padding: 2px 0;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 11px;
  border: 0;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}
.styles-module__sourceAction___EabJb:hover, .styles-module__sourceAction___EabJb:focus-visible {
  opacity: 1;
}
.styles-module__sourceAction___EabJb:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

.styles-module__light___6AaSQ .styles-module__sourceAction___EabJb {
  color: #111;
}

.styles-module__cancel___hRjnL,
.styles-module__submit___K-mIR,
.styles-module__deleteButton___4VuAE {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.875rem;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.styles-module__cancel___hRjnL {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__cancel___hRjnL:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.styles-module__submit___K-mIR {
  color: white;
}
.styles-module__submit___K-mIR:hover:not(:disabled) {
  filter: brightness(0.9);
}
.styles-module__submit___K-mIR:disabled {
  cursor: not-allowed;
}

.styles-module__deleteWrapper___oSjdo {
  display: flex;
  margin-right: auto;
}

.styles-module__deleteButton___4VuAE {
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.styles-module__deleteButton___4VuAE:hover {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}
.styles-module__deleteButton___4VuAE:active {
  transform: scale(0.92);
}

.styles-module__light___6AaSQ.styles-module__popup___IhzrD {
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.styles-module__light___6AaSQ .styles-module__element___fTV2z {
  color: rgba(0, 0, 0, 0.6);
}
.styles-module__light___6AaSQ .styles-module__timestamp___Dtpsv {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__chevron___ZZJlR {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__stylesBlock___VfQKn {
  background: rgba(0, 0, 0, 0.03);
}
.styles-module__light___6AaSQ .styles-module__styleLine___1YQiD {
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__styleProperty___84L1i {
  color: #7c3aed;
}
.styles-module__light___6AaSQ .styles-module__styleValue___q51-h {
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__quote___mcMmQ {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.04);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae {
  background: rgba(0, 0, 0, 0.03);
  color: #1a1a1a;
  border-color: rgba(0, 0, 0, 0.12);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae::placeholder {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
}
.styles-module__light___6AaSQ .styles-module__cancel___hRjnL {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___6AaSQ .styles-module__cancel___hRjnL:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__deleteButton___4VuAE {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__deleteButton___4VuAE:hover {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}

@media (prefers-reduced-motion: reduce) {
  .styles-module__popup___IhzrD.styles-module__enter___L7U7N, .styles-module__popup___IhzrD.styles-module__exit___5eGjE {
    animation-duration: 1ms;
    animation-delay: 0ms !important;
  }
}
.styles-module__sharedForm___8GvQl {
  --card-motion: 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
  padding: 0.75rem 1rem;
  transition: padding var(--card-motion);
}
.styles-module__sharedForm___8GvQl .styles-module__header___wWsSi {
  transition: margin-bottom var(--card-motion);
}
.styles-module__sharedForm___8GvQl .styles-module__element___fTV2z {
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
}
.styles-module__sharedForm___8GvQl .styles-module__previewExcerpt___DCOIL {
  display: none;
}
.styles-module__sharedForm___8GvQl .styles-module__headerToggle___WpW0b .styles-module__chevron___ZZJlR {
  opacity: 1;
  margin-left: 0;
  transition: margin-left var(--card-motion), opacity 100ms ease-out, transform var(--card-motion);
}
.styles-module__sharedForm___8GvQl .styles-module__sharedNote___OYVi5 {
  position: relative;
  height: var(--editor-field-height, 57px);
  border-radius: 8px;
  overflow: clip;
  transition: height var(--card-motion);
}
.styles-module__sharedForm___8GvQl .styles-module__sharedNote___OYVi5::before {
  content: "";
  position: absolute;
  inset: 0;
  border: 1px solid var(--field-border, rgba(255, 255, 255, 0.15));
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
  transition: opacity var(--card-motion), border-color var(--card-motion);
}
.styles-module__sharedForm___8GvQl .styles-module__sharedNoteContent___6q3KD {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: clip;
  transition: width var(--card-motion);
}
.styles-module__sharedForm___8GvQl .styles-module__sharedNote___OYVi5[data-truncated]::after {
  content: "\u2026";
  position: absolute;
  right: 0;
  top: 0;
  color: #fff;
  font-size: 13px;
  line-height: 1.4;
  opacity: 0;
  pointer-events: none;
  transition: opacity 80ms ease-out;
}
.styles-module__sharedForm___8GvQl .styles-module__textarea___jrSae {
  display: block;
  width: calc(280px - 2rem);
  max-width: calc(100vw - 24px - 2rem);
  margin: 0;
  background: transparent !important;
  border-color: transparent !important;
  transform: translate(0, 0);
  transition: transform var(--card-motion), color var(--card-motion);
}
.styles-module__sharedForm___8GvQl .styles-module__sharedExtra___RUBKC, .styles-module__sharedForm___8GvQl .styles-module__sharedActions___6Glpl {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition: grid-template-rows var(--card-motion), opacity 80ms ease-out;
}
.styles-module__sharedForm___8GvQl .styles-module__sharedActions___6Glpl {
  transition-delay: 0ms, 120ms;
}
.styles-module__sharedForm___8GvQl .styles-module__sharedExtraInner___EuUh4 {
  min-height: 0;
  overflow: hidden;
}
.styles-module__sharedForm___8GvQl .styles-module__actions___D6x3f {
  min-height: 0;
  overflow: hidden;
  transition: margin-top var(--card-motion);
}
.styles-module__sharedForm___8GvQl[data-preview] {
  padding: 8px 12px;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__header___wWsSi {
  margin-bottom: 5px;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__previewExcerpt___DCOIL {
  display: inline;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__element___fTV2z {
  line-height: 1.4;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__chevron___ZZJlR {
  opacity: 0;
  margin-left: -18px;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__sharedNote___OYVi5 {
  height: 20.2px;
  border-radius: 0;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__sharedNote___OYVi5::before {
  opacity: 0;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__textarea___jrSae {
  transform: translate(-11px, calc(-9px + (1.4em - 1lh) / 2));
  color: #fff;
  overflow: hidden;
  cursor: default;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__sharedExtra___RUBKC, .styles-module__sharedForm___8GvQl[data-preview] .styles-module__sharedActions___6Glpl {
  grid-template-rows: 0fr;
  opacity: 0;
  transition-delay: 0ms;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__actions___D6x3f {
  margin-top: 0;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__stylesWrapper___pnHgy {
  grid-template-rows: 0fr;
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__sharedNote___OYVi5[data-truncated] .styles-module__sharedNoteContent___6q3KD {
  width: calc(100% - 12px);
}
.styles-module__sharedForm___8GvQl[data-preview] .styles-module__sharedNote___OYVi5[data-truncated]::after {
  opacity: 1;
}

.styles-module__light___6AaSQ .styles-module__sharedForm___8GvQl .styles-module__sharedNote___OYVi5::before {
  border-color: var(--field-border, rgba(0, 0, 0, 0.12));
  background: rgba(0, 0, 0, 0.03);
}

.styles-module__light___6AaSQ .styles-module__sharedForm___8GvQl .styles-module__element___fTV2z {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__light___6AaSQ .styles-module__sharedForm___8GvQl[data-preview] .styles-module__textarea___jrSae, .styles-module__light___6AaSQ .styles-module__sharedForm___8GvQl[data-preview] .styles-module__sharedNote___OYVi5::after {
  color: rgba(0, 0, 0, 0.85);
}

@media (prefers-reduced-motion: reduce) {
  .styles-module__sharedForm___8GvQl {
    --card-motion: 1ms linear;
  }
  .styles-module__sharedForm___8GvQl .styles-module__sharedActions___6Glpl, .styles-module__sharedForm___8GvQl .styles-module__headerToggle___WpW0b .styles-module__chevron___ZZJlR {
    transition: opacity 100ms ease-out;
    transition-delay: 0ms;
  }
}`,He={popup:"styles-module__popup___IhzrD",enter:"styles-module__enter___L7U7N",popupEnter:"styles-module__popupEnter___AuQDN",entered:"styles-module__entered___COX-w",exit:"styles-module__exit___5eGjE",popupExit:"styles-module__popupExit___JJKQX",shake:"styles-module__shake___jdbWe",header:"styles-module__header___wWsSi",element:"styles-module__element___fTV2z",headerToggle:"styles-module__headerToggle___WpW0b",chevron:"styles-module__chevron___ZZJlR",expanded:"styles-module__expanded___2Hxgv",stylesWrapper:"styles-module__stylesWrapper___pnHgy",stylesInner:"styles-module__stylesInner___YYZe2",stylesBlock:"styles-module__stylesBlock___VfQKn",styleLine:"styles-module__styleLine___1YQiD",styleProperty:"styles-module__styleProperty___84L1i",styleValue:"styles-module__styleValue___q51-h",timestamp:"styles-module__timestamp___Dtpsv",quote:"styles-module__quote___mcMmQ",textarea:"styles-module__textarea___jrSae",green:"styles-module__green___99l3h",actions:"styles-module__actions___D6x3f",sourceAction:"styles-module__sourceAction___EabJb",light:"styles-module__light___6AaSQ",cancel:"styles-module__cancel___hRjnL",submit:"styles-module__submit___K-mIR",deleteButton:"styles-module__deleteButton___4VuAE",deleteWrapper:"styles-module__deleteWrapper___oSjdo",sharedForm:"styles-module__sharedForm___8GvQl",previewExcerpt:"styles-module__previewExcerpt___DCOIL",sharedNote:"styles-module__sharedNote___OYVi5",sharedNoteContent:"styles-module__sharedNoteContent___6q3KD",sharedExtra:"styles-module__sharedExtra___RUBKC",sharedActions:"styles-module__sharedActions___6Glpl",sharedExtraInner:"styles-module__sharedExtraInner___EuUh4"},yh="data-agentation-styles";function J2(e,t,n){if(!n||!e)return;let l=e.nodeType===9?e.head:e.nodeType===11?e:null;if(!l||typeof l.querySelector!="function"||l.querySelector(`style[${yh}~="toolbar"], style[${yh}~="${t}"]`))return;let a=(e.nodeType===9?e:e.ownerDocument).createElement("style");a.setAttribute(yh,t),a.textContent=n,l.appendChild(a)}function jh(e,t){return(0,K2.useCallback)(n=>{n&&J2(n.getRootNode(),e,t)},[e,t])}function d2(e){if(!e)return;let t=n=>n.stopImmediatePropagation();document.addEventListener("focusin",t,!0),document.addEventListener("focusout",t,!0);try{e.focus({preventScroll:!0})}finally{document.removeEventListener("focusin",t,!0),document.removeEventListener("focusout",t,!0)}}var P2=(0,Rn.forwardRef)(function({element:t,timestamp:n,selectedText:l,placeholder:o="What should change?",initialValue:a="",submitLabel:i="Add",onSubmit:r,onCancel:s,onDelete:d,onOpenSource:f,allowEmpty:h=!1,accentColor:_="#3c82f7",computedStyles:b,disabled:w=!1,preview:N=!1,resetOnPreview:M=!0,variant:y="popup"},x){let g=y==="card",[k,I]=(0,Rn.useState)(a),[J,L]=(0,Rn.useState)(!1),[F,Y]=(0,Rn.useState)(!1),Z=(0,Rn.useRef)(null),re=(0,Rn.useRef)(null),K=l?` "${l.slice(0,30)}${l.length>30?"...":""}"`:"";(0,Rn.useLayoutEffect)(()=>{let se=re.current,he=Z.current;if(!g||!se||!he)return;let Ht=()=>{se.style.setProperty("--editor-field-height",`${he.offsetHeight}px`)};if(Ht(),"CanvasRenderingContext2D"in window){let tt=document.createElement("canvas").getContext("2d");if(tt){let je=getComputedStyle(he).fontFamily;tt.font=`13px ${je}`;let St=tt.measureText(a.replace(/\s+/g," ")).width;tt.font=`italic 12px ${je}`;let _n=tt.measureText(t+K).width,$n=Math.min(200,Math.max(120,Math.ceil(Math.max(St,_n))+24));se.closest("[data-annotation-card]")?.style.setProperty("--preview-width",`${$n}px`);let De=se.querySelector("[data-shared-note]");De&&De.toggleAttribute("data-truncated",St>$n-24)}}let Ye=typeof ResizeObserver<"u"?new ResizeObserver(Ht):null;return Ye?.observe(he),()=>Ye?.disconnect()},[g,t,a,K]),(0,Rn.useLayoutEffect)(()=>{N&&M&&(I(a),Y(!1),Z.current&&(Z.current.scrollTop=0,Z.current.scrollLeft=0))},[N,M,a]),(0,Rn.useImperativeHandle)(x,()=>({focus(){let se=Z.current;d2(se),se&&(se.selectionStart=se.selectionEnd=se.value.length,se.scrollTop=g?0:se.scrollHeight)}}),[g]);let _e=(0,Rn.useCallback)(()=>{w||!k.trim()&&!h||r(k.trim())},[w,k,h,r]),oe=se=>{se.stopPropagation(),!se.nativeEvent.isComposing&&(se.key==="Enter"&&!se.shiftKey&&(se.preventDefault(),_e()),se.key==="Escape"&&s())};return(0,et.jsxs)("div",{ref:re,className:g?He.sharedForm:void 0,style:g?void 0:{display:"contents"},"data-annotation-editor":!0,"data-preview":N||void 0,children:[(0,et.jsxs)("div",{className:He.header,"data-editor-heading":!0,children:[b&&Object.keys(b).length>0?(0,et.jsxs)("button",{className:He.headerToggle,onClick:()=>{let se=F;Y(!F),se&&st(()=>d2(Z.current),0)},type:"button",children:[(0,et.jsx)("svg",{className:`${He.chevron} ${F?He.expanded:""}`,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,et.jsx)("path",{d:"M5.5 10.25L9 7.25L5.75 4",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),(0,et.jsxs)("span",{className:He.element,children:[t,g&&K&&(0,et.jsx)("span",{className:He.previewExcerpt,children:K})]})]}):(0,et.jsxs)("span",{className:He.element,children:[t,g&&K&&(0,et.jsx)("span",{className:He.previewExcerpt,children:K})]}),n&&(0,et.jsx)("span",{className:He.timestamp,children:n})]}),f&&(0,et.jsx)("div",{className:g?He.sharedExtra:void 0,style:g?void 0:{display:"contents"},children:(0,et.jsx)("div",{className:g?He.sharedExtraInner:void 0,style:g?void 0:{display:"contents"},children:(0,et.jsx)("button",{type:"button",className:He.sourceAction,onClick:f,children:"Open in editor"})})}),b&&Object.keys(b).length>0&&(0,et.jsx)("div",{className:`${He.stylesWrapper} ${F?He.expanded:""}`,children:(0,et.jsx)("div",{className:He.stylesInner,children:(0,et.jsx)("div",{className:He.stylesBlock,children:Object.entries(b).map(([se,he])=>(0,et.jsxs)("div",{className:He.styleLine,children:[(0,et.jsx)("span",{className:He.styleProperty,children:se.replace(/([A-Z])/g,"-$1").toLowerCase()}),": ",(0,et.jsx)("span",{className:He.styleValue,children:he}),";"]},se))})})}),l&&(0,et.jsx)("div",{className:g?He.sharedExtra:void 0,style:g?void 0:{display:"contents"},children:(0,et.jsx)("div",{className:g?He.sharedExtraInner:void 0,style:g?void 0:{display:"contents"},children:(0,et.jsxs)("div",{className:He.quote,children:["\u201C",l.slice(0,80),l.length>80?"...":"","\u201D"]})})}),(0,et.jsx)("div",{"data-shared-note":!0,className:g?He.sharedNote:void 0,style:g?{"--field-border":J?_:void 0}:{display:"contents"},children:(0,et.jsx)("div",{className:g?He.sharedNoteContent:void 0,style:g?void 0:{display:"contents"},children:(0,et.jsx)("textarea",{ref:Z,className:He.textarea,readOnly:N,"aria-hidden":N,style:g?void 0:{borderColor:J?_:void 0},placeholder:o,value:N?k.replace(/\s+/g," "):k,onChange:se=>I(se.target.value),onFocus:()=>L(!0),onBlur:()=>L(!1),rows:2,onKeyDown:oe})})}),(0,et.jsx)("div",{"data-editor-actions":!0,className:g?He.sharedActions:void 0,style:g?void 0:{display:"contents"},children:(0,et.jsxs)("div",{className:He.actions,children:[d&&(0,et.jsx)("div",{className:He.deleteWrapper,children:(0,et.jsx)("button",{className:He.deleteButton,onClick:d,type:"button","aria-label":"Delete annotation",children:"Delete"})}),(0,et.jsx)("button",{className:He.cancel,onClick:s,children:"Cancel"}),(0,et.jsx)("button",{className:He.submit,style:{backgroundColor:_,opacity:k.trim()||h?1:.4},onClick:_e,disabled:w||!k.trim()&&!h,children:i})]})})]})}),Ih=(0,un.forwardRef)(function({element:t,timestamp:n,selectedText:l,placeholder:o="What should change?",initialValue:a="",submitLabel:i="Add",onSubmit:r,onCancel:s,onDelete:d,onOpenSource:f,allowEmpty:h=!1,style:_,accentColor:b="#3c82f7",isExiting:w=!1,onExitComplete:N,lightMode:M=!1,computedStyles:y},x){let[g,k]=(0,un.useState)(!1),[I,J]=(0,un.useState)("initial"),L=(0,un.useRef)(null),F=(0,un.useRef)(null);(0,un.useEffect)(()=>{J2(F.current?.getRootNode(),"annotation-popup",Z2)},[]);let Y=(0,un.useRef)(null);(0,un.useEffect)(()=>{let oe=st(()=>{J(se=>se==="initial"?"enter":se)},0);return()=>{clearTimeout(oe),Y.current&&clearTimeout(Y.current)}},[]),(0,un.useEffect)(()=>{if(w)return;let oe=st(()=>L.current?.focus(),50);return()=>clearTimeout(oe)},[w]);let Z=(0,un.useCallback)(()=>{Y.current&&clearTimeout(Y.current),k(!0),Y.current=st(()=>{k(!1),L.current?.focus()},250)},[]);(0,un.useImperativeHandle)(x,()=>({shake:Z}),[Z]);let re=(0,un.useCallback)(()=>{if(N){s();return}J("exit")},[s,N]),K=w?"exit":I;Yh(F,K==="exit",()=>{w?N?.():s()});let _e=[He.popup,M?He.light:"",K==="enter"?He.enter:"",K==="entered"?He.entered:"",K==="exit"?He.exit:"",g&&K!=="exit"?He.shake:""].filter(Boolean).join(" ");return(0,Nh.jsx)("div",{ref:F,className:_e,"data-annotation-popup":!0,style:_,onAnimationEnd:oe=>{oe.target===oe.currentTarget&&oe.animationName.includes("popupEnter")&&!w&&J("entered")},onKeyDownCapture:oe=>{oe.key!=="Escape"||oe.nativeEvent.isComposing||(oe.preventDefault(),oe.stopPropagation(),re())},onClick:oe=>oe.stopPropagation(),children:(0,Nh.jsx)(P2,{ref:L,element:t,timestamp:n,selectedText:l,placeholder:o,initialValue:a,submitLabel:i,onSubmit:r,onCancel:re,onDelete:d,onOpenSource:f,allowEmpty:h,accentColor:b,computedStyles:y,disabled:K==="exit"})})}),Bd=`.icon-transitions-module__iconState___uqK9J {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: center;
}

.icon-transitions-module__iconStateFast___HxlMm {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: center;
}

.icon-transitions-module__iconFade___nPwXg {
  transition: opacity 0.2s ease;
}

.icon-transitions-module__iconFadeFast___Ofb2t {
  transition: opacity 0.15s ease;
}

.icon-transitions-module__visible___PlHsU {
  opacity: 1 !important;
}

.icon-transitions-module__visibleScaled___8Qog- {
  opacity: 1 !important;
  transform: scale(1);
}

.icon-transitions-module__hidden___ETykt {
  opacity: 0 !important;
}

.icon-transitions-module__hiddenScaled___JXn-m {
  opacity: 0 !important;
  transform: scale(0.8);
}

.icon-transitions-module__sending___uaLN- {
  opacity: 0.5 !important;
  transform: scale(0.8);
}`,Mt={iconState:"icon-transitions-module__iconState___uqK9J",iconStateFast:"icon-transitions-module__iconStateFast___HxlMm",iconFade:"icon-transitions-module__iconFade___nPwXg",iconFadeFast:"icon-transitions-module__iconFadeFast___Ofb2t",visible:"icon-transitions-module__visible___PlHsU",visibleScaled:"icon-transitions-module__visibleScaled___8Qog-",hidden:"icon-transitions-module__hidden___ETykt",hiddenScaled:"icon-transitions-module__hiddenScaled___JXn-m",sending:"icon-transitions-module__sending___uaLN-"};var W4=({size:e=16})=>(0,te.jsx)("svg",{width:e,height:e,viewBox:"0 0 16 16",fill:"none",children:(0,te.jsx)("path",{d:"M8 3v10M3 8h10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})});var F4=({size:e=20,...t})=>(0,te.jsxs)("svg",{width:e,height:e,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...t,children:[(0,te.jsx)("circle",{cx:"10",cy:"10",r:"5.375",stroke:"currentColor",strokeWidth:"1.25"}),(0,te.jsx)("path",{d:"M8.5 8.5C8.73 7.85 9.31 7.49 10 7.5C10.86 7.51 11.5 8.13 11.5 9C11.5 10.08 10 10.5 10 10.5V10.75",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("circle",{cx:"10",cy:"12.625",r:"0.625",fill:"currentColor"})]});var Z4=({size:e=24,copied:t=!1,tint:n})=>(0,te.jsxs)("svg",{ref:jh("icon-transitions",Bd),width:e,height:e,viewBox:"0 0 24 24",fill:"none",style:n?{color:n,transition:"color 0.3s ease"}:void 0,children:[(0,te.jsxs)("g",{className:`${Mt.iconState} ${t?Mt.hiddenScaled:Mt.visibleScaled}`,children:[(0,te.jsx)("path",{d:"M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z",stroke:"currentColor",strokeWidth:"1.5"}),(0,te.jsx)("path",{d:"M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),(0,te.jsxs)("g",{className:`${Mt.iconState} ${t?Mt.visibleScaled:Mt.hiddenScaled}`,children:[(0,te.jsx)("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M15 10L11 14.25L9.25 12.25",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})]}),K4=({size:e=24,state:t="idle"})=>{let n=t==="idle",l=t==="sent",o=t==="failed",a=t==="sending";return(0,te.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,te.jsx)("g",{className:`${Mt.iconStateFast} ${n?Mt.visibleScaled:a?Mt.sending:Mt.hiddenScaled}`,children:(0,te.jsx)("path",{d:"M9.875 14.125L12.3506 19.6951C12.7184 20.5227 13.9091 20.4741 14.2083 19.6193L18.8139 6.46032C19.0907 5.6695 18.3305 4.90933 17.5397 5.18611L4.38072 9.79174C3.52589 10.0909 3.47731 11.2816 4.30494 11.6494L9.875 14.125ZM9.875 14.125L13.375 10.625",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),(0,te.jsxs)("g",{className:`${Mt.iconStateFast} ${l?Mt.visibleScaled:Mt.hiddenScaled}`,children:[(0,te.jsx)("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M15 10L11 14.25L9.25 12.25",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,te.jsxs)("g",{className:`${Mt.iconStateFast} ${o?Mt.visibleScaled:Mt.hiddenScaled}`,children:[(0,te.jsx)("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-red)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M12 8V12",stroke:"var(--agentation-color-red)",strokeWidth:"1.5",strokeLinecap:"round"}),(0,te.jsx)("circle",{cx:"12",cy:"15",r:"0.5",fill:"var(--agentation-color-red)",stroke:"var(--agentation-color-red)",strokeWidth:"1"})]})]})};var J4=({size:e=24,isOpen:t=!0})=>(0,te.jsxs)("svg",{ref:jh("icon-transitions",Bd),width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,te.jsxs)("g",{className:`${Mt.iconFade} ${t?Mt.visible:Mt.hidden}`,children:[(0,te.jsx)("path",{d:"M3.91752 12.7539C3.65127 12.2996 3.65037 11.7515 3.9149 11.2962C4.9042 9.59346 7.72688 5.49994 12 5.49994C16.2731 5.49994 19.0958 9.59346 20.0851 11.2962C20.3496 11.7515 20.3487 12.2996 20.0825 12.7539C19.0908 14.4459 16.2694 18.4999 12 18.4999C7.73064 18.4999 4.90918 14.4459 3.91752 12.7539Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M12 14.8261C13.5608 14.8261 14.8261 13.5608 14.8261 12C14.8261 10.4392 13.5608 9.17392 12 9.17392C10.4392 9.17392 9.17391 10.4392 9.17391 12C9.17391 13.5608 10.4392 14.8261 12 14.8261Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,te.jsxs)("g",{className:`${Mt.iconFade} ${t?Mt.hidden:Mt.visible}`,children:[(0,te.jsx)("path",{d:"M18.6025 9.28503C18.9174 8.9701 19.4364 8.99481 19.7015 9.35271C20.1484 9.95606 20.4943 10.507 20.7342 10.9199C21.134 11.6086 21.1329 12.4454 20.7303 13.1328C20.2144 14.013 19.2151 15.5225 17.7723 16.8193C16.3293 18.1162 14.3852 19.2497 12.0008 19.25C11.4192 19.25 10.8638 19.1823 10.3355 19.0613C9.77966 18.934 9.63498 18.2525 10.0382 17.8493C10.2412 17.6463 10.5374 17.573 10.8188 17.6302C11.1993 17.7076 11.5935 17.75 12.0008 17.75C13.8848 17.7497 15.4867 16.8568 16.7693 15.7041C18.0522 14.5511 18.9606 13.1867 19.4363 12.375C19.5656 12.1543 19.5659 11.8943 19.4373 11.6729C19.2235 11.3049 18.921 10.8242 18.5364 10.3003C18.3085 9.98991 18.3302 9.5573 18.6025 9.28503ZM12.0008 4.75C12.5814 4.75006 13.1358 4.81803 13.6632 4.93953C14.2182 5.06741 14.362 5.74812 13.9593 6.15091C13.7558 6.35435 13.4589 6.42748 13.1771 6.36984C12.7983 6.29239 12.4061 6.25006 12.0008 6.25C10.1167 6.25 8.51415 7.15145 7.23028 8.31543C5.94678 9.47919 5.03918 10.8555 4.56426 11.6729C4.43551 11.8945 4.43582 12.1542 4.56524 12.375C4.77587 12.7343 5.07189 13.2012 5.44718 13.7105C5.67623 14.0213 5.65493 14.4552 5.38193 14.7282C5.0671 15.0431 4.54833 15.0189 4.28292 14.6614C3.84652 14.0736 3.50813 13.5369 3.27129 13.1328C2.86831 12.4451 2.86717 11.6088 3.26739 10.9199C3.78185 10.0345 4.77959 8.51239 6.22247 7.2041C7.66547 5.89584 9.61202 4.75 12.0008 4.75Z",fill:"currentColor"}),(0,te.jsx)("path",{d:"M5 19L19 5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})]}),P4=({size:e=24,isPaused:t=!1})=>(0,te.jsxs)("svg",{ref:jh("icon-transitions",Bd),width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,te.jsxs)("g",{className:`${Mt.iconFadeFast} ${t?Mt.hidden:Mt.visible}`,children:[(0,te.jsx)("path",{d:"M8 6L8 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),(0,te.jsx)("path",{d:"M16 18L16 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),(0,te.jsx)("path",{className:`${Mt.iconFadeFast} ${t?Mt.visible:Mt.hidden}`,d:"M17.75 10.701C18.75 11.2783 18.75 12.7217 17.75 13.299L8.75 18.4952C7.75 19.0725 6.5 18.3509 6.5 17.1962L6.5 6.80384C6.5 5.64914 7.75 4.92746 8.75 5.50481L17.75 10.701Z",stroke:"currentColor",strokeWidth:"1.5"})]});var e3=({size:e=16})=>(0,te.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,te.jsx)("path",{d:"M10.6504 5.81117C10.9939 4.39628 13.0061 4.39628 13.3496 5.81117C13.5715 6.72517 14.6187 7.15891 15.4219 6.66952C16.6652 5.91193 18.0881 7.33479 17.3305 8.57815C16.8411 9.38134 17.2748 10.4285 18.1888 10.6504C19.6037 10.9939 19.6037 13.0061 18.1888 13.3496C17.2748 13.5715 16.8411 14.6187 17.3305 15.4219C18.0881 16.6652 16.6652 18.0881 15.4219 17.3305C14.6187 16.8411 13.5715 17.2748 13.3496 18.1888C13.0061 19.6037 10.9939 19.6037 10.6504 18.1888C10.4285 17.2748 9.38135 16.8411 8.57815 17.3305C7.33479 18.0881 5.91193 16.6652 6.66952 15.4219C7.15891 14.6187 6.72517 13.5715 5.81117 13.3496C4.39628 13.0061 4.39628 10.9939 5.81117 10.6504C6.72517 10.4285 7.15891 9.38134 6.66952 8.57815C5.91193 7.33479 7.33479 5.91192 8.57815 6.66952C9.38135 7.15891 10.4285 6.72517 10.6504 5.81117Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("circle",{cx:"12",cy:"12",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"})]});var t3=({size:e=16})=>(0,te.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:(0,te.jsx)("path",{d:"M13.5 4C14.7426 4 15.75 5.00736 15.75 6.25V7H18.5C18.9142 7 19.25 7.33579 19.25 7.75C19.25 8.16421 18.9142 8.5 18.5 8.5H17.9678L17.6328 16.2217C17.61 16.7475 17.5912 17.1861 17.5469 17.543C17.5015 17.9087 17.4225 18.2506 17.2461 18.5723C16.9747 19.0671 16.5579 19.4671 16.0518 19.7168C15.7227 19.8791 15.3772 19.9422 15.0098 19.9717C14.6514 20.0004 14.2126 20 13.6865 20H10.3135C9.78735 20 9.34856 20.0004 8.99023 19.9717C8.62278 19.9422 8.27729 19.8791 7.94824 19.7168C7.44205 19.4671 7.02532 19.0671 6.75391 18.5723C6.57751 18.2506 6.49853 17.9087 6.45312 17.543C6.40883 17.1861 6.39005 16.7475 6.36719 16.2217L6.03223 8.5H5.5C5.08579 8.5 4.75 8.16421 4.75 7.75C4.75 7.33579 5.08579 7 5.5 7H8.25V6.25C8.25 5.00736 9.25736 4 10.5 4H13.5ZM7.86621 16.1562C7.89013 16.7063 7.90624 17.0751 7.94141 17.3584C7.97545 17.6326 8.02151 17.7644 8.06934 17.8516C8.19271 18.0763 8.38239 18.2577 8.6123 18.3711C8.70153 18.4151 8.83504 18.4545 9.11035 18.4766C9.39482 18.4994 9.76335 18.5 10.3135 18.5H13.6865C14.2367 18.5 14.6052 18.4994 14.8896 18.4766C15.165 18.4545 15.2985 18.4151 15.3877 18.3711C15.6176 18.2577 15.8073 18.0763 15.9307 17.8516C15.9785 17.7644 16.0245 17.6326 16.0586 17.3584C16.0938 17.0751 16.1099 16.7063 16.1338 16.1562L16.4668 8.5H7.5332L7.86621 16.1562ZM9.97656 10.75C10.3906 10.7371 10.7371 11.0626 10.75 11.4766L10.875 15.4766C10.8879 15.8906 10.5624 16.2371 10.1484 16.25C9.73443 16.2629 9.38794 15.9374 9.375 15.5234L9.25 11.5234C9.23706 11.1094 9.56255 10.7629 9.97656 10.75ZM14.0244 10.75C14.4384 10.7635 14.7635 11.1105 14.75 11.5244L14.6201 15.5244C14.6066 15.9384 14.2596 16.2634 13.8457 16.25C13.4317 16.2365 13.1067 15.8896 13.1201 15.4756L13.251 11.4756C13.2645 11.0617 13.6105 10.7366 14.0244 10.75ZM10.5 5.5C10.0858 5.5 9.75 5.83579 9.75 6.25V7H14.25V6.25C14.25 5.83579 13.9142 5.5 13.5 5.5H10.5Z",fill:"currentColor"})});var n3=({size:e=16})=>(0,te.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,te.jsxs)("g",{clipPath:"url(#clip0_2_53)",children:[(0,te.jsx)("path",{d:"M16.25 16.25L7.75 7.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M7.75 16.25L16.25 7.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,te.jsx)("defs",{children:(0,te.jsx)("clipPath",{id:"clip0_2_53",children:(0,te.jsx)("rect",{width:"24",height:"24",fill:"white"})})})]});var l3=({size:e=16})=>(0,te.jsxs)("svg",{width:e,height:e,viewBox:"0 0 20 20",fill:"none",children:[(0,te.jsx)("path",{d:"M9.99999 12.7082C11.4958 12.7082 12.7083 11.4956 12.7083 9.99984C12.7083 8.50407 11.4958 7.2915 9.99999 7.2915C8.50422 7.2915 7.29166 8.50407 7.29166 9.99984C7.29166 11.4956 8.50422 12.7082 9.99999 12.7082Z",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M10 3.9585V5.05698",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M10 14.9429V16.0414",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M5.7269 5.72656L6.50682 6.50649",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M13.4932 13.4932L14.2731 14.2731",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M3.95834 10H5.05683",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M14.9432 10H16.0417",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M5.7269 14.2731L6.50682 13.4932",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,te.jsx)("path",{d:"M13.4932 6.50649L14.2731 5.72656",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"})]}),o3=({size:e=16})=>(0,te.jsx)("svg",{width:e,height:e,viewBox:"0 0 20 20",fill:"none",children:(0,te.jsx)("path",{d:"M15.5 10.4955C15.4037 11.5379 15.0124 12.5314 14.3721 13.3596C13.7317 14.1878 12.8688 14.8165 11.8841 15.1722C10.8995 15.5278 9.83397 15.5957 8.81217 15.3679C7.79038 15.1401 6.8546 14.6259 6.11434 13.8857C5.37408 13.1454 4.85995 12.2096 4.63211 11.1878C4.40427 10.166 4.47215 9.10048 4.82781 8.11585C5.18346 7.13123 5.81218 6.26825 6.64039 5.62791C7.4686 4.98756 8.46206 4.59634 9.5045 4.5C8.89418 5.32569 8.60049 6.34302 8.67685 7.36695C8.75321 8.39087 9.19454 9.35339 9.92058 10.0794C10.6466 10.8055 11.6091 11.2468 12.6331 11.3231C13.657 11.3995 14.6743 11.1058 15.5 10.4955Z",stroke:"currentColor",strokeWidth:"1.13793",strokeLinecap:"round",strokeLinejoin:"round"})}),a3=({size:e=16})=>(0,te.jsx)("svg",{width:e,height:e,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,te.jsx)("path",{d:"M11.3799 6.9572L9.05645 4.63375M11.3799 6.9572L6.74949 11.5699C6.61925 11.6996 6.45577 11.791 6.277 11.8339L4.29549 12.3092C3.93194 12.3964 3.60478 12.0683 3.69297 11.705L4.16585 9.75693C4.20893 9.57947 4.29978 9.4172 4.42854 9.28771L9.05645 4.63375M11.3799 6.9572L12.3455 5.98759C12.9839 5.34655 12.9839 4.31002 12.3455 3.66897C11.7033 3.02415 10.6594 3.02415 10.0172 3.66897L9.06126 4.62892L9.05645 4.63375",stroke:"currentColor",strokeWidth:"0.9",strokeLinecap:"round",strokeLinejoin:"round"})});var i3=({size:e=16})=>(0,te.jsx)("svg",{width:e,height:e,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,te.jsx)("path",{d:"M8.5 3.5L4 8L8.5 12.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})});var r3=({size:e=24})=>(0,te.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,te.jsx)("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),(0,te.jsx)("line",{x1:"3",y1:"9",x2:"21",y2:"9",stroke:"currentColor",strokeWidth:"1.5"}),(0,te.jsx)("line",{x1:"9",y1:"9",x2:"9",y2:"21",stroke:"currentColor",strokeWidth:"1.5"})]}),s3=({content:e,children:t,...n})=>{let[l,o]=(0,uo.useState)(!1),[a,i]=(0,uo.useState)(!1),[r,s]=(0,uo.useState)({top:0,right:0}),d=(0,uo.useRef)(null),f=(0,uo.useRef)(null),h=(0,uo.useRef)(null),_=()=>{if(d.current){let N=d.current.getBoundingClientRect();s({top:N.top+N.height/2,right:window.innerWidth-N.left+8})}},b=()=>{i(!0),h.current&&(clearTimeout(h.current),h.current=null),_(),f.current=st(()=>{o(!0)},500)},w=()=>{f.current&&(clearTimeout(f.current),f.current=null),o(!1),h.current=st(()=>{i(!1)},150)};return(0,uo.useEffect)(()=>()=>{f.current&&clearTimeout(f.current),h.current&&clearTimeout(h.current)},[]),(0,di.jsxs)(di.Fragment,{children:[(0,di.jsx)("span",{ref:d,onMouseEnter:b,onMouseLeave:w,...n,children:t}),a&&(0,eb.createPortal)((0,di.jsx)("div",{"data-feedback-toolbar":!0,style:{position:"fixed",top:r.top,right:r.right,transform:"translateY(-50%)",padding:"6px 10px",background:"#383838",color:"rgba(255, 255, 255, 0.7)",fontSize:"11px",fontWeight:400,lineHeight:"14px",borderRadius:"10px",width:"180px",textAlign:"left",zIndex:100020,pointerEvents:"none",boxShadow:"0px 1px 8px rgba(0, 0, 0, 0.28)",opacity:l?1:0,transition:"opacity 0.15s ease"},children:e}),document.body)]})},c3=`.styles-module__tooltip___mcXL2 {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: help;
}

.styles-module__tooltipIcon___Nq2nD {
  transform: translateY(0.5px);
  color: #fff;
  opacity: 0.2;
  transition: opacity 0.15s ease;
  will-change: transform;
}
.styles-module__tooltip___mcXL2:hover .styles-module__tooltipIcon___Nq2nD {
  opacity: 0.5;
}
[data-agentation-theme=light] .styles-module__tooltipIcon___Nq2nD {
  color: #000;
}`,_2={tooltip:"styles-module__tooltip___mcXL2",tooltipIcon:"styles-module__tooltipIcon___Nq2nD"},ci=({content:e})=>(0,Rh.jsx)(s3,{className:_2.tooltip,content:e,children:(0,Rh.jsx)(F4,{className:_2.tooltipIcon})}),u3=`.styles-module__toolbar___wNsdK svg[fill=none],
.styles-module__markersLayer___-25j1 svg[fill=none],
.styles-module__fixedMarkersLayer___ffyX6 svg[fill=none] {
  fill: none !important;
}
.styles-module__toolbar___wNsdK svg[fill=none] :not([fill]),
.styles-module__markersLayer___-25j1 svg[fill=none] :not([fill]),
.styles-module__fixedMarkersLayer___ffyX6 svg[fill=none] :not([fill]) {
  fill: none !important;
}

.styles-module__controlsContent___9GJWU :where(button, input, select, textarea, label) {
  background: unset;
  border: unset;
  border-radius: unset;
  padding: unset;
  margin: unset;
  color: unset;
  font-family: unset;
  font-weight: unset;
  font-style: unset;
  line-height: unset;
  letter-spacing: unset;
  text-transform: unset;
  text-decoration: unset;
  box-shadow: unset;
  outline: unset;
}

@keyframes styles-module__toolbarEnter___u8RRu {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
@keyframes styles-module__toolbarHide___y8kaT {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
@keyframes styles-module__badgeEnter___mVQLj {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__scaleIn___c-r1K {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__scaleOut___Wctwz {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.85);
  }
}
@keyframes styles-module__slideUp___kgD36 {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes styles-module__slideDown___zcdje {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.85) translateY(8px);
  }
}
@keyframes styles-module__fadeIn___b9qmf {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__fadeOut___6Ut6- {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes styles-module__hoverHighlightIn___6WYHY {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__hoverTooltipIn___FYGQx {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.styles-module__disableTransitions___EopxO :is(*, *::before, *::after) {
  transition: none !important;
}

:host {
  /* Set here rather than inline so a consumer className rule can still hide the toolbar. */
  display: contents;
  position: fixed;
  top: auto;
  left: auto;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 100000;
}

.styles-module__positionContext___AZFHE,
.styles-module__toolbar___wNsdK {
  position: inherit;
  top: inherit;
  left: inherit;
  bottom: inherit;
  right: inherit;
  z-index: inherit;
}

.styles-module__toolbar___wNsdK {
  width: 337px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  pointer-events: none;
  transition: left 0.36s cubic-bezier(0.19, 1, 0.22, 1), top 0s, right 0s, bottom 0s;
}
.styles-module__toolbar___wNsdK[data-dragging=true] {
  transition: none;
}

.styles-module__toolbarContainer___dIhma {
  position: relative;
  -webkit-user-select: none;
  user-select: none;
  margin-left: auto;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  transition: width 0.36s cubic-bezier(0.19, 1, 0.22, 1), transform 0.36s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__toolbarContainer___dIhma.styles-module__entrance___sgHd8 {
  animation: styles-module__toolbarEnter___u8RRu 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
}
.styles-module__toolbarContainer___dIhma.styles-module__hiding___1td44 {
  animation: styles-module__toolbarHide___y8kaT 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
  pointer-events: none;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  padding: 0;
  cursor: pointer;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:hover {
  background: #2a2a2a;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:active {
  transform: scale(0.95);
}
.styles-module__toolbarContainer___dIhma.styles-module__expanded___ofKPx {
  height: 44px;
  border-radius: 22px;
  padding: 5px;
  width: 297px;
}
.styles-module__toolbarContainer___dIhma.styles-module__expanded___ofKPx.styles-module__serverConnected___Gfbou {
  width: 337px;
}

@media (prefers-reduced-motion: reduce) {
  .styles-module__toolbar___wNsdK,
  .styles-module__toolbarContainer___dIhma {
    transition: none;
  }
}
.styles-module__buttonWrapper___rBcdv.styles-module__toggleWrapper___7N0-q {
  position: absolute;
  top: 0;
  right: 0;
  width: 44px;
  height: 44px;
}

.styles-module__togglePlaceholder___wnqrL {
  width: 34px;
  flex: 0 0 34px;
  height: 34px;
}

.styles-module__toggleContent___0yfyP {
  position: absolute;
  top: 0;
  right: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: color 0.15s ease;
}
.styles-module__toggleContent___0yfyP::before {
  content: "";
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  pointer-events: none;
  background: transparent;
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN {
  color: rgba(255, 255, 255, 0.85);
}
.styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN:hover {
  color: #fff;
}
.styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN:hover::before {
  background: rgba(255, 255, 255, 0.12);
}
.styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN:active::before, .styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN:active .styles-module__toggleGlyph___R7Oom {
  transform: scale(0.92);
}

.styles-module__toggleIcon___Jbtus {
  transform: translateY(-0.5px);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.styles-module__expandedToggle___F7SRN .styles-module__toggleIcon___Jbtus {
  transform: none;
}

.styles-module__toggleGlyph___R7Oom {
  overflow: visible;
  transition: transform 0.1s ease;
}
.styles-module__toggleGlyph___R7Oom path {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.16s ease;
}

.styles-module__toggleTopLine___hQaCm,
.styles-module__toggleMiddleLine___sFFVe {
  vector-effect: non-scaling-stroke;
}

.styles-module__toggleBottomLine___V-jX3 {
  transform-origin: left center;
}

.styles-module__toggleGlyph___R7Oom[data-active=true] .styles-module__toggleTopLine___hQaCm {
  transform: translateY(5.25px) rotate(45deg) scaleX(1.1422494);
}
.styles-module__toggleGlyph___R7Oom[data-active=true] .styles-module__toggleMiddleLine___sFFVe {
  transform: translateX(3.5px) rotate(-45deg) scaleX(2.4748737);
}
.styles-module__toggleGlyph___R7Oom[data-active=true] .styles-module__toggleBottomLine___V-jX3 {
  transform: scaleX(0);
  opacity: 0;
}
.styles-module__toggleGlyph___R7Oom[data-active=true] .styles-module__toggleSparkle___eeF99 {
  transform: scale(0);
  opacity: 0;
}

.styles-module__toggleContent___0yfyP:focus-visible,
.styles-module__controlButton___8Q0jc:focus-visible {
  outline: 2px solid var(--agentation-color-accent);
  outline-offset: 3px;
}

.styles-module__controlsContent___9GJWU {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: filter 0.14s ease-out, opacity 0.14s ease-out, transform 0.36s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__controlsContent___9GJWU.styles-module__visible___KHwEW {
  transition: filter 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease-out, transform 0.42s cubic-bezier(0.19, 1, 0.22, 1);
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
  visibility: visible;
  pointer-events: auto;
}
.styles-module__controlsContent___9GJWU.styles-module__hidden___Ae8H4 {
  pointer-events: none;
  opacity: 0;
  filter: blur(6px);
  transform: scale(0.4);
}

@media (prefers-reduced-motion: reduce) {
  .styles-module__controlsContent___9GJWU,
  .styles-module__controlsContent___9GJWU.styles-module__visible___KHwEW,
  .styles-module__toggleContent___0yfyP,
  .styles-module__toggleContent___0yfyP::before,
  .styles-module__toggleGlyph___R7Oom,
  .styles-module__toggleIcon___Jbtus,
  .styles-module__toggleGlyph___R7Oom path {
    transition: none;
  }
  .styles-module__controlsContent___9GJWU.styles-module__hidden___Ae8H4 {
    filter: none;
    transform: none;
  }
}
.styles-module__badge___2XsgF {
  position: absolute;
  top: -13px;
  right: -13px;
  -webkit-user-select: none;
  user-select: none;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background-color: var(--agentation-color-accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.2s ease;
  transform: scale(1);
}
.styles-module__badge___2XsgF.styles-module__fadeOut___6Ut6- {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}
.styles-module__badge___2XsgF.styles-module__entrance___sgHd8 {
  animation: styles-module__badgeEnter___mVQLj 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) 0.4s both;
}

.styles-module__controlButton___8Q0jc {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease, opacity 0.2s ease;
}
.styles-module__controlButton___8Q0jc:hover:not(:disabled):not([data-active=true]):not([data-failed=true]):not([data-auto-sync=true]):not([data-error=true]):not([data-no-hover=true]) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.styles-module__controlButton___8Q0jc:active:not(:disabled) {
  transform: scale(0.92);
}
.styles-module__controlButton___8Q0jc:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.styles-module__controlButton___8Q0jc[data-active=true] {
  color: var(--agentation-color-blue);
  background-color: color-mix(in srgb, var(--agentation-color-blue) 25%, transparent);
}
.styles-module__controlButton___8Q0jc[data-error=true] {
  color: var(--agentation-color-red);
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
}
.styles-module__controlButton___8Q0jc[data-danger]:hover:not(:disabled):not([data-active=true]):not([data-failed=true]) {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}
.styles-module__controlButton___8Q0jc[data-no-hover=true], .styles-module__controlButton___8Q0jc.styles-module__statusShowing___te6iu {
  cursor: default;
  pointer-events: none;
  background: transparent !important;
}
.styles-module__controlButton___8Q0jc[data-auto-sync=true] {
  color: var(--agentation-color-green);
  background: transparent;
  cursor: default;
}
.styles-module__controlButton___8Q0jc[data-failed=true] {
  color: var(--agentation-color-red);
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
}

.styles-module__buttonBadge___NeFWb {
  position: absolute;
  top: 0px;
  right: 0px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: var(--agentation-color-accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #1a1a1a, 0 1px 3px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}
[data-agentation-theme=light] .styles-module__buttonBadge___NeFWb {
  box-shadow: 0 0 0 2px #fff, 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes styles-module__mcpIndicatorPulseConnected___EDodZ {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpIndicatorPulseConnecting___cCYte {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-yellow) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--agentation-color-yellow) 0%, transparent);
  }
}
.styles-module__mcpIndicator___zGJeL {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  pointer-events: none;
  transition: background-color 0.3s ease, opacity 0.15s ease, transform 0.15s ease;
  opacity: 1;
  transform: scale(1);
}
.styles-module__mcpIndicator___zGJeL.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpIndicatorPulseConnected___EDodZ 2.5s ease-in-out infinite;
}
.styles-module__mcpIndicator___zGJeL.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpIndicatorPulseConnecting___cCYte 1.5s ease-in-out infinite;
}
.styles-module__mcpIndicator___zGJeL.styles-module__hidden___Ae8H4 {
  opacity: 0;
  transform: scale(0);
  animation: none;
}

@keyframes styles-module__connectionPulse___-Zycw {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}
.styles-module__connectionIndicatorWrapper___L-e-3 {
  width: 8px;
  height: 34px;
  margin-left: 6px;
  margin-right: 6px;
}

.styles-module__connectionIndicator___afk9p {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease, background-color 0.3s ease;
  cursor: default;
}

.styles-module__connectionIndicatorVisible___C-i5B {
  opacity: 1;
}

.styles-module__connectionIndicatorConnected___IY8pR {
  background-color: var(--agentation-color-green);
  animation: styles-module__connectionPulse___-Zycw 2.5s ease-in-out infinite;
}

.styles-module__connectionIndicatorDisconnected___kmpaZ {
  background-color: var(--agentation-color-red);
  animation: none;
}

.styles-module__connectionIndicatorConnecting___QmSLH {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__connectionPulse___-Zycw 1s ease-in-out infinite;
}

.styles-module__buttonWrapper___rBcdv {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
  transition-delay: 0.85s;
}
.styles-module__buttonWrapper___rBcdv:has(.styles-module__controlButton___8Q0jc:disabled):hover .styles-module__buttonTooltip___Burd9 {
  opacity: 0;
  visibility: hidden;
}

.styles-module__tooltipsInSession___-0lHH .styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  transition-delay: 0s;
}

.styles-module__sendButtonWrapper___UUxG6 {
  width: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  margin-left: -6px;
  transition: width 0.36s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1), margin 0.36s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__sendButtonWrapper___UUxG6 .styles-module__controlButton___8Q0jc {
  transform: scale(0.8);
  transition: transform 0.36s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__sendButtonWrapper___UUxG6.styles-module__sendButtonVisible___WPSQU {
  width: 34px;
  opacity: 1;
  overflow: visible;
  pointer-events: auto;
  margin-left: 0;
}
.styles-module__sendButtonWrapper___UUxG6.styles-module__sendButtonVisible___WPSQU .styles-module__controlButton___8Q0jc {
  transform: scale(1);
}

.styles-module__buttonTooltip___Burd9 {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  padding: 6px 10px;
  background: #1a1a1a;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 100001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: opacity 0.135s ease, transform 0.135s ease, visibility 0.135s ease;
}
.styles-module__buttonTooltip___Burd9::after {
  content: "";
  position: absolute;
  top: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #1a1a1a;
  border-radius: 0 0 2px 0;
}

.styles-module__shortcut___lEAQk {
  margin-left: 4px;
  opacity: 0.5;
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonTooltip___Burd9 {
  bottom: auto;
  top: calc(100% + 14px);
  transform: translateX(-50%) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonTooltip___Burd9::after {
  top: -4px;
  bottom: auto;
  border-radius: 2px 0 0 0;
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-50%) scale(1);
}

.styles-module__tooltipsHidden___VtLJG .styles-module__buttonTooltip___Burd9 {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: none !important;
}

.styles-module__tooltipVisible___0jcCv,
.styles-module__tooltipsHidden___VtLJG .styles-module__tooltipVisible___0jcCv {
  opacity: 1 !important;
  visibility: visible !important;
  transform: translateX(-50%) scale(1) !important;
  transition-delay: 0s !important;
}

.styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9 {
  left: 50%;
  transform: translateX(-12px) scale(0.95);
}
.styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9::after {
  left: 16px;
}
.styles-module__buttonWrapperAlignLeft___myzIp:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(1);
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignLeft___myzIp:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(1);
}

.styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9 {
  left: 50%;
  transform: translateX(calc(-100% + 12px)) scale(0.95);
}
.styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9::after {
  left: auto;
  right: 8px;
}
.styles-module__buttonWrapperAlignRight___HCQFR:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(1);
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignRight___HCQFR:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(1);
}

.styles-module__divider___c--s1 {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 3px;
}

.styles-module__overlay___Q1O9y {
  position: fixed;
  inset: 0;
  z-index: 99997;
  pointer-events: none;
}
.styles-module__overlay___Q1O9y > * {
  pointer-events: auto;
}

.styles-module__hoverHighlight___ogakW {
  position: fixed;
  border: 2px solid color-mix(in srgb, var(--agentation-color-accent) 50%, transparent);
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--agentation-color-accent) 4%, transparent);
  pointer-events: none !important;
  box-sizing: border-box;
  will-change: opacity;
  contain: layout style;
}
.styles-module__hoverHighlight___ogakW.styles-module__enter___WFIki {
  animation: styles-module__hoverHighlightIn___6WYHY 0.12s ease-out forwards;
}

.styles-module__multiSelectOutline___cSJ-m {
  position: fixed;
  border: 2px dashed color-mix(in srgb, var(--agentation-color-green) 60%, transparent);
  border-radius: 4px;
  pointer-events: none !important;
  background-color: color-mix(in srgb, var(--agentation-color-green) 5%, transparent);
  box-sizing: border-box;
  will-change: opacity;
}
.styles-module__multiSelectOutline___cSJ-m.styles-module__enter___WFIki {
  animation: styles-module__fadeIn___b9qmf 0.15s ease-out forwards;
}
.styles-module__multiSelectOutline___cSJ-m.styles-module__exit___fyOJ0 {
  animation: styles-module__fadeOut___6Ut6- 0.15s ease-out forwards;
}

.styles-module__singleSelectOutline___QhX-O {
  position: fixed;
  border: 2px solid color-mix(in srgb, var(--agentation-color-blue) 60%, transparent);
  border-radius: 4px;
  pointer-events: none !important;
  background-color: color-mix(in srgb, var(--agentation-color-blue) 5%, transparent);
  box-sizing: border-box;
  will-change: opacity;
}
.styles-module__singleSelectOutline___QhX-O.styles-module__enter___WFIki {
  animation: styles-module__fadeIn___b9qmf 0.15s ease-out forwards;
}
.styles-module__singleSelectOutline___QhX-O.styles-module__exit___fyOJ0 {
  animation: styles-module__fadeOut___6Ut6- 0.15s ease-out forwards;
}

.styles-module__hoverTooltip___bvLk7 {
  position: fixed;
  z-index: 99999;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.85);
  padding: 0.35rem 0.6rem;
  border-radius: 0.375rem;
  pointer-events: none !important;
  white-space: nowrap;
  max-width: min(280px, 100vw - 16px - 1.2rem);
  overflow: hidden;
  text-overflow: ellipsis;
}
.styles-module__hoverTooltip___bvLk7.styles-module__enter___WFIki {
  animation: styles-module__hoverTooltipIn___FYGQx 0.1s ease-out forwards;
}

.styles-module__hoverReactPath___gx1IJ {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__hoverElementName___QMLMl {
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markersLayer___-25j1 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  z-index: 99998;
  pointer-events: none;
}
.styles-module__markersLayer___-25j1 > * {
  pointer-events: auto;
}

.styles-module__fixedMarkersLayer___ffyX6 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99998;
  pointer-events: none;
}
.styles-module__fixedMarkersLayer___ffyX6 > * {
  pointer-events: auto;
}

.styles-module__marker___6sQrs {
  position: absolute;
  width: 22px;
  height: 22px;
  background: var(--agentation-color-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  -webkit-user-select: none;
  user-select: none;
  will-change: transform, opacity;
  contain: layout style;
  z-index: 1;
}
.styles-module__marker___6sQrs:hover {
  z-index: 2;
}
.styles-module__marker___6sQrs:not(.styles-module__enter___WFIki):not(.styles-module__exit___fyOJ0):not(.styles-module__clearing___FQ--7) {
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.styles-module__marker___6sQrs.styles-module__enter___WFIki {
  animation: styles-module__markerIn___5FaAP 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.styles-module__marker___6sQrs.styles-module__exit___fyOJ0 {
  animation: styles-module__markerOut___GU5jX 0.2s ease-out both;
  pointer-events: none;
}
.styles-module__marker___6sQrs.styles-module__clearing___FQ--7 {
  animation: styles-module__markerOut___GU5jX 0.15s ease-out both;
  pointer-events: none;
}
.styles-module__marker___6sQrs:not(.styles-module__enter___WFIki):not(.styles-module__exit___fyOJ0):not(.styles-module__clearing___FQ--7):hover {
  transform: translate(-50%, -50%) scale(1.1);
}
.styles-module__marker___6sQrs.styles-module__pending___2IHLC {
  position: fixed;
  background-color: var(--agentation-color-blue);
  cursor: default;
}
.styles-module__marker___6sQrs.styles-module__fixed___dBMHC {
  position: fixed;
}
.styles-module__marker___6sQrs.styles-module__multiSelect___YWiuz {
  background-color: var(--agentation-color-green);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 0.75rem;
}
.styles-module__marker___6sQrs.styles-module__multiSelect___YWiuz.styles-module__pending___2IHLC {
  background-color: var(--agentation-color-green);
}
.styles-module__marker___6sQrs.styles-module__hovered___ZgXIy {
  background-color: var(--agentation-color-red);
}

.styles-module__renumber___nCTxD {
  display: block;
  animation: styles-module__renumberRoll___Wgbq3 0.2s ease-out;
}

@keyframes styles-module__renumberRoll___Wgbq3 {
  0% {
    transform: translateX(-40%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.styles-module__markerTooltip___aLJID {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.909);
  z-index: 100002;
  background: #1a1a1a;
  padding: 8px 0.75rem;
  border-radius: 0.75rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  min-width: 120px;
  max-width: 200px;
  pointer-events: none;
  cursor: default;
}
.styles-module__markerTooltip___aLJID.styles-module__enter___WFIki {
  animation: styles-module__tooltipIn___0N31w 0.1s ease-out forwards;
}

.styles-module__markerQuote___FHmrz {
  display: block;
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3125rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markerNote___QkrrS {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-bottom: 2px;
}

.styles-module__markerHint___2iF-6 {
  display: block;
  font-size: 0.625rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.375rem;
  white-space: nowrap;
}

.styles-module__settingsPanel___OxX3Y {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  z-index: 1;
  overflow: hidden;
  background: #1c1c1c;
  border-radius: 1rem;
  padding: 13px 0 16px;
  min-width: 205px;
  cursor: default;
  opacity: 1;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}
.styles-module__settingsPanel___OxX3Y::before, .styles-module__settingsPanel___OxX3Y::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16px;
  z-index: 2;
  pointer-events: none;
}
.styles-module__settingsPanel___OxX3Y::before {
  left: 0;
  background: linear-gradient(to right, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___OxX3Y::after {
  right: 0;
  background: linear-gradient(to left, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___OxX3Y .styles-module__settingsHeader___pwDY9,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsBrand___0gJeM,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsBrandSlash___uTG18,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsVersion___TUcFq,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsSection___m-YM2,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsLabel___8UjfX,
.styles-module__settingsPanel___OxX3Y .styles-module__cycleButton___FMKfw,
.styles-module__settingsPanel___OxX3Y .styles-module__cycleDot___nPgLY,
.styles-module__settingsPanel___OxX3Y .styles-module__dropdownButton___16NPz,
.styles-module__settingsPanel___OxX3Y .styles-module__toggleLabel___Xm8Aa,
.styles-module__settingsPanel___OxX3Y .styles-module__customCheckbox___U39ax,
.styles-module__settingsPanel___OxX3Y .styles-module__sliderLabel___U8sPr,
.styles-module__settingsPanel___OxX3Y .styles-module__slider___GLdxp,
.styles-module__settingsPanel___OxX3Y .styles-module__themeToggle___2rUjA {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__settingsPanel___OxX3Y.styles-module__enter___WFIki {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0px);
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.styles-module__settingsPanel___OxX3Y.styles-module__exit___fyOJ0 {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  filter: blur(5px);
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.1s ease, filter 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y {
  background: #1a1a1a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsLabel___8UjfX {
  color: rgba(255, 255, 255, 0.6);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12 {
  color: rgba(255, 255, 255, 0.85);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12:hover {
  background: rgba(255, 255, 255, 0.1);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12.styles-module__selected___OwRqP {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__toggleLabel___Xm8Aa {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__settingsPanelContainer___Xksv8 {
  overflow: visible;
  position: relative;
  display: flex;
  padding: 0 1rem;
}

.styles-module__settingsPage___6YfHH {
  min-width: 100%;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transition-delay: 0s;
  opacity: 1;
}

.styles-module__settingsPage___6YfHH.styles-module__slideLeft___Ps01J {
  transform: translateX(-24px);
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___uvCq6 {
  position: absolute;
  top: 0;
  left: 24px;
  width: 100%;
  height: 100%;
  padding: 3px 1rem 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___uvCq6.styles-module__slideIn___4-qXe {
  transform: translateX(-24px);
  opacity: 1;
  pointer-events: auto;
}

.styles-module__settingsNavLink___wCzJt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___wCzJt:hover {
  color: rgba(255, 255, 255, 0.9);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt:hover {
  color: rgba(0, 0, 0, 0.8);
}
.styles-module__settingsNavLink___wCzJt svg {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___wCzJt:hover svg {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt svg {
  color: rgba(0, 0, 0, 0.25);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.styles-module__settingsNavLinkRight___ZWwhj {
  display: flex;
  align-items: center;
  gap: 6px;
}

.styles-module__mcpNavIndicator___cl9pO {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpNavIndicator___cl9pO.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___uNggr 2.5s ease-in-out infinite;
}
.styles-module__mcpNavIndicator___cl9pO.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___uNggr 1.5s ease-in-out infinite;
}

.styles-module__settingsBackButton___bIe2j {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0 12px 0;
  margin: -6px 0 0.5rem 0;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___bIe2j svg {
  opacity: 0.4;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.18s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___bIe2j:hover {
  border-bottom-color: rgba(255, 255, 255, 0.07);
}
.styles-module__settingsBackButton___bIe2j:hover svg {
  opacity: 1;
}
[data-agentation-theme=light] .styles-module__settingsBackButton___bIe2j {
  color: rgba(0, 0, 0, 0.85);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsBackButton___bIe2j:hover {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.styles-module__automationHeader___InP0r {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #fff;
}
[data-agentation-theme=light] .styles-module__automationHeader___InP0r {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__automationDescription___NKlmo {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  line-height: 14px;
}
[data-agentation-theme=light] .styles-module__automationDescription___NKlmo {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__learnMoreLink___8xv-x {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__learnMoreLink___8xv-x:hover {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__learnMoreLink___8xv-x {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__learnMoreLink___8xv-x:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__autoSendRow___UblX5 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.styles-module__autoSendLabel___icDc2 {
  font-size: 0.6875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__autoSendLabel___icDc2.styles-module__active___-zoN6 {
  color: #66b8ff;
  color: color(display-p3 0.4 0.72 1);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___icDc2 {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___icDc2.styles-module__active___-zoN6 {
  color: var(--agentation-color-blue);
}

.styles-module__webhookUrlInput___2375C {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 60px;
  box-sizing: border-box;
  margin-top: 11px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 400;
  color: #fff;
  outline: none;
  resize: none;
  user-select: text;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.styles-module__webhookUrlInput___2375C::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__webhookUrlInput___2375C:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__settingsHeader___pwDY9 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin-bottom: 0.5rem;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.styles-module__settingsBrand___0gJeM {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.0094em;
  color: #fff;
  text-decoration: none;
}

.styles-module__settingsBrandSlash___uTG18 {
  color: var(--agentation-color-accent);
  transition: color 0.2s ease;
}

.styles-module__settingsVersion___TUcFq {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
  letter-spacing: -0.0094em;
}

.styles-module__settingsSection___m-YM2 + .styles-module__settingsSection___m-YM2 {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__settingsSection___m-YM2.styles-module__settingsSectionExtraPadding___jdhFV {
  padding-top: calc(0.5rem + 4px);
}

.styles-module__settingsSectionGrow___h-5HZ {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.styles-module__settingsRow___3sdhc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}
.styles-module__settingsRow___3sdhc.styles-module__settingsRowMarginTop___zA0Sp {
  margin-top: 8px;
}

.styles-module__dropdownContainer___BVnxe {
  position: relative;
}

.styles-module__dropdownButton___16NPz {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__dropdownButton___16NPz:hover {
  background: rgba(255, 255, 255, 0.08);
}
.styles-module__dropdownButton___16NPz svg {
  opacity: 0.6;
}

.styles-module__cycleButton___FMKfw {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  letter-spacing: -0.0094em;
}
[data-agentation-theme=light] .styles-module__cycleButton___FMKfw {
  color: rgba(0, 0, 0, 0.85);
}
.styles-module__cycleButton___FMKfw:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.styles-module__settingsRowDisabled___EgS0V .styles-module__settingsLabel___8UjfX {
  color: rgba(255, 255, 255, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsRowDisabled___EgS0V .styles-module__settingsLabel___8UjfX {
  color: rgba(0, 0, 0, 0.2);
}
.styles-module__settingsRowDisabled___EgS0V .styles-module__toggleSwitch___l4Ygm {
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes styles-module__cycleTextIn___Q6zJf {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.styles-module__cycleButtonText___fD1LR {
  display: inline-block;
  animation: styles-module__cycleTextIn___Q6zJf 0.2s ease-out;
}

.styles-module__cycleDots___LWuoQ {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.styles-module__cycleDot___nPgLY {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.667);
  transition: background-color 0.25s ease-out, transform 0.25s ease-out;
}
.styles-module__cycleDot___nPgLY.styles-module__active___-zoN6 {
  background: #fff;
  transform: scale(1);
}
[data-agentation-theme=light] .styles-module__cycleDot___nPgLY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__cycleDot___nPgLY.styles-module__active___-zoN6 {
  background: rgba(0, 0, 0, 0.7);
}

.styles-module__dropdownMenu___k73ER {
  position: absolute;
  right: 0;
  top: calc(100% + 0.25rem);
  background: #1a1a1a;
  border-radius: 0.5rem;
  padding: 0.25rem;
  min-width: 120px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 10;
  animation: styles-module__scaleIn___c-r1K 0.15s ease-out;
}

.styles-module__dropdownItem___ylsLj {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__dropdownItem___ylsLj:hover {
  background: rgba(255, 255, 255, 0.08);
}
.styles-module__dropdownItem___ylsLj.styles-module__selected___OwRqP {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 600;
}

.styles-module__settingsLabel___8UjfX {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.125rem;
}
[data-agentation-theme=light] .styles-module__settingsLabel___8UjfX {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__settingsLabelMarker___ewdtV {
  padding-top: 3px;
  margin-bottom: 10px;
}

.styles-module__settingsOptions___LyrBA {
  display: flex;
  gap: 0.25rem;
}

.styles-module__settingsOption___UNa12 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.styles-module__settingsOption___UNa12:hover {
  background: rgba(0, 0, 0, 0.05);
}
.styles-module__settingsOption___UNa12.styles-module__selected___OwRqP {
  background: color-mix(in srgb, var(--agentation-color-blue) 15%, transparent);
  color: var(--agentation-color-blue);
}

.styles-module__sliderContainer___ducXj {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.styles-module__slider___GLdxp {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.styles-module__slider___GLdxp::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.styles-module__slider___GLdxp::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.styles-module__slider___GLdxp:hover::-webkit-slider-thumb {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
.styles-module__slider___GLdxp:hover::-moz-range-thumb {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.styles-module__sliderLabels___FhLDB {
  display: flex;
  justify-content: space-between;
}

.styles-module__sliderLabel___U8sPr {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.15s ease;
}
.styles-module__sliderLabel___U8sPr:hover {
  color: rgba(255, 255, 255, 0.7);
}
.styles-module__sliderLabel___U8sPr.styles-module__active___-zoN6 {
  color: rgba(255, 255, 255, 0.9);
}

.styles-module__colorOptions___iHCNX {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.375rem;
  margin-bottom: 1px;
}

.styles-module__colorOption___IodiY {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  background-color: var(--swatch);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOption___IodiY {
    background-color: var(--swatch-p3);
  }
}
.styles-module__colorOption___IodiY:hover {
  transform: scale(1.15);
}
.styles-module__colorOption___IodiY.styles-module__selected___OwRqP {
  transform: scale(0.83);
}

.styles-module__colorOptionRing___U2xpo {
  display: flex;
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: border-color 0.3s ease;
}
.styles-module__colorOptionRing___U2xpo.styles-module__selected___OwRqP {
  border-color: var(--swatch);
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOptionRing___U2xpo.styles-module__selected___OwRqP {
    border-color: var(--swatch-p3);
  }
}

.styles-module__settingsToggle___fBrFn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.styles-module__settingsToggle___fBrFn + .styles-module__settingsToggle___fBrFn {
  margin-top: calc(0.5rem + 6px);
}
.styles-module__settingsToggle___fBrFn input[type=checkbox] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.styles-module__settingsToggle___fBrFn.styles-module__settingsToggleMarginBottom___MZUyF {
  margin-bottom: calc(0.5rem + 6px);
}

@keyframes styles-module__mcpPulse___uNggr {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpPulseError___fov9B {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
}
.styles-module__mcpStatusDot___ibgkc {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___uNggr 1.5s infinite;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___uNggr 2.5s ease-in-out infinite;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__disconnected___cHPxR {
  background-color: var(--agentation-color-red);
  animation: styles-module__mcpPulseError___fov9B 2s infinite;
}

.styles-module__drawCanvas___7cG9U {
  position: fixed;
  inset: 0;
  z-index: 99996;
  pointer-events: none !important;
}
.styles-module__drawCanvas___7cG9U.styles-module__active___-zoN6 {
  pointer-events: auto !important;
  cursor: crosshair !important;
}
.styles-module__drawCanvas___7cG9U.styles-module__active___-zoN6[data-stroke-hover] {
  cursor: pointer !important;
}

.styles-module__dragSelection___kZLq2 {
  position: fixed;
  top: 0;
  left: 0;
  border: 2px solid color-mix(in srgb, var(--agentation-color-green) 60%, transparent);
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--agentation-color-green) 8%, transparent);
  pointer-events: none;
  z-index: 99997;
  will-change: transform, width, height;
  contain: layout style;
}

.styles-module__dragCount___KM90j {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--agentation-color-green);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.styles-module__highlightsContainer___-0xzG {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99996;
}

.styles-module__selectedElementHighlight___fyVlI {
  position: fixed;
  top: 0;
  left: 0;
  border: 2px solid color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--agentation-color-green) 6%, transparent);
  pointer-events: none;
  will-change: transform, width, height;
  contain: layout style;
}

[data-agentation-theme=light] .styles-module__toolbarContainer___dIhma {
  background: #fff;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:hover {
  background: #f5f5f5;
}
[data-agentation-theme=light] .styles-module__toggleContent___0yfyP {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN:hover {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__toggleContent___0yfyP.styles-module__expandedToggle___F7SRN:hover::before {
  background: rgba(0, 0, 0, 0.06);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc:hover:not(:disabled):not([data-active=true]):not([data-failed=true]):not([data-auto-sync=true]):not([data-error=true]):not([data-no-hover=true]) {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-active=true] {
  color: var(--agentation-color-blue);
  background: color-mix(in srgb, var(--agentation-color-blue) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-error=true] {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-danger]:hover:not(:disabled):not([data-active=true]):not([data-failed=true]) {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-auto-sync=true] {
  color: var(--agentation-color-green);
  background: transparent;
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-failed=true] {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__buttonTooltip___Burd9 {
  background: #fff;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__buttonTooltip___Burd9::after {
  background: #fff;
}
[data-agentation-theme=light] .styles-module__divider___c--s1 {
  background: rgba(0, 0, 0, 0.1);
}`,U={toolbar:"styles-module__toolbar___wNsdK",markersLayer:"styles-module__markersLayer___-25j1",fixedMarkersLayer:"styles-module__fixedMarkersLayer___ffyX6",controlsContent:"styles-module__controlsContent___9GJWU",disableTransitions:"styles-module__disableTransitions___EopxO",positionContext:"styles-module__positionContext___AZFHE",toolbarContainer:"styles-module__toolbarContainer___dIhma",entrance:"styles-module__entrance___sgHd8",toolbarEnter:"styles-module__toolbarEnter___u8RRu",hiding:"styles-module__hiding___1td44",toolbarHide:"styles-module__toolbarHide___y8kaT",collapsed:"styles-module__collapsed___Rydsn",expanded:"styles-module__expanded___ofKPx",serverConnected:"styles-module__serverConnected___Gfbou",buttonWrapper:"styles-module__buttonWrapper___rBcdv",toggleWrapper:"styles-module__toggleWrapper___7N0-q",togglePlaceholder:"styles-module__togglePlaceholder___wnqrL",toggleContent:"styles-module__toggleContent___0yfyP",expandedToggle:"styles-module__expandedToggle___F7SRN",toggleGlyph:"styles-module__toggleGlyph___R7Oom",toggleIcon:"styles-module__toggleIcon___Jbtus",toggleTopLine:"styles-module__toggleTopLine___hQaCm",toggleMiddleLine:"styles-module__toggleMiddleLine___sFFVe",toggleBottomLine:"styles-module__toggleBottomLine___V-jX3",toggleSparkle:"styles-module__toggleSparkle___eeF99",controlButton:"styles-module__controlButton___8Q0jc",visible:"styles-module__visible___KHwEW",hidden:"styles-module__hidden___Ae8H4",badge:"styles-module__badge___2XsgF",fadeOut:"styles-module__fadeOut___6Ut6-",badgeEnter:"styles-module__badgeEnter___mVQLj",statusShowing:"styles-module__statusShowing___te6iu",buttonBadge:"styles-module__buttonBadge___NeFWb",mcpIndicator:"styles-module__mcpIndicator___zGJeL",connected:"styles-module__connected___7c28g",mcpIndicatorPulseConnected:"styles-module__mcpIndicatorPulseConnected___EDodZ",connecting:"styles-module__connecting___uo-CW",mcpIndicatorPulseConnecting:"styles-module__mcpIndicatorPulseConnecting___cCYte",connectionIndicatorWrapper:"styles-module__connectionIndicatorWrapper___L-e-3",connectionIndicator:"styles-module__connectionIndicator___afk9p",connectionIndicatorVisible:"styles-module__connectionIndicatorVisible___C-i5B",connectionIndicatorConnected:"styles-module__connectionIndicatorConnected___IY8pR",connectionPulse:"styles-module__connectionPulse___-Zycw",connectionIndicatorDisconnected:"styles-module__connectionIndicatorDisconnected___kmpaZ",connectionIndicatorConnecting:"styles-module__connectionIndicatorConnecting___QmSLH",buttonTooltip:"styles-module__buttonTooltip___Burd9",tooltipsInSession:"styles-module__tooltipsInSession___-0lHH",sendButtonWrapper:"styles-module__sendButtonWrapper___UUxG6",sendButtonVisible:"styles-module__sendButtonVisible___WPSQU",shortcut:"styles-module__shortcut___lEAQk",tooltipBelow:"styles-module__tooltipBelow___m6ats",tooltipsHidden:"styles-module__tooltipsHidden___VtLJG",tooltipVisible:"styles-module__tooltipVisible___0jcCv",buttonWrapperAlignLeft:"styles-module__buttonWrapperAlignLeft___myzIp",buttonWrapperAlignRight:"styles-module__buttonWrapperAlignRight___HCQFR",divider:"styles-module__divider___c--s1",overlay:"styles-module__overlay___Q1O9y",hoverHighlight:"styles-module__hoverHighlight___ogakW",enter:"styles-module__enter___WFIki",hoverHighlightIn:"styles-module__hoverHighlightIn___6WYHY",multiSelectOutline:"styles-module__multiSelectOutline___cSJ-m",fadeIn:"styles-module__fadeIn___b9qmf",exit:"styles-module__exit___fyOJ0",singleSelectOutline:"styles-module__singleSelectOutline___QhX-O",hoverTooltip:"styles-module__hoverTooltip___bvLk7",hoverTooltipIn:"styles-module__hoverTooltipIn___FYGQx",hoverReactPath:"styles-module__hoverReactPath___gx1IJ",hoverElementName:"styles-module__hoverElementName___QMLMl",marker:"styles-module__marker___6sQrs",clearing:"styles-module__clearing___FQ--7",markerIn:"styles-module__markerIn___5FaAP",markerOut:"styles-module__markerOut___GU5jX",pending:"styles-module__pending___2IHLC",fixed:"styles-module__fixed___dBMHC",multiSelect:"styles-module__multiSelect___YWiuz",hovered:"styles-module__hovered___ZgXIy",renumber:"styles-module__renumber___nCTxD",renumberRoll:"styles-module__renumberRoll___Wgbq3",markerTooltip:"styles-module__markerTooltip___aLJID",tooltipIn:"styles-module__tooltipIn___0N31w",markerQuote:"styles-module__markerQuote___FHmrz",markerNote:"styles-module__markerNote___QkrrS",markerHint:"styles-module__markerHint___2iF-6",settingsPanel:"styles-module__settingsPanel___OxX3Y",settingsHeader:"styles-module__settingsHeader___pwDY9",settingsBrand:"styles-module__settingsBrand___0gJeM",settingsBrandSlash:"styles-module__settingsBrandSlash___uTG18",settingsVersion:"styles-module__settingsVersion___TUcFq",settingsSection:"styles-module__settingsSection___m-YM2",settingsLabel:"styles-module__settingsLabel___8UjfX",cycleButton:"styles-module__cycleButton___FMKfw",cycleDot:"styles-module__cycleDot___nPgLY",dropdownButton:"styles-module__dropdownButton___16NPz",toggleLabel:"styles-module__toggleLabel___Xm8Aa",customCheckbox:"styles-module__customCheckbox___U39ax",sliderLabel:"styles-module__sliderLabel___U8sPr",slider:"styles-module__slider___GLdxp",themeToggle:"styles-module__themeToggle___2rUjA",settingsOption:"styles-module__settingsOption___UNa12",selected:"styles-module__selected___OwRqP",settingsPanelContainer:"styles-module__settingsPanelContainer___Xksv8",settingsPage:"styles-module__settingsPage___6YfHH",slideLeft:"styles-module__slideLeft___Ps01J",automationsPage:"styles-module__automationsPage___uvCq6",slideIn:"styles-module__slideIn___4-qXe",settingsNavLink:"styles-module__settingsNavLink___wCzJt",settingsNavLinkRight:"styles-module__settingsNavLinkRight___ZWwhj",mcpNavIndicator:"styles-module__mcpNavIndicator___cl9pO",mcpPulse:"styles-module__mcpPulse___uNggr",settingsBackButton:"styles-module__settingsBackButton___bIe2j",automationHeader:"styles-module__automationHeader___InP0r",automationDescription:"styles-module__automationDescription___NKlmo",learnMoreLink:"styles-module__learnMoreLink___8xv-x",autoSendRow:"styles-module__autoSendRow___UblX5",autoSendLabel:"styles-module__autoSendLabel___icDc2",active:"styles-module__active___-zoN6",webhookUrlInput:"styles-module__webhookUrlInput___2375C",settingsSectionExtraPadding:"styles-module__settingsSectionExtraPadding___jdhFV",settingsSectionGrow:"styles-module__settingsSectionGrow___h-5HZ",settingsRow:"styles-module__settingsRow___3sdhc",settingsRowMarginTop:"styles-module__settingsRowMarginTop___zA0Sp",dropdownContainer:"styles-module__dropdownContainer___BVnxe",settingsRowDisabled:"styles-module__settingsRowDisabled___EgS0V",toggleSwitch:"styles-module__toggleSwitch___l4Ygm",cycleButtonText:"styles-module__cycleButtonText___fD1LR",cycleTextIn:"styles-module__cycleTextIn___Q6zJf",cycleDots:"styles-module__cycleDots___LWuoQ",dropdownMenu:"styles-module__dropdownMenu___k73ER",scaleIn:"styles-module__scaleIn___c-r1K",dropdownItem:"styles-module__dropdownItem___ylsLj",settingsLabelMarker:"styles-module__settingsLabelMarker___ewdtV",settingsOptions:"styles-module__settingsOptions___LyrBA",sliderContainer:"styles-module__sliderContainer___ducXj",sliderLabels:"styles-module__sliderLabels___FhLDB",colorOptions:"styles-module__colorOptions___iHCNX",colorOption:"styles-module__colorOption___IodiY",colorOptionRing:"styles-module__colorOptionRing___U2xpo",settingsToggle:"styles-module__settingsToggle___fBrFn",settingsToggleMarginBottom:"styles-module__settingsToggleMarginBottom___MZUyF",mcpStatusDot:"styles-module__mcpStatusDot___ibgkc",disconnected:"styles-module__disconnected___cHPxR",mcpPulseError:"styles-module__mcpPulseError___fov9B",drawCanvas:"styles-module__drawCanvas___7cG9U",dragSelection:"styles-module__dragSelection___kZLq2",dragCount:"styles-module__dragCount___KM90j",highlightsContainer:"styles-module__highlightsContainer___-0xzG",selectedElementHighlight:"styles-module__selectedElementHighlight___fyVlI",scaleOut:"styles-module__scaleOut___Wctwz",slideUp:"styles-module__slideUp___kgD36",slideDown:"styles-module__slideDown___zcdje"};function d3({active:e}){return(0,ui.jsxs)("svg",{className:U.toggleGlyph,"data-active":e,width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,ui.jsx)("path",{className:U.toggleTopLine,d:"M5.5 6.75H18.5"}),(0,ui.jsx)("path",{className:U.toggleMiddleLine,d:"M5.5 12H11.5"}),(0,ui.jsx)("path",{className:U.toggleBottomLine,d:"M5.5 17.25H9.25"}),(0,ui.jsx)("path",{className:U.toggleSparkle,d:"M16 12.75L16.5179 13.9677C16.8078 14.6494 17.3506 15.1922 18.0323 15.4821L19.25 16L18.0323 16.5179C17.3506 16.8078 16.8078 17.3506 16.5179 18.0323L16 19.25L15.4821 18.0323C15.1922 17.3506 14.6494 16.8078 13.9677 16.5179L12.75 16L13.9677 15.4821C14.6494 15.1922 15.1922 14.6494 15.4821 13.9677L16 12.75Z"})]})}var ne={navigation:{width:800,height:56},hero:{width:800,height:320},header:{width:800,height:80},section:{width:800,height:400},sidebar:{width:240,height:400},footer:{width:800,height:160},modal:{width:480,height:300},card:{width:280,height:240},text:{width:400,height:120},image:{width:320,height:200},video:{width:480,height:270},table:{width:560,height:220},grid:{width:600,height:300},list:{width:300,height:180},chart:{width:400,height:240},button:{width:140,height:40},input:{width:280,height:56},form:{width:360,height:320},tabs:{width:480,height:240},dropdown:{width:200,height:200},toggle:{width:44,height:24},search:{width:320,height:44},avatar:{width:48,height:48},badge:{width:80,height:28},breadcrumb:{width:300,height:24},pagination:{width:300,height:36},progress:{width:240,height:8},divider:{width:600,height:1},accordion:{width:400,height:200},carousel:{width:600,height:300},toast:{width:320,height:64},tooltip:{width:180,height:40},pricing:{width:300,height:360},testimonial:{width:360,height:200},cta:{width:600,height:160},alert:{width:400,height:56},banner:{width:800,height:48},stat:{width:200,height:120},stepper:{width:480,height:48},tag:{width:72,height:28},rating:{width:160,height:28},map:{width:480,height:300},timeline:{width:360,height:320},fileUpload:{width:360,height:180},codeBlock:{width:480,height:200},calendar:{width:300,height:300},notification:{width:360,height:72},productCard:{width:280,height:360},profile:{width:280,height:200},drawer:{width:320,height:400},popover:{width:240,height:160},logo:{width:120,height:40},faq:{width:560,height:320},gallery:{width:560,height:360},checkbox:{width:20,height:20},radio:{width:20,height:20},slider:{width:240,height:32},datePicker:{width:300,height:320},skeleton:{width:320,height:120},chip:{width:96,height:32},icon:{width:24,height:24},spinner:{width:32,height:32},feature:{width:360,height:200},team:{width:560,height:280},login:{width:360,height:360},contact:{width:400,height:320}},tb=[{section:"Layout",items:[{type:"navigation",label:"Navigation",...ne.navigation},{type:"header",label:"Header",...ne.header},{type:"hero",label:"Hero",...ne.hero},{type:"section",label:"Section",...ne.section},{type:"sidebar",label:"Sidebar",...ne.sidebar},{type:"footer",label:"Footer",...ne.footer},{type:"modal",label:"Modal",...ne.modal},{type:"banner",label:"Banner",...ne.banner},{type:"drawer",label:"Drawer",...ne.drawer},{type:"popover",label:"Popover",...ne.popover},{type:"divider",label:"Divider",...ne.divider}]},{section:"Content",items:[{type:"card",label:"Card",...ne.card},{type:"text",label:"Text",...ne.text},{type:"image",label:"Image",...ne.image},{type:"video",label:"Video",...ne.video},{type:"table",label:"Table",...ne.table},{type:"grid",label:"Grid",...ne.grid},{type:"list",label:"List",...ne.list},{type:"chart",label:"Chart",...ne.chart},{type:"codeBlock",label:"Code Block",...ne.codeBlock},{type:"map",label:"Map",...ne.map},{type:"timeline",label:"Timeline",...ne.timeline},{type:"calendar",label:"Calendar",...ne.calendar},{type:"accordion",label:"Accordion",...ne.accordion},{type:"carousel",label:"Carousel",...ne.carousel},{type:"logo",label:"Logo",...ne.logo},{type:"faq",label:"FAQ",...ne.faq},{type:"gallery",label:"Gallery",...ne.gallery}]},{section:"Controls",items:[{type:"button",label:"Button",...ne.button},{type:"input",label:"Input",...ne.input},{type:"search",label:"Search",...ne.search},{type:"form",label:"Form",...ne.form},{type:"tabs",label:"Tabs",...ne.tabs},{type:"dropdown",label:"Dropdown",...ne.dropdown},{type:"toggle",label:"Toggle",...ne.toggle},{type:"stepper",label:"Stepper",...ne.stepper},{type:"rating",label:"Rating",...ne.rating},{type:"fileUpload",label:"File Upload",...ne.fileUpload},{type:"checkbox",label:"Checkbox",...ne.checkbox},{type:"radio",label:"Radio",...ne.radio},{type:"slider",label:"Slider",...ne.slider},{type:"datePicker",label:"Date Picker",...ne.datePicker}]},{section:"Elements",items:[{type:"avatar",label:"Avatar",...ne.avatar},{type:"badge",label:"Badge",...ne.badge},{type:"tag",label:"Tag",...ne.tag},{type:"breadcrumb",label:"Breadcrumb",...ne.breadcrumb},{type:"pagination",label:"Pagination",...ne.pagination},{type:"progress",label:"Progress",...ne.progress},{type:"alert",label:"Alert",...ne.alert},{type:"toast",label:"Toast",...ne.toast},{type:"notification",label:"Notification",...ne.notification},{type:"tooltip",label:"Tooltip",...ne.tooltip},{type:"stat",label:"Stat",...ne.stat},{type:"skeleton",label:"Skeleton",...ne.skeleton},{type:"chip",label:"Chip",...ne.chip},{type:"icon",label:"Icon",...ne.icon},{type:"spinner",label:"Spinner",...ne.spinner}]},{section:"Blocks",items:[{type:"pricing",label:"Pricing",...ne.pricing},{type:"testimonial",label:"Testimonial",...ne.testimonial},{type:"cta",label:"CTA",...ne.cta},{type:"productCard",label:"Product Card",...ne.productCard},{type:"profile",label:"Profile",...ne.profile},{type:"feature",label:"Feature",...ne.feature},{type:"team",label:"Team",...ne.team},{type:"login",label:"Login",...ne.login},{type:"contact",label:"Contact",...ne.contact}]}],Ul={};for(let e of tb)for(let t of e.items)Ul[t.type]=t;function j({w:e,h:t=3,strong:n}){return(0,u.jsx)("div",{style:{width:typeof e=="number"?`${e}px`:e,height:t,borderRadius:2,background:n?"var(--agd-bar-strong)":"var(--agd-bar)",flexShrink:0}})}function wt({w:e,h:t,radius:n=3,style:l}){return(0,u.jsx)("div",{style:{width:typeof e=="number"?`${e}px`:e,height:typeof t=="number"?`${t}px`:t,borderRadius:n,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",flexShrink:0,...l}})}function Hn({size:e}){return(0,u.jsx)("div",{style:{width:e,height:e,borderRadius:"50%",border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",flexShrink:0}})}function _3({width:e,height:t}){let n=Math.max(8,t*.2);return(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",height:"100%",padding:`0 ${n}px`,gap:e*.02},children:[(0,u.jsx)(wt,{w:Math.max(20,t*.5),h:Math.max(12,t*.4),radius:2}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",gap:e*.03,marginLeft:e*.04},children:[(0,u.jsx)(j,{w:e*.06}),(0,u.jsx)(j,{w:e*.07}),(0,u.jsx)(j,{w:e*.05}),(0,u.jsx)(j,{w:e*.06})]}),(0,u.jsx)(wt,{w:e*.1,h:Math.min(28,t*.5),radius:4})]})}function f3({width:e,height:t,text:n}){return(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:t*.05},children:[n?(0,u.jsx)("span",{style:{fontSize:Math.min(20,t*.08),fontWeight:600,color:"var(--agd-text-3)",textAlign:"center",maxWidth:"80%"},children:n}):(0,u.jsx)(j,{w:e*.5,h:Math.max(6,t*.04),strong:!0}),(0,u.jsx)(j,{w:e*.6}),(0,u.jsx)(j,{w:e*.4}),(0,u.jsx)(wt,{w:Math.min(140,e*.2),h:Math.min(36,t*.12),radius:6,style:{marginTop:t*.06}})]})}function h3({width:e,height:t}){let n=Math.max(3,Math.floor(t/36));return(0,u.jsxs)("div",{style:{padding:e*.08,display:"flex",flexDirection:"column",gap:t*.03},children:[(0,u.jsx)(j,{w:e*.6,h:4,strong:!0}),Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6},children:[(0,u.jsx)(wt,{w:10,h:10,radius:2}),(0,u.jsx)(j,{w:e*(.4+o*17%30/100)})]},o))]})}function m3({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/160)));return(0,u.jsx)("div",{style:{display:"flex",padding:`${t*.12}px ${e*.03}px`,gap:e*.05},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[(0,u.jsx)(j,{w:"60%",h:3,strong:!0}),(0,u.jsx)(j,{w:"80%",h:2}),(0,u.jsx)(j,{w:"70%",h:2}),(0,u.jsx)(j,{w:"60%",h:2})]},o))})}function g3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,u.jsxs)("div",{style:{padding:"10px 12px",borderBottom:"1px solid var(--agd-stroke)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,u.jsx)(j,{w:e*.3,h:4,strong:!0}),(0,u.jsx)("div",{style:{width:14,height:14,border:"1px solid var(--agd-stroke)",borderRadius:3}})]}),(0,u.jsxs)("div",{style:{flex:1,padding:12,display:"flex",flexDirection:"column",gap:6},children:[(0,u.jsx)(j,{w:"90%"}),(0,u.jsx)(j,{w:"70%"}),(0,u.jsx)(j,{w:"80%"})]}),(0,u.jsxs)("div",{style:{padding:"10px 12px",borderTop:"1px solid var(--agd-stroke)",display:"flex",justifyContent:"flex-end",gap:8},children:[(0,u.jsx)(wt,{w:70,h:26,radius:4}),(0,u.jsx)(wt,{w:70,h:26,radius:4,style:{background:"var(--agd-bar)"}})]})]})}function y3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,u.jsx)("div",{style:{height:"40%",background:"var(--agd-fill)",borderBottom:"1px dashed var(--agd-stroke)"}}),(0,u.jsxs)("div",{style:{flex:1,padding:10,display:"flex",flexDirection:"column",gap:5},children:[(0,u.jsx)(j,{w:"70%",h:4,strong:!0}),(0,u.jsx)(j,{w:"95%",h:2}),(0,u.jsx)(j,{w:"85%",h:2}),(0,u.jsx)(j,{w:"50%",h:2})]})]})}function p3({width:e,height:t,text:n}){if(n)return(0,u.jsx)("div",{style:{padding:4,fontSize:Math.min(14,t*.3),lineHeight:1.5,color:"var(--agd-text-3)",wordBreak:"break-word",overflow:"hidden"},children:n});let l=Math.max(2,Math.floor(t/18));return(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:6,padding:4},children:[(0,u.jsx)(j,{w:e*.6,h:5,strong:!0}),Array.from({length:l},(o,a)=>(0,u.jsx)(j,{w:`${70+a*13%25}%`,h:2},a))]})}function b3({width:e,height:t}){return(0,u.jsx)("div",{style:{height:"100%",position:"relative"},children:(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,preserveAspectRatio:"none",fill:"none",children:[(0,u.jsx)("line",{x1:"0",y1:"0",x2:e,y2:t,stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,u.jsx)("line",{x1:e,y1:"0",x2:"0",y2:t,stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,u.jsx)("circle",{cx:e*.3,cy:t*.3,r:Math.min(e,t)*.08,fill:"var(--agd-fill)",stroke:"var(--agd-stroke)",strokeWidth:"0.8"})]})})}function v3({width:e,height:t}){let n=Math.max(2,Math.min(5,Math.floor(e/100))),l=Math.max(2,Math.min(6,Math.floor(t/32)));return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,u.jsx)("div",{style:{display:"flex",borderBottom:"1px solid var(--agd-stroke)",padding:"6px 0"},children:Array.from({length:n},(o,a)=>(0,u.jsx)("div",{style:{flex:1,padding:"0 8px"},children:(0,u.jsx)(j,{w:"70%",h:3,strong:!0})},a))}),Array.from({length:l},(o,a)=>(0,u.jsx)("div",{style:{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.03)",padding:"6px 0"},children:Array.from({length:n},(i,r)=>(0,u.jsx)("div",{style:{flex:1,padding:"0 8px"},children:(0,u.jsx)(j,{w:`${50+(a*7+r*13)%40}%`,h:2})},r))},a))]})}function x3({width:e,height:t}){let n=Math.max(2,Math.floor(t/28));return(0,u.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:4,padding:4},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0"},children:[(0,u.jsx)(Hn,{size:8}),(0,u.jsx)(j,{w:`${55+o*17%35}%`,h:2})]},o))})}function w3({width:e,height:t,text:n}){return(0,u.jsx)("div",{style:{height:"100%",borderRadius:Math.min(8,t/3),border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:n?(0,u.jsx)("span",{style:{fontSize:Math.min(13,t*.4),fontWeight:500,color:"var(--agd-text-3)",letterSpacing:"-0.01em"},children:n}):(0,u.jsx)(j,{w:Math.max(20,e*.5),h:3,strong:!0})})}function S3({width:e,height:t}){return(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:4,height:"100%",justifyContent:"center"},children:[(0,u.jsx)(j,{w:Math.min(80,e*.3),h:2}),(0,u.jsx)("div",{style:{height:Math.min(36,t*.6),borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",paddingLeft:8},children:(0,u.jsx)(j,{w:"40%",h:2})})]})}function k3({width:e,height:t}){let n=Math.max(2,Math.min(5,Math.floor(t/56)));return(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:t*.04,padding:8},children:[Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[(0,u.jsx)(j,{w:60+o*17%30,h:2}),(0,u.jsx)(wt,{w:"100%",h:28,radius:4})]},o)),(0,u.jsx)(wt,{w:Math.min(120,e*.35),h:30,radius:6,style:{marginTop:8,alignSelf:"flex-end",background:"var(--agd-bar)"}})]})}function C3({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/120)));return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,u.jsx)("div",{style:{display:"flex",gap:2,borderBottom:"1px solid var(--agd-stroke)"},children:Array.from({length:n},(l,o)=>(0,u.jsx)("div",{style:{padding:"8px 12px",borderBottom:o===0?"2px solid var(--agd-bar-strong)":"none"},children:(0,u.jsx)(j,{w:60,h:3,strong:o===0})},o))}),(0,u.jsxs)("div",{style:{flex:1,padding:12,display:"flex",flexDirection:"column",gap:6},children:[(0,u.jsx)(j,{w:"80%",h:2}),(0,u.jsx)(j,{w:"65%",h:2}),(0,u.jsx)(j,{w:"75%",h:2})]})]})}function M3({width:e,height:t}){let n=Math.min(e,t)/2;return(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,u.jsx)("circle",{cx:e/2,cy:t/2,r:n-1,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"1.5",strokeDasharray:"3 2"}),(0,u.jsx)("circle",{cx:e/2,cy:t*.38,r:n*.28,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"0.8"}),(0,u.jsx)("path",{d:`M${e/2-n*.55} ${t*.78} C${e/2-n*.55} ${t*.55} ${e/2+n*.55} ${t*.55} ${e/2+n*.55} ${t*.78}`,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"0.8"})]})}function E3({width:e,height:t}){return(0,u.jsx)("div",{style:{height:"100%",borderRadius:t/2,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,u.jsx)(j,{w:Math.max(16,e*.5),h:2,strong:!0})})}function T3({width:e,height:t}){return(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:t*.08},children:[(0,u.jsx)(j,{w:e*.5,h:Math.max(5,t*.06),strong:!0}),(0,u.jsx)(j,{w:e*.35})]})}function N3({width:e,height:t}){return(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%",gap:t*.04,padding:e*.04},children:[(0,u.jsx)(j,{w:e*.3,h:4,strong:!0}),(0,u.jsx)(j,{w:e*.7}),(0,u.jsx)(j,{w:e*.5}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",gap:e*.03,marginTop:t*.06},children:[(0,u.jsx)(wt,{w:"33%",h:"100%",radius:4}),(0,u.jsx)(wt,{w:"33%",h:"100%",radius:4}),(0,u.jsx)(wt,{w:"33%",h:"100%",radius:4})]})]})}function R3({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/140))),l=Math.max(1,Math.min(3,Math.floor(t/120)));return(0,u.jsx)("div",{style:{display:"grid",gridTemplateColumns:`repeat(${n}, 1fr)`,gridTemplateRows:`repeat(${l}, 1fr)`,gap:6,height:"100%"},children:Array.from({length:n*l},(o,a)=>(0,u.jsx)(wt,{w:"100%",h:"100%",radius:4},a))})}function A3({width:e,height:t}){let n=Math.max(2,Math.floor((t-32)/28));return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,u.jsx)("div",{style:{padding:"6px 8px",borderBottom:"1px solid var(--agd-stroke)"},children:(0,u.jsx)(j,{w:e*.5,h:3,strong:!0})}),(0,u.jsx)("div",{style:{flex:1,padding:4,display:"flex",flexDirection:"column",gap:2},children:Array.from({length:n},(l,o)=>(0,u.jsx)("div",{style:{padding:"4px 6px",borderRadius:3,background:o===0?"var(--agd-fill)":"transparent"},children:(0,u.jsx)(j,{w:`${50+o*17%35}%`,h:2,strong:o===0})},o))})]})}function D3({width:e,height:t}){let n=Math.min(e,t)/2;return(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,u.jsx)("rect",{x:"1",y:"1",width:e-2,height:t-2,rx:n,stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,u.jsx)("circle",{cx:e-n,cy:t/2,r:n*.7,fill:"var(--agd-bar)"})]})}function z3({width:e,height:t}){let n=Math.min(t/2,20);return(0,u.jsxs)("div",{style:{height:"100%",borderRadius:n,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:`0 ${n*.6}px`,gap:6},children:[(0,u.jsx)(Hn,{size:Math.min(14,t*.4)}),(0,u.jsx)(j,{w:"50%",h:2})]})}function O3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[(0,u.jsx)(Hn,{size:Math.min(20,t*.5)}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:"60%",h:3,strong:!0}),(0,u.jsx)(j,{w:"80%",h:2})]}),(0,u.jsx)("div",{style:{width:14,height:14,border:"1px solid var(--agd-stroke)",borderRadius:3,flexShrink:0}})]})}function L3({width:e,height:t}){return(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,u.jsx)("rect",{x:"0",y:"0",width:e,height:t,rx:t/2,stroke:"var(--agd-stroke)",strokeWidth:"0.8"}),(0,u.jsx)("rect",{x:"1",y:"1",width:e*.65,height:t-2,rx:(t-2)/2,fill:"var(--agd-bar)"})]})}function B3({width:e,height:t}){let n=Math.max(3,Math.min(7,Math.floor(e/50))),l=e/(n*2);return(0,u.jsx)("div",{style:{height:"100%",display:"flex",alignItems:"flex-end",justifyContent:"space-around",padding:"0 4px",borderBottom:"1px solid var(--agd-stroke)"},children:Array.from({length:n},(o,a)=>{let i=30+(a*37+17)%55;return(0,u.jsx)(wt,{w:l,h:`${i}%`,radius:2},a)})})}function H3({width:e,height:t}){let n=Math.min(e,t)*.12;return(0,u.jsxs)("div",{style:{height:"100%",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,u.jsx)(wt,{w:"100%",h:"100%",radius:4}),(0,u.jsx)("div",{style:{position:"absolute",width:n*2,height:n*2,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,u.jsx)("div",{style:{width:0,height:0,borderLeft:`${n*.6}px solid var(--agd-bar-strong)`,borderTop:`${n*.4}px solid transparent`,borderBottom:`${n*.4}px solid transparent`,marginLeft:n*.15}})})]})}function $3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,u.jsx)("div",{style:{flex:1,width:"100%",borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,u.jsx)(j,{w:"60%",h:2})}),(0,u.jsx)("div",{style:{width:8,height:8,background:"var(--agd-fill)",border:"1px dashed var(--agd-stroke)",borderTop:"none",borderLeft:"none",transform:"rotate(45deg)",marginTop:-5}})]})}function U3({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/80)));return(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",height:"100%",gap:4},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:4},children:[o>0&&(0,u.jsx)("span",{style:{color:"var(--agd-stroke)",fontSize:10},children:"/"}),(0,u.jsx)(j,{w:40+o*13%20,h:2,strong:o===n-1})]},o))})}function Y3({width:e,height:t}){let n=Math.max(3,Math.min(5,Math.floor(e/40))),l=Math.min(28,t*.8);return(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",gap:4},children:Array.from({length:n},(o,a)=>(0,u.jsx)(wt,{w:l,h:l,radius:4,style:a===1?{background:"var(--agd-bar)"}:void 0},a))})}function j3({width:e}){return(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",height:"100%"},children:(0,u.jsx)("div",{style:{width:"100%",height:1,background:"var(--agd-stroke)"}})})}function I3({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(t/40)));return(0,u.jsx)("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{borderBottom:"1px solid var(--agd-stroke)",padding:"8px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flex:o===0?2:1},children:[(0,u.jsx)(j,{w:`${40+o*17%25}%`,h:3,strong:!0}),(0,u.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:o===0?"\u25BC":"\u25B6"})]},o))})}function X3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:6},children:[(0,u.jsxs)("div",{style:{flex:1,display:"flex",gap:6,alignItems:"center"},children:[(0,u.jsx)("span",{style:{fontSize:12,color:"var(--agd-stroke)"},children:"\u2039"}),(0,u.jsx)(wt,{w:"100%",h:"100%",radius:4}),(0,u.jsx)("span",{style:{fontSize:12,color:"var(--agd-stroke)"},children:"\u203A"})]}),(0,u.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:4},children:[(0,u.jsx)(Hn,{size:5}),(0,u.jsx)(Hn,{size:5}),(0,u.jsx)(Hn,{size:5})]})]})}function q3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:10,gap:t*.04},children:[(0,u.jsx)(j,{w:e*.4,h:3,strong:!0}),(0,u.jsx)(j,{w:e*.3,h:6,strong:!0}),(0,u.jsx)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4,width:"100%",padding:"8px 0"},children:Array.from({length:4},(n,l)=>(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:4},children:[(0,u.jsx)(Hn,{size:5}),(0,u.jsx)(j,{w:`${50+l*17%35}%`,h:2})]},l))}),(0,u.jsx)(wt,{w:e*.7,h:Math.min(32,t*.1),radius:6,style:{background:"var(--agd-bar)"}})]})}function Q3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",padding:10,gap:8},children:[(0,u.jsx)("span",{style:{fontSize:18,lineHeight:1,color:"var(--agd-stroke)",fontFamily:"serif"},children:"\u201C"}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[(0,u.jsx)(j,{w:"90%",h:2}),(0,u.jsx)(j,{w:"75%",h:2}),(0,u.jsx)(j,{w:"60%",h:2})]}),(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6},children:[(0,u.jsx)(Hn,{size:20}),(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:2},children:[(0,u.jsx)(j,{w:60,h:3,strong:!0}),(0,u.jsx)(j,{w:40,h:2})]})]})]})}function G3({width:e,height:t}){return(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:t*.08},children:[(0,u.jsx)(j,{w:e*.5,h:Math.max(4,t*.05),strong:!0}),(0,u.jsx)(j,{w:e*.35}),(0,u.jsx)(wt,{w:Math.min(140,e*.25),h:Math.min(32,t*.15),radius:6,style:{marginTop:t*.04,background:"var(--agd-bar)"}})]})}function V3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[(0,u.jsx)("div",{style:{width:16,height:16,borderRadius:"50%",border:"1.5px solid var(--agd-bar-strong)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,u.jsx)("div",{style:{width:2,height:6,background:"var(--agd-bar-strong)",borderRadius:1}})}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:"40%",h:3,strong:!0}),(0,u.jsx)(j,{w:"70%",h:2})]})]})}function W3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"0 12px"},children:[(0,u.jsx)(j,{w:e*.4,h:3,strong:!0}),(0,u.jsx)(wt,{w:60,h:Math.min(24,t*.6),radius:4})]})}function F3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:t*.06},children:[(0,u.jsx)(j,{w:e*.5,h:2}),(0,u.jsx)(j,{w:e*.4,h:Math.max(8,t*.18),strong:!0}),(0,u.jsx)(j,{w:e*.3,h:2})]})}function Z3({width:e,height:t}){let n=Math.max(3,Math.min(5,Math.floor(e/100))),l=Math.min(12,t*.35);return(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",height:"100%",padding:"0 8px"},children:Array.from({length:n},(o,a)=>(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:0,flex:1},children:[(0,u.jsx)("div",{style:{width:l,height:l,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:a===0?"var(--agd-bar)":"transparent",flexShrink:0}}),a<n-1&&(0,u.jsx)("div",{style:{flex:1,height:1,background:"var(--agd-stroke)",margin:"0 4px"}})]},a))})}function K3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",borderRadius:4,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"0 6px"},children:[(0,u.jsx)(j,{w:Math.max(16,e*.5),h:2,strong:!0}),(0,u.jsx)("div",{style:{width:8,height:8,borderRadius:"50%",border:"1px solid var(--agd-stroke)",flexShrink:0}})]})}function J3({width:e,height:t}){let l=Math.min(t*.7,e/7.5);return(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",gap:l*.2},children:Array.from({length:5},(o,a)=>(0,u.jsx)("svg",{width:l,height:l,viewBox:"0 0 16 16",fill:"none",children:(0,u.jsx)("path",{d:"M8 1.5l2 4 4.5.7-3.25 3.1.75 4.5L8 11.4l-4 2.4.75-4.5L1.5 6.2 6 5.5z",stroke:"var(--agd-stroke)",strokeWidth:"0.8",fill:a<3?"var(--agd-bar)":"none"})},a))})}function P3({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",position:"relative",borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",overflow:"hidden"},children:[(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",style:{position:"absolute",inset:0},children:[(0,u.jsx)("line",{x1:0,y1:t*.3,x2:e,y2:t*.7,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".2"}),(0,u.jsx)("line",{x1:0,y1:t*.6,x2:e,y2:t*.2,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".15"}),(0,u.jsx)("line",{x1:e*.4,y1:0,x2:e*.6,y2:t,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".15"})]}),(0,u.jsx)("div",{style:{position:"absolute",left:"50%",top:"40%",transform:"translate(-50%, -100%)"},children:(0,u.jsxs)("svg",{width:"16",height:"22",viewBox:"0 0 16 22",fill:"none",children:[(0,u.jsx)("path",{d:"M8 0C3.6 0 0 3.6 0 8c0 6 8 14 8 14s8-8 8-14c0-4.4-3.6-8-8-8z",fill:"var(--agd-bar)",opacity:".4"}),(0,u.jsx)("circle",{cx:"8",cy:"8",r:"3",fill:"var(--agd-fill)"})]})})]})}function e6({width:e,height:t}){let n=Math.max(3,Math.min(5,Math.floor(t/60)));return(0,u.jsxs)("div",{style:{display:"flex",height:"100%",padding:"8px 0"},children:[(0,u.jsx)("div",{style:{width:16,display:"flex",flexDirection:"column",alignItems:"center"},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",flex:1},children:[(0,u.jsx)(Hn,{size:8}),o<n-1&&(0,u.jsx)("div",{style:{flex:1,width:1,background:"var(--agd-stroke)"}})]},o))}),(0,u.jsx)("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-around",paddingLeft:8},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:`${35+o*13%25}%`,h:3,strong:!0}),(0,u.jsx)(j,{w:`${50+o*17%30}%`,h:2})]},o))})]})}function t6({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",borderRadius:8,border:"2px dashed var(--agd-stroke)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:t*.06},children:[(0,u.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[(0,u.jsx)("path",{d:"M12 16V4m0 0l-4 4m4-4l4 4",stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),(0,u.jsx)("path",{d:"M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2",stroke:"var(--agd-stroke)",strokeWidth:"1.5"})]}),(0,u.jsx)(j,{w:e*.4,h:2}),(0,u.jsx)(j,{w:e*.25,h:2})]})}function n6({width:e,height:t}){let n=Math.max(3,Math.min(8,Math.floor(t/20)));return(0,u.jsxs)("div",{style:{height:"100%",borderRadius:6,background:"var(--agd-fill)",border:"1px solid var(--agd-stroke)",padding:8,display:"flex",flexDirection:"column",gap:4},children:[(0,u.jsxs)("div",{style:{display:"flex",gap:3,marginBottom:4},children:[(0,u.jsx)(Hn,{size:6}),(0,u.jsx)(Hn,{size:6}),(0,u.jsx)(Hn,{size:6})]}),Array.from({length:n},(l,o)=>(0,u.jsx)("div",{style:{display:"flex",gap:6,paddingLeft:o>0&&o<n-1?12:0},children:(0,u.jsx)(j,{w:`${25+o*23%50}%`,h:2,strong:o===0})},o))]})}function l6({width:e,height:t}){let o=Math.min((e-16)/7,(t-40)/6);return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px"},children:[(0,u.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:"\u2039"}),(0,u.jsx)(j,{w:e*.3,h:3,strong:!0}),(0,u.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:"\u203A"})]}),(0,u.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:2,padding:"0 4px",flex:1},children:[Array.from({length:7},(a,i)=>(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:o*.6},children:(0,u.jsx)(j,{w:o*.5,h:2})},`h${i}`)),Array.from({length:35},(a,i)=>(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:o},children:(0,u.jsx)("div",{style:{width:o*.6,height:o*.6,borderRadius:"50%",background:i===12?"var(--agd-bar)":"transparent",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,u.jsx)("div",{style:{width:2,height:2,borderRadius:1,background:"var(--agd-bar-strong)",opacity:i===12?1:.3}})})},i))]})]})}function o6({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[(0,u.jsx)(Hn,{size:Math.min(32,t*.55)}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:"50%",h:3,strong:!0}),(0,u.jsx)(j,{w:"75%",h:2})]}),(0,u.jsx)(j,{w:30,h:2})]})}function a6({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,u.jsx)("div",{style:{height:"50%",background:"var(--agd-fill)",borderBottom:"1px dashed var(--agd-stroke)"}}),(0,u.jsxs)("div",{style:{flex:1,padding:10,display:"flex",flexDirection:"column",gap:5},children:[(0,u.jsx)(j,{w:"65%",h:4,strong:!0}),(0,u.jsx)(j,{w:"40%",h:3}),(0,u.jsx)("div",{style:{flex:1}}),(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,u.jsx)(j,{w:"30%",h:5,strong:!0}),(0,u.jsx)(wt,{w:Math.min(70,e*.3),h:26,radius:4,style:{background:"var(--agd-bar)"}})]})]})]})}function i6({width:e,height:t}){let n=Math.min(48,t*.3);return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:t*.06},children:[(0,u.jsx)(Hn,{size:n}),(0,u.jsx)(j,{w:e*.45,h:4,strong:!0}),(0,u.jsx)(j,{w:e*.3,h:2}),(0,u.jsxs)("div",{style:{display:"flex",gap:e*.08,marginTop:t*.04},children:[(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[(0,u.jsx)(j,{w:20,h:3,strong:!0}),(0,u.jsx)(j,{w:28,h:2})]}),(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[(0,u.jsx)(j,{w:20,h:3,strong:!0}),(0,u.jsx)(j,{w:28,h:2})]}),(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[(0,u.jsx)(j,{w:20,h:3,strong:!0}),(0,u.jsx)(j,{w:28,h:2})]})]})]})}function r6({width:e,height:t}){let n=Math.max(e*.6,80),l=Math.max(3,Math.floor(t/40));return(0,u.jsxs)("div",{style:{height:"100%",display:"flex"},children:[(0,u.jsx)("div",{style:{width:e-n,background:"var(--agd-fill)",opacity:.3}}),(0,u.jsxs)("div",{style:{flex:1,borderLeft:"1px solid var(--agd-stroke)",display:"flex",flexDirection:"column",padding:e*.04},children:[(0,u.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t*.06},children:[(0,u.jsx)(j,{w:n*.4,h:4,strong:!0}),(0,u.jsx)("div",{style:{width:12,height:12,border:"1px solid var(--agd-stroke)",borderRadius:3}})]}),Array.from({length:l},(o,a)=>(0,u.jsx)("div",{style:{padding:"6px 0"},children:(0,u.jsx)(j,{w:`${50+a*17%35}%`,h:2,strong:a===0})},a))]})]})}function s6({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,u.jsxs)("div",{style:{flex:1,width:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",padding:10,display:"flex",flexDirection:"column",gap:5},children:[(0,u.jsx)(j,{w:"70%",h:3,strong:!0}),(0,u.jsx)(j,{w:"90%",h:2}),(0,u.jsx)(j,{w:"60%",h:2})]}),(0,u.jsx)("div",{style:{width:10,height:10,background:"var(--agd-fill)",border:"1px dashed var(--agd-stroke)",borderTop:"none",borderLeft:"none",transform:"rotate(45deg)",marginTop:-6}})]})}function c6({width:e,height:t}){let n=Math.min(t*.7,e*.3);return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",alignItems:"center",gap:e*.08},children:[(0,u.jsx)(wt,{w:n,h:n,radius:n*.25}),(0,u.jsx)(j,{w:e*.45,h:Math.max(4,t*.2),strong:!0})]})}function u6({width:e,height:t}){let n=Math.max(2,Math.min(5,Math.floor(t/56)));return(0,u.jsx)("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{borderBottom:"1px solid var(--agd-stroke)",padding:"8px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flex:o===0?2:1},children:[(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6},children:[(0,u.jsx)("span",{style:{fontSize:9,fontWeight:700,color:"var(--agd-stroke)"},children:"Q"}),(0,u.jsx)(j,{w:e*(.3+o*13%25/100),h:3,strong:!0})]}),(0,u.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:o===0?"\u25BC":"\u25B6"})]},o))})}function d6({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/120))),l=Math.max(1,Math.min(3,Math.floor(t/120)));return(0,u.jsx)("div",{style:{display:"grid",gridTemplateColumns:`repeat(${n}, 1fr)`,gridTemplateRows:`repeat(${l}, 1fr)`,gap:4,height:"100%"},children:Array.from({length:n*l},(o,a)=>(0,u.jsx)("div",{style:{borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",position:"relative",overflow:"hidden"},children:(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:"0 0 100 100",preserveAspectRatio:"none",fill:"none",children:[(0,u.jsx)("line",{x1:"0",y1:"0",x2:"100",y2:"100",stroke:"var(--agd-stroke)",strokeWidth:"0.5"}),(0,u.jsx)("line",{x1:"100",y1:"0",x2:"0",y2:"100",stroke:"var(--agd-stroke)",strokeWidth:"0.5"})]})},a))})}function _6({width:e,height:t}){let n=Math.min(e,t);return(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,u.jsx)("rect",{x:"1",y:(t-n+2)/2,width:n-2,height:n-2,rx:n*.15,stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),(0,u.jsx)("path",{d:`M${n*.25} ${t/2}l${n*.2} ${n*.2} ${n*.3}-${n*.35}`,stroke:"var(--agd-bar)",strokeWidth:"1.5",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"})]})}function f6({width:e,height:t}){let n=Math.min(e,t)/2-1;return(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,u.jsx)("circle",{cx:e/2,cy:t/2,r:n,stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),(0,u.jsx)("circle",{cx:e/2,cy:t/2,r:n*.45,fill:"var(--agd-bar)"})]})}function h6({width:e,height:t}){let n=Math.max(2,t*.12),l=Math.min(t*.35,10),o=e*.55;return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",alignItems:"center",position:"relative"},children:[(0,u.jsx)("div",{style:{width:"100%",height:n,borderRadius:n/2,background:"var(--agd-fill)",border:"1px solid var(--agd-stroke)",position:"relative"},children:(0,u.jsx)("div",{style:{width:o,height:"100%",borderRadius:n/2,background:"var(--agd-bar)"}})}),(0,u.jsx)("div",{style:{position:"absolute",left:o-l,width:l*2,height:l*2,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:"var(--agd-fill)"}})]})}function m6({width:e,height:t}){let n=Math.min(36,t*.15),l=7,o=4,a=Math.min((e-16)/l,(t-n-40)/(o+1));return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:4},children:[(0,u.jsxs)("div",{style:{height:n,borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 8px",justifyContent:"space-between"},children:[(0,u.jsx)(j,{w:"40%",h:2}),(0,u.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 16 16",fill:"none",children:[(0,u.jsx)("rect",{x:"2",y:"3",width:"12",height:"11",rx:"1",stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,u.jsx)("line",{x1:"2",y1:"6",x2:"14",y2:"6",stroke:"var(--agd-stroke)",strokeWidth:"0.5"})]})]}),(0,u.jsxs)("div",{style:{flex:1,borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",flexDirection:"column"},children:[(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 6px"},children:[(0,u.jsx)("span",{style:{fontSize:7,color:"var(--agd-stroke)"},children:"\u2039"}),(0,u.jsx)(j,{w:e*.25,h:2,strong:!0}),(0,u.jsx)("span",{style:{fontSize:7,color:"var(--agd-stroke)"},children:"\u203A"})]}),(0,u.jsx)("div",{style:{display:"grid",gridTemplateColumns:`repeat(${l}, 1fr)`,gap:1,padding:"0 4px",flex:1},children:Array.from({length:l*o},(i,r)=>(0,u.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:a},children:(0,u.jsx)("div",{style:{width:a*.5,height:a*.5,borderRadius:"50%",background:r===10?"var(--agd-bar)":"transparent"},children:(0,u.jsx)("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,u.jsx)("div",{style:{width:1.5,height:1.5,borderRadius:1,background:"var(--agd-bar-strong)",opacity:r===10?1:.25}})})})},r))})]})]})}function g6({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:t*.08,padding:4},children:[(0,u.jsx)("div",{style:{width:"100%",height:t*.2,borderRadius:4,background:"var(--agd-fill)"}}),(0,u.jsx)("div",{style:{width:"70%",height:Math.max(6,t*.1),borderRadius:3,background:"var(--agd-fill)"}}),(0,u.jsx)("div",{style:{width:"90%",height:Math.max(4,t*.06),borderRadius:3,background:"var(--agd-fill)"}}),(0,u.jsx)("div",{style:{width:"50%",height:Math.max(4,t*.06),borderRadius:3,background:"var(--agd-fill)"}})]})}function y6({width:e,height:t}){return(0,u.jsx)("div",{style:{height:"100%",display:"flex",alignItems:"center",gap:6},children:(0,u.jsxs)("div",{style:{height:"100%",flex:1,borderRadius:t/2,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:`0 ${t*.3}px`,gap:4},children:[(0,u.jsx)(j,{w:"60%",h:2,strong:!0}),(0,u.jsx)("div",{style:{width:Math.max(6,t*.3),height:Math.max(6,t*.3),borderRadius:"50%",border:"1px solid var(--agd-stroke)",flexShrink:0,marginLeft:"auto"}})]})})}function p6({width:e,height:t}){let n=Math.min(e,t);return(0,u.jsx)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:(0,u.jsx)("path",{d:`M${e/2} ${(t-n)/2+n*.1}l${n*.12} ${n*.25} ${n*.28} ${n*.04}-${n*.2} ${n*.2} ${n*.05} ${n*.28}-${n*.25}-${n*.12}-${n*.25} ${n*.12} ${n*.05}-${n*.28}-${n*.2}-${n*.2} ${n*.28}-${n*.04}z`,stroke:"var(--agd-stroke)",strokeWidth:"1",fill:"var(--agd-fill)"})})}function b6({width:e,height:t}){let n=Math.min(e,t)/2-2;return(0,u.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,u.jsx)("circle",{cx:e/2,cy:t/2,r:n,stroke:"var(--agd-stroke)",strokeWidth:"1.5",opacity:".2"}),(0,u.jsx)("path",{d:`M${e/2} ${t/2-n}a${n} ${n} 0 0 1 ${n} ${n}`,stroke:"var(--agd-bar-strong)",strokeWidth:"1.5",strokeLinecap:"round"})]})}function v6({width:e,height:t}){let n=Math.min(36,t*.25,e*.12),l=Math.max(1,Math.min(3,Math.floor(t/80)));return(0,u.jsx)("div",{style:{display:"flex",flexDirection:"column",height:"100%",justifyContent:"space-around",padding:8},children:Array.from({length:l},(o,a)=>(0,u.jsxs)("div",{style:{display:"flex",gap:e*.04,alignItems:"flex-start"},children:[(0,u.jsx)(wt,{w:n,h:n,radius:n*.25}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[(0,u.jsx)(j,{w:`${40+a*13%20}%`,h:3,strong:!0}),(0,u.jsx)(j,{w:`${60+a*17%25}%`,h:2})]})]},a))})}function x6({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/120))),l=Math.min(36,t*.25);return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:t*.06,padding:t*.06},children:[(0,u.jsx)(j,{w:e*.3,h:4,strong:!0}),(0,u.jsx)("div",{style:{display:"flex",gap:e*.06,justifyContent:"center",flex:1,alignItems:"center"},children:Array.from({length:n},(o,a)=>(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:6},children:[(0,u.jsx)(Hn,{size:l}),(0,u.jsx)(j,{w:e*.12,h:3,strong:!0}),(0,u.jsx)(j,{w:e*.08,h:2})]},a))})]})}function w6({width:e,height:t}){let n=Math.max(2,Math.min(3,Math.floor(t/80)));return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:e*.06,gap:t*.04},children:[(0,u.jsx)(j,{w:e*.5,h:Math.max(5,t*.04),strong:!0}),(0,u.jsx)(j,{w:e*.35,h:2}),(0,u.jsx)("div",{style:{width:"100%",display:"flex",flexDirection:"column",gap:t*.03,marginTop:t*.04},children:Array.from({length:n},(l,o)=>(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:Math.min(60,e*.2),h:2}),(0,u.jsx)(wt,{w:"100%",h:Math.min(32,t*.1),radius:4})]},o))}),(0,u.jsx)(wt,{w:"100%",h:Math.min(36,t*.12),radius:6,style:{marginTop:t*.03,background:"var(--agd-bar)"}}),(0,u.jsx)(j,{w:e*.4,h:2})]})}function S6({width:e,height:t}){return(0,u.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",padding:e*.04,gap:t*.03},children:[(0,u.jsx)(j,{w:e*.4,h:4,strong:!0}),(0,u.jsx)(j,{w:e*.6,h:2}),(0,u.jsxs)("div",{style:{display:"flex",gap:6,marginTop:t*.03},children:[(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:50,h:2}),(0,u.jsx)(wt,{w:"100%",h:Math.min(28,t*.1),radius:4})]}),(0,u.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:40,h:2}),(0,u.jsx)(wt,{w:"100%",h:Math.min(28,t*.1),radius:4})]})]}),(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[(0,u.jsx)(j,{w:50,h:2}),(0,u.jsx)(wt,{w:"100%",h:Math.min(28,t*.1),radius:4})]}),(0,u.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3,flex:1},children:[(0,u.jsx)(j,{w:60,h:2}),(0,u.jsx)(wt,{w:"100%",h:"100%",radius:4})]}),(0,u.jsx)(wt,{w:Math.min(120,e*.3),h:Math.min(30,t*.1),radius:6,style:{alignSelf:"flex-end",background:"var(--agd-bar)"}})]})}var k6={navigation:_3,hero:f3,sidebar:h3,footer:m3,modal:g3,card:y3,text:p3,image:b3,table:v3,list:x3,button:w3,input:S3,form:k3,tabs:C3,avatar:M3,badge:E3,header:T3,section:N3,grid:R3,dropdown:A3,toggle:D3,search:z3,toast:O3,progress:L3,chart:B3,video:H3,tooltip:$3,breadcrumb:U3,pagination:Y3,divider:j3,accordion:I3,carousel:X3,pricing:q3,testimonial:Q3,cta:G3,alert:V3,banner:W3,stat:F3,stepper:Z3,tag:K3,rating:J3,map:P3,timeline:e6,fileUpload:t6,codeBlock:n6,calendar:l6,notification:o6,productCard:a6,profile:i6,drawer:r6,popover:s6,logo:c6,faq:u6,gallery:d6,checkbox:_6,radio:f6,slider:h6,datePicker:m6,skeleton:g6,chip:y6,icon:p6,spinner:b6,feature:v6,team:x6,login:w6,contact:S6};function C6({type:e,width:t,height:n,text:l}){let o=k6[e];return o?(0,u.jsx)("div",{style:{width:"100%",height:"100%",padding:8,position:"relative",pointerEvents:"none"},children:(0,u.jsx)(o,{width:t,height:n,text:l})}):(0,u.jsx)("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,u.jsx)("span",{style:{fontSize:10,fontWeight:600,color:"var(--agd-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",opacity:.5},children:e})})}var M6=`.styles-module__overlay___aWh-q svg[fill=none],
.styles-module__rearrangeOverlay___-3R3t svg[fill=none] {
  fill: none !important;
}
.styles-module__overlay___aWh-q svg[fill=none] :not([fill]),
.styles-module__rearrangeOverlay___-3R3t svg[fill=none] :not([fill]) {
  fill: none !important;
}

.styles-module__overlayExiting___iEmYr {
  opacity: 0 !important;
  transition: opacity 0.25s ease !important;
  pointer-events: none !important;
}

.styles-module__overlay___aWh-q {
  position: fixed;
  inset: 0;
  z-index: 99995;
  pointer-events: auto;
  cursor: default;
  animation: styles-module__overlayFadeIn___aECVy 0.15s ease;
  --agd-stroke: rgba(59, 130, 246, 0.35);
  --agd-fill: rgba(59, 130, 246, 0.06);
  --agd-bar: rgba(59, 130, 246, 0.18);
  --agd-bar-strong: rgba(59, 130, 246, 0.28);
  --agd-text-3: rgba(255, 255, 255, 0.6);
  --agd-surface: #fff;
}
.styles-module__overlay___aWh-q.styles-module__light___ORIft {
  --agd-surface: #fff;
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) {
  --agd-surface: #141414;
}
.styles-module__overlay___aWh-q.styles-module__wireframe___itvQU {
  --agd-stroke: rgba(249, 115, 22, 0.35);
  --agd-fill: rgba(249, 115, 22, 0.06);
  --agd-bar: rgba(249, 115, 22, 0.18);
  --agd-bar-strong: rgba(249, 115, 22, 0.28);
}
.styles-module__overlay___aWh-q.styles-module__placing___45yD8 {
  cursor: crosshair;
}
.styles-module__overlay___aWh-q.styles-module__passthrough___xaFeE {
  pointer-events: none;
}

.styles-module__blankCanvas___t2Eue {
  position: fixed;
  inset: 0;
  z-index: 99994;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.styles-module__blankCanvas___t2Eue.styles-module__visible___OKKqX {
  opacity: var(--canvas-opacity, 1);
  pointer-events: auto;
}
.styles-module__blankCanvas___t2Eue::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 12px 12px;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.styles-module__blankCanvas___t2Eue.styles-module__gridActive___OZ-cf::after {
  opacity: 1;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.22) 1px, transparent 1px);
}

.styles-module__paletteHeader___-Q5gQ {
  padding: 0 1rem 0.375rem;
}

.styles-module__paletteHeaderTitle___oHqZC {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.0094em;
}
.styles-module__light___ORIft .styles-module__paletteHeaderTitle___oHqZC {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__paletteHeaderDesc___6i74T {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
  line-height: 14px;
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T {
  color: rgba(0, 0, 0, 0.45);
}
.styles-module__paletteHeaderDesc___6i74T a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__paletteHeaderDesc___6i74T a:hover {
  color: #fff;
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T a {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T a:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__wireframePurposeWrap___To-tS {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.2s ease, opacity 0.15s ease;
  opacity: 1;
}
.styles-module__wireframePurposeWrap___To-tS.styles-module__collapsed___Ms9vS {
  grid-template-rows: 0fr;
  opacity: 0;
}

.styles-module__wireframePurposeInner___Lrahs {
  overflow: hidden;
}

.styles-module__wireframePurposeInput___7EtBN {
  display: block;
  width: calc(100% - 2rem);
  margin: 0.25rem 1rem 0.375rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__wireframePurposeInput___7EtBN::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__wireframePurposeInput___7EtBN:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.1);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__canvasToggle___-QqSy {
  width: calc(100% - 2rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin: 0.25rem 1rem 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.styles-module__canvasToggle___-QqSy:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
}
.styles-module__canvasToggle___-QqSy.styles-module__active___hosp7 {
  background: #f97316;
  border-color: transparent;
  border-style: solid;
  box-shadow: none;
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy {
  border-color: rgba(0, 0, 0, 0.08);
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.12);
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy.styles-module__active___hosp7 {
  background: #f97316;
  border-color: transparent;
  border-style: solid;
  box-shadow: none;
}

.styles-module__canvasToggleIcon___7pJ82 {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35);
}
.styles-module__active___hosp7 .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(255, 255, 255, 0.85);
}
.styles-module__light___ORIft .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(0, 0, 0, 0.25);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__canvasToggleLabel___OanpY {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: -0.0094em;
}
.styles-module__active___hosp7 .styles-module__canvasToggleLabel___OanpY {
  color: #fff;
}
.styles-module__light___ORIft .styles-module__canvasToggleLabel___OanpY {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__canvasToggleLabel___OanpY {
  color: #fff;
}

.styles-module__placement___zcxv8 {
  position: absolute;
  border: 1.5px dashed rgba(59, 130, 246, 0.4);
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.08);
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s, opacity 0.15s ease, transform 0.15s ease;
  -webkit-user-select: none;
  user-select: none;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  animation: styles-module__placementEnter___TdRhf 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.styles-module__placement___zcxv8:active {
  cursor: grabbing;
}
.styles-module__placement___zcxv8:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
}
.styles-module__placement___zcxv8.styles-module__selected___6yrp6 {
  border-color: #3c82f7;
  border-style: solid;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__placement___zcxv8.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8 {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.08);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8:hover {
  border-color: rgba(249, 115, 22, 0.5);
  background: rgba(249, 115, 22, 0.1);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.12);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8.styles-module__selected___6yrp6 {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.1);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15), 0 2px 8px rgba(249, 115, 22, 0.15);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15), 0 2px 8px rgba(249, 115, 22, 0.15);
}
.styles-module__placement___zcxv8.styles-module__dragging___le6KZ {
  opacity: 0.85;
  z-index: 50;
}
.styles-module__placement___zcxv8.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__placementContent___f64A4 {
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.styles-module__placementLabel___0KvWl {
  position: absolute;
  top: -18px;
  left: 0;
  font-size: 10px;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.7);
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.5);
}
.styles-module__selected___6yrp6 .styles-module__placementLabel___0KvWl {
  color: #3c82f7;
}
.styles-module__wireframe___itvQU .styles-module__placementLabel___0KvWl {
  color: rgba(249, 115, 22, 0.7);
}
.styles-module__wireframe___itvQU .styles-module__selected___6yrp6 .styles-module__placementLabel___0KvWl {
  color: #f97316;
}

.styles-module__placementAnnotation___78pTr {
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  font-weight: 450;
  color: rgba(0, 0, 0, 0.5);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.styles-module__placementAnnotation___78pTr.styles-module__annotationVisible___mrUyA {
  opacity: 1;
  transform: translateY(0);
}

.styles-module__sectionAnnotation___aUIs0 {
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  font-weight: 450;
  color: rgba(59, 130, 246, 0.6);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.styles-module__sectionAnnotation___aUIs0.styles-module__annotationVisible___mrUyA {
  opacity: 1;
  transform: translateY(0);
}

.styles-module__handle___Ikbxm {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 1.5px solid #3c82f7;
  border-radius: 2px;
  z-index: 12;
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transform: scale(0.3);
  pointer-events: none;
  will-change: opacity, transform;
  transition: opacity 0.2s ease-out, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.styles-module__placement___zcxv8:hover .styles-module__handle___Ikbxm, .styles-module__sectionOutline___s0hy-:hover .styles-module__handle___Ikbxm, .styles-module__ghostOutline___po-kO:hover .styles-module__handle___Ikbxm, .styles-module__placement___zcxv8:active .styles-module__handle___Ikbxm, .styles-module__sectionOutline___s0hy-:active .styles-module__handle___Ikbxm, .styles-module__ghostOutline___po-kO:active .styles-module__handle___Ikbxm, .styles-module__selected___6yrp6 .styles-module__handle___Ikbxm {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.styles-module__sectionOutline___s0hy- .styles-module__handle___Ikbxm {
  border-color: inherit;
}
.styles-module__wireframe___itvQU .styles-module__handle___Ikbxm {
  border-color: #f97316;
}

.styles-module__handleNw___4TMIj {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.styles-module__handleNe___mnsTh {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.styles-module__handleSe___oSFnk {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.styles-module__handleSw___pi--Z {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.styles-module__handleN___aBA-Q,
.styles-module__handleE___0hM5u,
.styles-module__handleS___JjDRv,
.styles-module__handleW___ERWGQ {
  opacity: 0 !important;
  pointer-events: none !important;
}

.styles-module__edgeHandle___XxXdT {
  position: absolute;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
}
.styles-module__edgeHandle___XxXdT::after {
  content: "";
  position: absolute;
  border-radius: 4px;
  background: #3c82f7;
}
.styles-module__wireframe___itvQU .styles-module__edgeHandle___XxXdT::after {
  background: #f97316;
}
.styles-module__edgeHandle___XxXdT::after {
  opacity: 0;
  transition: opacity 0.1s ease, transform 0.1s ease;
  transform: scale(0.8);
}
.styles-module__edgeHandle___XxXdT:hover::after {
  opacity: 0.85;
  transform: scale(1);
}
.styles-module__edgeHandle___XxXdT svg {
  position: relative;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.1s ease;
  filter: drop-shadow(0 0 2px var(--agd-surface));
}
.styles-module__edgeHandle___XxXdT:hover svg {
  opacity: 1;
}

.styles-module__edgeN___-JJDj,
.styles-module__edgeS___66lMX {
  left: 12px;
  right: 12px;
  height: 12px;
  cursor: n-resize;
}
.styles-module__edgeN___-JJDj::after,
.styles-module__edgeS___66lMX::after {
  width: 24px;
  height: 4px;
}

.styles-module__edgeN___-JJDj {
  top: -6px;
}

.styles-module__edgeS___66lMX {
  bottom: -6px;
  cursor: s-resize;
}

.styles-module__edgeE___1bGDa,
.styles-module__edgeW___lHQNo {
  top: 12px;
  bottom: 12px;
  width: 12px;
  cursor: e-resize;
}
.styles-module__edgeE___1bGDa::after,
.styles-module__edgeW___lHQNo::after {
  width: 4px;
  height: 24px;
}

.styles-module__edgeE___1bGDa {
  right: -6px;
}

.styles-module__edgeW___lHQNo {
  left: -6px;
  cursor: w-resize;
}

.styles-module__deleteButton___LkGCb {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.8);
  will-change: opacity, transform;
  transition: opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.12s ease, color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}
.styles-module__placement___zcxv8:hover .styles-module__deleteButton___LkGCb, .styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb, .styles-module__sectionOutline___s0hy-:hover .styles-module__deleteButton___LkGCb, .styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb, .styles-module__ghostOutline___po-kO:hover .styles-module__deleteButton___LkGCb, .styles-module__ghostOutline___po-kO.styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.styles-module__deleteButton___LkGCb:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb, .styles-module__rearrangeOverlay___-3R3t:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb {
  background: rgba(40, 40, 40, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb:hover, .styles-module__rearrangeOverlay___-3R3t:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.styles-module__drawBox___BrVAa {
  position: fixed;
  pointer-events: none;
  z-index: 99996;
  border: 2px solid #3c82f7;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.15);
}

.styles-module__selectBox___Iu8kB {
  position: fixed;
  pointer-events: none;
  z-index: 99996;
  border: 1px dashed #3c82f7;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 2px;
}

.styles-module__sizeIndicator___7zJ4y {
  position: fixed;
  pointer-events: none;
  z-index: 100001;
  font-size: 10px;
  color: #fff;
  background: #3c82f7;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.styles-module__guideLine___DUQY2 {
  pointer-events: none;
  z-index: 100001;
  background: #f0f;
  opacity: 0.5;
}

.styles-module__dragPreview___onPbU {
  position: fixed;
  z-index: 100002;
  pointer-events: none;
  border: 1.5px dashed #3c82f7;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: #3c82f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  transition: width 0.08s ease, height 0.08s ease, opacity 0.08s ease;
}

.styles-module__dragPreviewWireframe___jsg0G {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.15);
}

.styles-module__palette___C7iSH {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  width: 256px;
  overflow: hidden;
  background: #1c1c1c;
  border: none;
  border-radius: 1rem;
  padding: 13px 0 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  z-index: 100001;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: default;
  opacity: 0;
  filter: blur(5px);
}
.styles-module__palette___C7iSH .styles-module__paletteItem___6TlnA,
.styles-module__palette___C7iSH .styles-module__paletteItemLabel___6ncO4,
.styles-module__palette___C7iSH .styles-module__paletteSectionTitle___PqnjX,
.styles-module__palette___C7iSH .styles-module__paletteFooter___QYnAG {
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__palette___C7iSH {
  opacity: 0;
  transform: translateY(var(--panel-offset-y, 4px)) scale(0.98);
  transform-origin: var(--panel-origin, bottom right);
  filter: blur(2px);
  pointer-events: none;
  visibility: hidden;
  transition: opacity 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.styles-module__palette___C7iSH[data-panel-present=true] {
  visibility: visible;
}
.styles-module__palette___C7iSH[data-panel-open=true] {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  pointer-events: auto;
  transition-duration: 160ms;
}
@media (prefers-reduced-motion: reduce) {
  .styles-module__palette___C7iSH {
    transition: none;
    transform: none;
    filter: none;
  }
}
.styles-module__palette___C7iSH.styles-module__light___ORIft {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.styles-module__paletteSection___V8DEA {
  padding: 0 1rem;
}
.styles-module__paletteSection___V8DEA + .styles-module__paletteSection___V8DEA {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__light___ORIft .styles-module__paletteSection___V8DEA + .styles-module__paletteSection___V8DEA {
  border-top-color: rgba(0, 0, 0, 0.07);
}

.styles-module__paletteSectionTitle___PqnjX {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  padding: 0 0 3px 3px;
}
.styles-module__light___ORIft .styles-module__paletteSectionTitle___PqnjX {
  color: rgba(0, 0, 0, 0.4);
}

.styles-module__paletteItem___6TlnA {
  width: 100%;
  text-align: left;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.25rem;
  margin-bottom: 1px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  border: 1px solid transparent;
  -webkit-user-select: none;
  user-select: none;
  min-height: 24px;
}
.styles-module__paletteItem___6TlnA:hover {
  background: rgba(255, 255, 255, 0.1);
}
.styles-module__paletteItem___6TlnA.styles-module__active___hosp7 {
  background: #3c82f7;
  border-color: transparent;
}
.styles-module__paletteItem___6TlnA.styles-module__wireframe___itvQU.styles-module__active___hosp7 {
  background: #f97316;
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA:hover {
  background: rgba(0, 0, 0, 0.05);
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA.styles-module__active___hosp7 {
  background: #3c82f7;
  border-color: transparent;
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA.styles-module__wireframe___itvQU.styles-module__active___hosp7 {
  background: #f97316;
}

.styles-module__paletteItemIcon___0NPQK {
  width: 20px;
  height: 16px;
  border-radius: 2px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.45);
}
.styles-module__paletteItemIcon___0NPQK svg {
  display: block;
  width: 20px;
  height: 16px;
}
.styles-module__active___hosp7 .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.styles-module__light___ORIft .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.styles-module__paletteItemLabel___6ncO4 {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: -0.0094em;
  line-height: 1;
  min-width: 0;
}
.styles-module__active___hosp7 .styles-module__paletteItemLabel___6ncO4 {
  color: #fff;
  font-weight: 600;
}
.styles-module__light___ORIft .styles-module__paletteItemLabel___6ncO4 {
  color: rgba(0, 0, 0, 0.7);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__paletteItemLabel___6ncO4 {
  color: #fff;
  font-weight: 600;
}

.styles-module__placeScroll___7sClM {
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 0.25rem;
}
.styles-module__placeScroll___7sClM.styles-module__fadeTop___KT9tF {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 32px);
  mask-image: linear-gradient(to bottom, transparent 0, black 32px);
}
.styles-module__placeScroll___7sClM.styles-module__fadeBottom___x3ShT {
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 32px), transparent 100%);
  mask-image: linear-gradient(to bottom, black calc(100% - 32px), transparent 100%);
}
.styles-module__placeScroll___7sClM.styles-module__fadeTop___KT9tF.styles-module__fadeBottom___x3ShT {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
}
.styles-module__placeScroll___7sClM::-webkit-scrollbar {
  width: 3px;
}
.styles-module__placeScroll___7sClM::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}
.styles-module__light___ORIft .styles-module__placeScroll___7sClM::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

.styles-module__paletteFooterWrap___71-fI {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__paletteFooterWrap___71-fI.styles-module__footerHidden___fJUik {
  grid-template-rows: 0fr;
}

.styles-module__paletteFooterInnerContent___VC26h {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.styles-module__footerHidden___fJUik .styles-module__paletteFooterInnerContent___VC26h {
  opacity: 0;
  transform: translateY(4px);
}

.styles-module__paletteFooterInner___dfylY {
  overflow: hidden;
}

.styles-module__paletteFooter___QYnAG {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  padding: 0 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__light___ORIft .styles-module__paletteFooter___QYnAG {
  border-top-color: rgba(0, 0, 0, 0.07);
}

.styles-module__paletteFooterCount___D3Fia {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__light___ORIft .styles-module__paletteFooterCount___D3Fia {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__paletteFooterClear___ybBoa {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s ease;
}
.styles-module__paletteFooterClear___ybBoa:hover {
  color: rgba(255, 255, 255, 0.7);
}
.styles-module__light___ORIft .styles-module__paletteFooterClear___ybBoa {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___ORIft .styles-module__paletteFooterClear___ybBoa:hover {
  color: rgba(0, 0, 0, 0.6);
}

.styles-module__paletteFooterActions___fLzv8 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.styles-module__rollingWrap___S75jM {
  display: inline-block;
  overflow: hidden;
  height: 1.15em;
  position: relative;
  vertical-align: bottom;
}

.styles-module__rollingNum___1RKDx {
  position: absolute;
  left: 0;
  top: 0;
}

.styles-module__exitUp___AFDRW {
  animation: styles-module__numExitUp___FRQqx 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__enterUp___CPlXb {
  animation: styles-module__numEnterUp___2Yd-w 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__exitDown___-1yAy {
  animation: styles-module__numExitDown___xm5by 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__enterDown___DDuFR {
  animation: styles-module__numEnterDown___hpxBk 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

@keyframes styles-module__numExitUp___FRQqx {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-110%);
    opacity: 0;
  }
}
@keyframes styles-module__numEnterUp___2Yd-w {
  from {
    transform: translateY(110%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes styles-module__numExitDown___xm5by {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(110%);
    opacity: 0;
  }
}
@keyframes styles-module__numEnterDown___hpxBk {
  from {
    transform: translateY(-110%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.styles-module__rearrangeOverlay___-3R3t {
  position: fixed;
  inset: 0;
  z-index: 99995;
  pointer-events: none;
  cursor: default;
  -webkit-user-select: none;
  user-select: none;
  animation: styles-module__overlayFadeIn___aECVy 0.15s ease;
}

.styles-module__hoverHighlight___8eT-v {
  position: fixed;
  pointer-events: none;
  z-index: 99994;
  border: 2px dashed rgba(59, 130, 246, 0.5);
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.06);
  animation: styles-module__highlightFadeIn___Lg7KY 0.12s ease;
}

.styles-module__sectionOutline___s0hy- {
  position: fixed;
  border: 2px solid;
  border-radius: 4px;
  cursor: grab;
}
.styles-module__sectionOutline___s0hy-:active {
  cursor: grabbing;
}
.styles-module__sectionOutline___s0hy- {
  transition: box-shadow 0.15s, border-color 0.3s, background-color 0.3s, border-style 0s;
  -webkit-user-select: none;
  user-select: none;
  pointer-events: auto;
  animation: styles-module__sectionEnter___-8BXT 0.2s ease;
}
.styles-module__sectionOutline___s0hy-:hover {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6 {
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) {
  border: 1.5px dashed rgba(150, 150, 150, 0.35);
  background-color: transparent !important;
  box-shadow: none;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover {
  border-color: rgba(150, 150, 150, 0.6);
  box-shadow: none;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__sectionLabel___F80HQ {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover .styles-module__sectionLabel___F80HQ {
  opacity: 1;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__movedBadge___s8z-q,
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__sectionDimensions___RcJSL {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover .styles-module__sectionDimensions___RcJSL {
  opacity: 1;
}
.styles-module__sectionOutline___s0hy-.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__sectionLabel___F80HQ {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  max-width: calc(100% - 8px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__movedBadge___s8z-q {
  position: absolute;
  bottom: 22px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  background: #22c55e;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.styles-module__movedBadge___s8z-q.styles-module__badgeVisible___npbdS {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.2s cubic-bezier(0.34, 1.2, 0.64, 1), transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.styles-module__resizedBadge___u51V8 {
  background: #3c82f7;
  bottom: 40px;
}

.styles-module__sectionDimensions___RcJSL {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.styles-module__light___ORIft .styles-module__sectionDimensions___RcJSL {
  color: rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.7);
}

.styles-module__wireframeNotice___4GJyB {
  position: fixed;
  bottom: 16px;
  left: 24px;
  z-index: 99995;
  font-size: 9.5px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.4);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  pointer-events: auto;
  animation: styles-module__overlayFadeIn___aECVy 0.3s ease;
  line-height: 1.5;
  max-width: 280px;
}

.styles-module__wireframeOpacityRow___CJXzi {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.styles-module__wireframeOpacityLabel___afkfT {
  font-size: 9px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.32);
  letter-spacing: 0.02em;
  white-space: nowrap;
  -webkit-user-select: none;
  user-select: none;
}

.styles-module__wireframeOpacitySlider___YcoEs {
  -webkit-appearance: none;
  appearance: none;
  width: 56px;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.styles-module__wireframeOpacitySlider___YcoEs:hover {
  background: rgba(0, 0, 0, 0.13);
}
.styles-module__wireframeOpacitySlider___YcoEs::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f97316;
  cursor: pointer;
  transition: background 0.15s ease;
}
.styles-module__wireframeOpacitySlider___YcoEs::-webkit-slider-thumb:hover {
  background: rgb(88.0082041185%, 37.39404381%, 2.2663056855%);
}
.styles-module__wireframeOpacitySlider___YcoEs::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f97316;
  border: none;
  cursor: pointer;
}
.styles-module__wireframeOpacitySlider___YcoEs::-moz-range-track {
  background: rgba(0, 0, 0, 0.08);
  height: 4px;
  border-radius: 2px;
}

.styles-module__wireframeNoticeTitleRow___PJqyG {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 2px;
}

.styles-module__wireframeNoticeTitle___okr08 {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
}

.styles-module__wireframeNoticeDivider___PNKQ6 {
  width: 1px;
  height: 8px;
  background: rgba(0, 0, 0, 0.12);
  margin: 0 8px;
  flex-shrink: 0;
}

.styles-module__wireframeStartOver___YFk-I {
  font-size: 9.5px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  text-decoration: none;
  transition: color 0.12s ease;
  white-space: nowrap;
}
.styles-module__wireframeStartOver___YFk-I:hover {
  color: rgba(0, 0, 0, 0.6);
}

.styles-module__ghostOutline___po-kO {
  position: fixed;
  border: 1.5px dashed rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.04);
  cursor: grab;
  opacity: 0.5;
  -webkit-user-select: none;
  user-select: none;
  pointer-events: auto;
  animation: styles-module__ghostEnter___EC3Mb 0.25s ease;
  transition: box-shadow 0.15s, border-color 0.3s, opacity 0.25s;
}
.styles-module__ghostOutline___po-kO:active {
  cursor: grabbing;
}
.styles-module__ghostOutline___po-kO:hover {
  opacity: 0.7;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
}
.styles-module__ghostOutline___po-kO.styles-module__selected___6yrp6 {
  opacity: 1;
  border-style: solid;
  border-width: 2px;
  border-color: #3c82f7;
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__ghostOutline___po-kO.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__ghostBadge___tsQUK {
  position: absolute;
  bottom: calc(100% + 4px);
  left: -1px;
  font-size: 9px;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.9);
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: 0.02em;
  line-height: 1.2;
  animation: styles-module__badgeSlideIn___typJ7 0.2s ease both;
}

@keyframes styles-module__badgeSlideIn___typJ7 {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.styles-module__ghostBadgeExtra___6CVoD {
  display: inline;
  animation: styles-module__badgeExtraIn___i4W8F 0.2s ease both;
}

@keyframes styles-module__badgeExtraIn___i4W8F {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.styles-module__originalOutline___Y6DD1 {
  position: fixed;
  border: 1.5px dashed rgba(150, 150, 150, 0.3);
  border-radius: 4px;
  background: transparent;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
  animation: styles-module__sectionEnter___-8BXT 0.2s ease;
}

.styles-module__originalLabel___HqI9g {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 9px;
  font-weight: 500;
  color: rgba(150, 150, 150, 0.5);
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: rgba(150, 150, 150, 0.08);
}

.styles-module__connectorSvg___Lovld {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99996;
}

.styles-module__connectorLine___XeWh- {
  transition: opacity 0.2s ease;
  animation: styles-module__connectorDraw___8sK5I 0.3s ease both;
}

.styles-module__connectorDot___yvf7C {
  transform-box: fill-box;
  transform-origin: center;
  animation: styles-module__connectorDotIn___NwTUq 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

@keyframes styles-module__connectorDraw___8sK5I {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__connectorDotIn___NwTUq {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.styles-module__connectorExiting___2lLOs {
  animation: styles-module__connectorOut___5QoPl 0.2s ease forwards;
}
.styles-module__connectorExiting___2lLOs .styles-module__connectorDot___yvf7C {
  animation: styles-module__connectorDotOut___FEq7e 0.2s ease forwards;
}

@keyframes styles-module__connectorOut___5QoPl {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes styles-module__connectorDotOut___FEq7e {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
}
@keyframes styles-module__placementEnter___TdRhf {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__sectionEnter___-8BXT {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__highlightFadeIn___Lg7KY {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__overlayFadeIn___aECVy {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__ghostEnter___EC3Mb {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 0.6;
    transform: scale(1);
  }
}
.styles-module__canvasToggle___-QqSy:focus-visible,
.styles-module__paletteItem___6TlnA:focus-visible {
  outline: 2px solid var(--agentation-color-accent);
  outline-offset: -2px;
}`,B={overlay:"styles-module__overlay___aWh-q",rearrangeOverlay:"styles-module__rearrangeOverlay___-3R3t",overlayExiting:"styles-module__overlayExiting___iEmYr",overlayFadeIn:"styles-module__overlayFadeIn___aECVy",light:"styles-module__light___ORIft",wireframe:"styles-module__wireframe___itvQU",placing:"styles-module__placing___45yD8",passthrough:"styles-module__passthrough___xaFeE",blankCanvas:"styles-module__blankCanvas___t2Eue",visible:"styles-module__visible___OKKqX",gridActive:"styles-module__gridActive___OZ-cf",paletteHeader:"styles-module__paletteHeader___-Q5gQ",paletteHeaderTitle:"styles-module__paletteHeaderTitle___oHqZC",paletteHeaderDesc:"styles-module__paletteHeaderDesc___6i74T",wireframePurposeWrap:"styles-module__wireframePurposeWrap___To-tS",collapsed:"styles-module__collapsed___Ms9vS",wireframePurposeInner:"styles-module__wireframePurposeInner___Lrahs",wireframePurposeInput:"styles-module__wireframePurposeInput___7EtBN",canvasToggle:"styles-module__canvasToggle___-QqSy",active:"styles-module__active___hosp7",canvasToggleIcon:"styles-module__canvasToggleIcon___7pJ82",canvasToggleLabel:"styles-module__canvasToggleLabel___OanpY",placement:"styles-module__placement___zcxv8",placementEnter:"styles-module__placementEnter___TdRhf",selected:"styles-module__selected___6yrp6",dragging:"styles-module__dragging___le6KZ",exiting:"styles-module__exiting___YrM8F",placementContent:"styles-module__placementContent___f64A4",placementLabel:"styles-module__placementLabel___0KvWl",placementAnnotation:"styles-module__placementAnnotation___78pTr",annotationVisible:"styles-module__annotationVisible___mrUyA",sectionAnnotation:"styles-module__sectionAnnotation___aUIs0",handle:"styles-module__handle___Ikbxm",sectionOutline:"styles-module__sectionOutline___s0hy-",ghostOutline:"styles-module__ghostOutline___po-kO",handleNw:"styles-module__handleNw___4TMIj",handleNe:"styles-module__handleNe___mnsTh",handleSe:"styles-module__handleSe___oSFnk",handleSw:"styles-module__handleSw___pi--Z",handleN:"styles-module__handleN___aBA-Q",handleE:"styles-module__handleE___0hM5u",handleS:"styles-module__handleS___JjDRv",handleW:"styles-module__handleW___ERWGQ",edgeHandle:"styles-module__edgeHandle___XxXdT",edgeN:"styles-module__edgeN___-JJDj",edgeS:"styles-module__edgeS___66lMX",edgeE:"styles-module__edgeE___1bGDa",edgeW:"styles-module__edgeW___lHQNo",deleteButton:"styles-module__deleteButton___LkGCb",drawBox:"styles-module__drawBox___BrVAa",selectBox:"styles-module__selectBox___Iu8kB",sizeIndicator:"styles-module__sizeIndicator___7zJ4y",guideLine:"styles-module__guideLine___DUQY2",dragPreview:"styles-module__dragPreview___onPbU",dragPreviewWireframe:"styles-module__dragPreviewWireframe___jsg0G",palette:"styles-module__palette___C7iSH",paletteItem:"styles-module__paletteItem___6TlnA",paletteItemLabel:"styles-module__paletteItemLabel___6ncO4",paletteSectionTitle:"styles-module__paletteSectionTitle___PqnjX",paletteFooter:"styles-module__paletteFooter___QYnAG",paletteSection:"styles-module__paletteSection___V8DEA",paletteItemIcon:"styles-module__paletteItemIcon___0NPQK",placeScroll:"styles-module__placeScroll___7sClM",fadeTop:"styles-module__fadeTop___KT9tF",fadeBottom:"styles-module__fadeBottom___x3ShT",paletteFooterWrap:"styles-module__paletteFooterWrap___71-fI",footerHidden:"styles-module__footerHidden___fJUik",paletteFooterInnerContent:"styles-module__paletteFooterInnerContent___VC26h",paletteFooterInner:"styles-module__paletteFooterInner___dfylY",paletteFooterCount:"styles-module__paletteFooterCount___D3Fia",paletteFooterClear:"styles-module__paletteFooterClear___ybBoa",paletteFooterActions:"styles-module__paletteFooterActions___fLzv8",rollingWrap:"styles-module__rollingWrap___S75jM",rollingNum:"styles-module__rollingNum___1RKDx",exitUp:"styles-module__exitUp___AFDRW",numExitUp:"styles-module__numExitUp___FRQqx",enterUp:"styles-module__enterUp___CPlXb",numEnterUp:"styles-module__numEnterUp___2Yd-w",exitDown:"styles-module__exitDown___-1yAy",numExitDown:"styles-module__numExitDown___xm5by",enterDown:"styles-module__enterDown___DDuFR",numEnterDown:"styles-module__numEnterDown___hpxBk",hoverHighlight:"styles-module__hoverHighlight___8eT-v",highlightFadeIn:"styles-module__highlightFadeIn___Lg7KY",sectionEnter:"styles-module__sectionEnter___-8BXT",settled:"styles-module__settled___b5U5o",sectionLabel:"styles-module__sectionLabel___F80HQ",movedBadge:"styles-module__movedBadge___s8z-q",sectionDimensions:"styles-module__sectionDimensions___RcJSL",badgeVisible:"styles-module__badgeVisible___npbdS",resizedBadge:"styles-module__resizedBadge___u51V8",wireframeNotice:"styles-module__wireframeNotice___4GJyB",wireframeOpacityRow:"styles-module__wireframeOpacityRow___CJXzi",wireframeOpacityLabel:"styles-module__wireframeOpacityLabel___afkfT",wireframeOpacitySlider:"styles-module__wireframeOpacitySlider___YcoEs",wireframeNoticeTitleRow:"styles-module__wireframeNoticeTitleRow___PJqyG",wireframeNoticeTitle:"styles-module__wireframeNoticeTitle___okr08",wireframeNoticeDivider:"styles-module__wireframeNoticeDivider___PNKQ6",wireframeStartOver:"styles-module__wireframeStartOver___YFk-I",ghostEnter:"styles-module__ghostEnter___EC3Mb",ghostBadge:"styles-module__ghostBadge___tsQUK",badgeSlideIn:"styles-module__badgeSlideIn___typJ7",ghostBadgeExtra:"styles-module__ghostBadgeExtra___6CVoD",badgeExtraIn:"styles-module__badgeExtraIn___i4W8F",originalOutline:"styles-module__originalOutline___Y6DD1",originalLabel:"styles-module__originalLabel___HqI9g",connectorSvg:"styles-module__connectorSvg___Lovld",connectorLine:"styles-module__connectorLine___XeWh-",connectorDraw:"styles-module__connectorDraw___8sK5I",connectorDot:"styles-module__connectorDot___yvf7C",connectorDotIn:"styles-module__connectorDotIn___NwTUq",connectorExiting:"styles-module__connectorExiting___2lLOs",connectorOut:"styles-module__connectorOut___5QoPl",connectorDotOut:"styles-module__connectorDotOut___FEq7e"},xr=24,vd=5;function f2(e,t,n,l,o){let a=1/0,i=1/0,r=e.x,s=e.x+e.width,d=e.x+e.width/2,f=e.y,h=e.y+e.height,_=e.y+e.height/2,b=!l,w=b?[r,s,d]:[...l.left?[r]:[],...l.right?[s]:[]],N=b?[f,h,_]:[...l.top?[f]:[],...l.bottom?[h]:[]],M=[];for(let re of t)n.has(re.id)||M.push(re);o&&M.push(...o);for(let re of M){let K=re.x,_e=re.x+re.width,oe=re.x+re.width/2,se=re.y,he=re.y+re.height,Ht=re.y+re.height/2;for(let Ye of w)for(let tt of[K,_e,oe]){let je=tt-Ye;Math.abs(je)<vd&&Math.abs(je)<Math.abs(a)&&(a=je)}for(let Ye of N)for(let tt of[se,he,Ht]){let je=tt-Ye;Math.abs(je)<vd&&Math.abs(je)<Math.abs(i)&&(i=je)}}let y=Math.abs(a)<vd?a:0,x=Math.abs(i)<vd?i:0,g=[],k=new Set,I=r+y,J=s+y,L=d+y,F=f+x,Y=h+x,Z=_+x;for(let re of M){let K=re.x,_e=re.x+re.width,oe=re.x+re.width/2,se=re.y,he=re.y+re.height,Ht=re.y+re.height/2;for(let Ye of[K,oe,_e])for(let tt of[I,L,J])if(Math.abs(tt-Ye)<.5){let je=`x:${Math.round(Ye)}`;k.has(je)||(k.add(je),g.push({axis:"x",pos:Ye}))}for(let Ye of[se,Ht,he])for(let tt of[F,Z,Y])if(Math.abs(tt-Ye)<.5){let je=`y:${Math.round(Ye)}`;k.has(je)||(k.add(je),g.push({axis:"y",pos:Ye}))}}return{dx:y,dy:x,guides:g}}function h2(){return`dp-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}function E6({placements:e,onChange:t,activeComponent:n,onActiveComponentChange:l,isDarkMode:o,exiting:a,onInteractionChange:i,className:r,passthrough:s,extraSnapRects:d,onSelectionChange:f,deselectSignal:h,onDragMove:_,onDragEnd:b,clearingPlacements:w,wireframe:N}){let[M,y]=(0,ct.useState)(new Set),[x,g]=(0,ct.useState)(null),[k,I]=(0,ct.useState)(null),[J,L]=(0,ct.useState)(null),[F,Y]=(0,ct.useState)([]),[Z,re]=(0,ct.useState)(null),[K,_e]=(0,ct.useState)(!1),oe=(0,ct.useRef)(!1),[se,he]=(0,ct.useState)(new Set),Ht=(0,ct.useRef)(new Map),Ye=(0,ct.useRef)(null),tt=(0,ct.useRef)(null),je=(0,ct.useRef)(e);je.current=e;let St=(0,ct.useRef)(f);St.current=f;let _n=(0,ct.useRef)(_);_n.current=_;let $n=(0,ct.useRef)(b);$n.current=b;let De=(0,ct.useRef)(h);(0,ct.useEffect)(()=>{h!==De.current&&(De.current=h,y(new Set))},[h]),(0,ct.useEffect)(()=>{w?.length&&(y(W=>new Set([...W].filter(fe=>!w.some(Re=>Re.id===fe)))),tt.current=null)},[w]),(0,ct.useEffect)(()=>{let W=fe=>{let Re=fe.composedPath()[0]||fe.target;if(!(Re.tagName==="INPUT"||Re.tagName==="TEXTAREA"||Re.isContentEditable)){if((fe.key==="Backspace"||fe.key==="Delete")&&M.size>0){fe.preventDefault();let xe=new Set(M);he(xe),y(new Set),st(()=>{t(je.current.filter(nt=>!xe.has(nt.id))),he(new Set)},180);return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(fe.key)&&M.size>0){fe.preventDefault();let xe=fe.shiftKey?20:1,nt=fe.key==="ArrowLeft"?-xe:fe.key==="ArrowRight"?xe:0,Xe=fe.key==="ArrowUp"?-xe:fe.key==="ArrowDown"?xe:0;t(e.map(Ke=>M.has(Ke.id)?{...Ke,x:Math.max(0,Ke.x+nt),y:Math.max(0,Ke.y+Xe)}:Ke));return}if(fe.key==="Escape"){n?l(null):M.size>0&&y(new Set);return}}};return document.addEventListener("keydown",W),()=>document.removeEventListener("keydown",W)},[M,n,e,t,l]);let Ml=(0,ct.useCallback)(W=>{if(W.button!==0||s||W.target.closest(`.${B.placement}`))return;W.preventDefault(),W.stopPropagation();let Re=window.scrollY,Ce=W.clientX,xe=W.clientY;if(n){tt.current="place",i?.(!0);let nt=!1,Xe=Ce,Ke=xe,Fe=T=>{Xe=T.clientX,Ke=T.clientY;let A=Math.abs(Xe-Ce),$=Math.abs(Ke-xe);if((A>5||$>5)&&(nt=!0),nt){let X=Math.min(Ce,Xe),P=Math.min(xe,Ke),ee=Math.abs(Xe-Ce),G=Math.abs(Ke-xe);g({x:X,y:P,w:ee,h:G}),L({x:T.clientX+12,y:T.clientY+12,text:`${Math.round(ee)} \xD7 ${Math.round(G)}`})}},q=T=>{window.removeEventListener("mousemove",Fe),window.removeEventListener("mouseup",q),g(null),L(null),tt.current=null,i?.(!1);let A=ne[n],$,X,P,ee;nt?($=Math.min(Ce,Xe),X=Math.min(xe,Ke)+Re,P=Math.max(xr,Math.abs(Xe-Ce)),ee=Math.max(xr,Math.abs(Ke-xe))):(P=A.width,ee=A.height,$=Ce-P/2,X=xe+Re-ee/2),$=Math.max(0,$),X=Math.max(0,X);let G={id:h2(),type:n,x:$,y:X,width:P,height:ee,scrollY:Re,timestamp:Date.now()},ce=[...e,G];t(ce),y(new Set([G.id])),l(null)};window.addEventListener("mousemove",Fe),window.addEventListener("mouseup",q)}else{W.shiftKey||y(new Set),tt.current="select";let nt=!1,Xe=Fe=>{let q=Math.abs(Fe.clientX-Ce),T=Math.abs(Fe.clientY-xe);if((q>4||T>4)&&(nt=!0),nt){let A=Math.min(Ce,Fe.clientX),$=Math.min(xe,Fe.clientY);I({x:A,y:$,w:Math.abs(Fe.clientX-Ce),h:Math.abs(Fe.clientY-xe)})}},Ke=Fe=>{if(window.removeEventListener("mousemove",Xe),window.removeEventListener("mouseup",Ke),tt.current=null,nt){let q=Math.min(Ce,Fe.clientX),T=Math.min(xe,Fe.clientY)+Re,A=Math.abs(Fe.clientX-Ce),$=Math.abs(Fe.clientY-xe),X=new Set(W.shiftKey?M:new Set);for(let P of e){let ee=P.y-Re;P.x+P.width>q&&P.x<q+A&&P.y+P.height>T&&P.y<T+$&&X.add(P.id)}y(X)}I(null)};window.addEventListener("mousemove",Xe),window.addEventListener("mouseup",Ke)}},[n,s,e,t,M]),_o=(0,ct.useCallback)((W,fe)=>{if(W.button!==0)return;let Re=W.target;if(Re.closest(`.${B.handle}`)||Re.closest(`.${B.deleteButton}`))return;W.preventDefault(),W.stopPropagation();let Ce;W.shiftKey?(Ce=new Set(M),Ce.has(fe)?Ce.delete(fe):Ce.add(fe)):M.has(fe)?Ce=new Set(M):Ce=new Set([fe]),y(Ce),(Ce.size!==M.size||[...Ce].some(ce=>!M.has(ce)))&&St.current?.(Ce,W.shiftKey);let nt=window.scrollY,Xe=W.clientX,Ke=W.clientY,Fe=new Map;for(let ce of e)Ce.has(ce.id)&&Fe.set(ce.id,{x:ce.x,y:ce.y});tt.current="move",i?.(!0);let q=!1,T=!1,A=e,$=0,X=0,P=new Map;for(let ce of e)Fe.has(ce.id)&&P.set(ce.id,{w:ce.width,h:ce.height});let ee=ce=>{let we=ce.clientX-Xe,Oe=ce.clientY-Ke;if((Math.abs(we)>2||Math.abs(Oe)>2)&&(q=!0),!q)return;if(ce.altKey&&!T){T=!0;let kt=[];for(let pt of e)Fe.has(pt.id)&&kt.push({...pt,id:h2(),timestamp:Date.now()});A=[...e,...kt]}let ut=1/0,mt=1/0,lt=-1/0,qe=-1/0;for(let[kt,pt]of Fe){let ae=P.get(kt);ae&&(ut=Math.min(ut,pt.x+we),mt=Math.min(mt,pt.y+Oe),lt=Math.max(lt,pt.x+we+ae.w),qe=Math.max(qe,pt.y+Oe+ae.h))}let Ae={x:ut,y:mt,width:lt-ut,height:qe-mt},{dx:At,dy:Et,guides:gt}=f2(Ae,A,new Set(Fe.keys()),void 0,d);Y(gt);let Be=we+At,ot=Oe+Et;$=Be,X=ot,t(A.map(kt=>{let pt=Fe.get(kt.id);return pt?{...kt,x:Math.max(0,pt.x+Be),y:Math.max(0,pt.y+ot)}:kt})),_n.current?.(Be,ot)},G=()=>{window.removeEventListener("mousemove",ee),window.removeEventListener("mouseup",G),tt.current=null,i?.(!1),Y([]),$n.current?.($,X,q)};window.addEventListener("mousemove",ee),window.addEventListener("mouseup",G)},[M,e,t,i]),Ho=(0,ct.useCallback)((W,fe,Re)=>{W.preventDefault(),W.stopPropagation();let Ce=e.find(X=>X.id===fe);if(!Ce)return;y(new Set([fe])),tt.current="resize",i?.(!0);let xe=W.clientX,nt=W.clientY,Xe=Ce.width,Ke=Ce.height,Fe=Ce.x,q=Ce.y,T={left:Re.includes("w"),right:Re.includes("e"),top:Re.includes("n"),bottom:Re.includes("s")},A=X=>{let P=X.clientX-xe,ee=X.clientY-nt,G=Xe,ce=Ke,we=Fe,Oe=q;Re.includes("e")&&(G=Math.max(xr,Xe+P)),Re.includes("w")&&(G=Math.max(xr,Xe-P),we=Fe+Xe-G),Re.includes("s")&&(ce=Math.max(xr,Ke+ee)),Re.includes("n")&&(ce=Math.max(xr,Ke-ee),Oe=q+Ke-ce);let ut={x:we,y:Oe,width:G,height:ce},{dx:mt,dy:lt,guides:qe}=f2(ut,je.current,new Set([fe]),T,d);Y(qe),mt!==0&&(T.right?G+=mt:T.left&&(we+=mt,G-=mt)),lt!==0&&(T.bottom?ce+=lt:T.top&&(Oe+=lt,ce-=lt)),t(je.current.map(Ae=>Ae.id===fe?{...Ae,x:we,y:Oe,width:G,height:ce}:Ae)),L({x:X.clientX+12,y:X.clientY+12,text:`${Math.round(G)} \xD7 ${Math.round(ce)}`})},$=()=>{window.removeEventListener("mousemove",A),window.removeEventListener("mouseup",$),L(null),tt.current=null,i?.(!1),Y([])};window.addEventListener("mousemove",A),window.addEventListener("mouseup",$)},[e,t,i]),$o=(0,ct.useCallback)(W=>{tt.current=null,he(fe=>{let Re=new Set(fe);return Re.add(W),Re}),y(fe=>{let Re=new Set(fe);return Re.delete(W),Re}),st(()=>{t(je.current.filter(fe=>fe.id!==W)),he(fe=>{let Re=new Set(fe);return Re.delete(W),Re})},180)},[t]),fo=new Set(["text","hero","button","badge","cta","toast","modal","card","navigation","tabs","input","search","breadcrumb","pricing","testimonial","alert","banner","tag","notification","stat","productCard"]),ho={hero:"Headline text",button:"Button label",badge:"Badge label",cta:"Call to action text",toast:"Notification message",modal:"Dialog title",card:"Card title",navigation:"Brand / nav items",tabs:"Tab labels",input:"Placeholder text",search:"Search placeholder",pricing:"Plan name or price",testimonial:"Quote text",alert:"Alert message",banner:"Banner text",tag:"Tag label",notification:"Notification message",stat:"Metric value",productCard:"Product name"},mo=(0,ct.useCallback)(W=>{let fe=e.find(Re=>Re.id===W);fe&&(oe.current=!!fe.text,re(W),_e(!1))},[e]),Vt=(0,ct.useCallback)(()=>{Z&&(_e(!0),st(()=>{re(null),_e(!1)},150))},[Z]);(0,ct.useEffect)(()=>{a&&Z&&Vt()},[a]);let El=(0,ct.useCallback)(W=>{Z&&(t(e.map(fe=>fe.id===Z?{...fe,text:W.trim()||void 0}:fe)),Vt())},[Z,e,t,Vt]),Yl=typeof window<"u"?window.scrollY:0,Sa=["nw","ne","se","sw"],sl=N?"#f97316":"#3c82f7",go=[{dir:"n",cls:B.edgeN,arrow:(0,Rt.jsx)("svg",{width:"8",height:"6",viewBox:"0 0 8 6",fill:"none",children:(0,Rt.jsx)("path",{d:"M4 0.5L1 4.5h6z",fill:sl})})},{dir:"e",cls:B.edgeE,arrow:(0,Rt.jsx)("svg",{width:"6",height:"8",viewBox:"0 0 6 8",fill:"none",children:(0,Rt.jsx)("path",{d:"M5.5 4L1.5 1v6z",fill:sl})})},{dir:"s",cls:B.edgeS,arrow:(0,Rt.jsx)("svg",{width:"8",height:"6",viewBox:"0 0 8 6",fill:"none",children:(0,Rt.jsx)("path",{d:"M4 5.5L1 1.5h6z",fill:sl})})},{dir:"w",cls:B.edgeW,arrow:(0,Rt.jsx)("svg",{width:"6",height:"8",viewBox:"0 0 6 8",fill:"none",children:(0,Rt.jsx)("path",{d:"M0.5 4L4.5 1v6z",fill:sl})})}];return(0,Rt.jsxs)(Rt.Fragment,{children:[(0,Rt.jsx)("div",{ref:Ye,className:`${B.overlay} ${o?"":B.light} ${n?B.placing:""} ${s?B.passthrough:""} ${a?B.overlayExiting:""} ${N?B.wireframe:""}${r?` ${r}`:""}`,"data-feedback-toolbar":!0,onMouseDown:Ml,children:e.map(W=>{let fe=M.has(W.id),Re=Ul[W.type]?.label||W.type,Ce=W.y-Yl;return(0,Rt.jsxs)("div",{"data-design-placement":W.id,className:`${B.placement} ${fe?B.selected:""} ${se.has(W.id)||w?.includes(W)?B.exiting:""}`,style:{left:W.x,top:Ce,width:W.width,height:W.height,position:"fixed"},onMouseDown:xe=>_o(xe,W.id),onDoubleClick:()=>mo(W.id),children:[(0,Rt.jsx)("span",{className:B.placementLabel,children:Re}),(0,Rt.jsx)("span",{className:`${B.placementAnnotation} ${W.text?B.annotationVisible:""}`,children:(W.text&&Ht.current.set(W.id,W.text),W.text||Ht.current.get(W.id)||"")}),(0,Rt.jsx)("div",{className:B.placementContent,children:(0,Rt.jsx)(C6,{type:W.type,width:W.width,height:W.height,text:W.text})}),(0,Rt.jsx)("div",{className:B.deleteButton,onMouseDown:xe=>xe.stopPropagation(),onClick:()=>$o(W.id),children:"\u2715"}),Sa.map(xe=>(0,Rt.jsx)("div",{className:`${B.handle} ${B[`handle${xe.charAt(0).toUpperCase()}${xe.slice(1)}`]}`,onMouseDown:nt=>Ho(nt,W.id,xe)},xe)),go.map(({dir:xe,cls:nt,arrow:Xe})=>(0,Rt.jsx)("div",{className:`${B.edgeHandle} ${nt}`,onMouseDown:Ke=>Ho(Ke,W.id,xe),children:Xe},xe))]},W.id)})}),Z&&(()=>{let W=e.find(q=>q.id===Z);if(!W)return null;let fe=W.y-Yl,Re=W.x+W.width/2,Ce=fe-8,xe=fe+W.height+8,nt=Ce>200,Xe=xe<window.innerHeight-100,Ke=Math.max(160,Math.min(window.innerWidth-160,Re)),Fe;return nt?Fe={left:Ke,bottom:window.innerHeight-Ce}:Xe?Fe={left:Ke,top:xe}:Fe={left:Ke,top:Math.max(80,window.innerHeight/2-80)},(0,Rt.jsx)(Ih,{element:Ul[W.type]?.label||W.type,placeholder:ho[W.type]||"Label or content text",initialValue:W.text??"",submitLabel:oe.current?"Save":"Set",onSubmit:El,onCancel:Vt,onDelete:oe.current?()=>{El("")}:void 0,isExiting:K,lightMode:!o,style:Fe})})(),x&&(0,Rt.jsx)("div",{className:B.drawBox,style:{left:x.x,top:x.y,width:x.w,height:x.h},"data-feedback-toolbar":!0}),k&&(0,Rt.jsx)("div",{className:B.selectBox,style:{left:k.x,top:k.y,width:k.w,height:k.h},"data-feedback-toolbar":!0}),J&&(0,Rt.jsx)("div",{className:B.sizeIndicator,style:{left:J.x,top:J.y},"data-feedback-toolbar":!0,children:J.text}),F.map((W,fe)=>(0,Rt.jsx)("div",{className:B.guideLine,style:W.axis==="x"?{position:"fixed",left:W.pos,top:0,width:1,bottom:0}:{position:"fixed",left:0,top:W.pos-Yl,right:0,height:1},"data-feedback-toolbar":!0},`${W.axis}-${W.pos}-${fe}`))]})}function nb(e,{keepMounted:t=!1,onExited:n}={}){let[l,o]=(0,wa.useState)(t||e),a=(0,wa.useRef)(null),i=(0,wa.useRef)(n);return e&&!l&&o(!0),(0,wa.useLayoutEffect)(()=>{i.current=n},[n]),(0,wa.useLayoutEffect)(()=>{let r=a.current;if(!r||r.dataset.panelOpen==="true"===e)return;getComputedStyle(r).opacity,r.dataset.panelPresent="true",r.dataset.panelOpen=String(e);let s=!1,d=r.getAnimations?.()??[];return Promise.allSettled(d.map(f=>f.finished)).then(()=>{s||e||(delete r.dataset.panelPresent,t||o(!1),i.current?.())}),()=>{s=!0}},[e,l,t]),{ref:a,mounted:l}}function T6(e){if(!e)return"";let t=e.scrollTop>2,n=e.scrollTop+e.clientHeight<e.scrollHeight-2;return`${t?B.fadeTop:""} ${n?B.fadeBottom:""}`}var v="currentColor",O="0.5";function N6({type:e}){switch(e){case"navigation":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"4",width:"18",height:"8",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"2.5",y:"7",width:"3",height:"1.5",rx:".5",fill:v,opacity:".4"}),(0,c.jsx)("rect",{x:"7",y:"7",width:"2.5",height:"1.5",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"11",y:"7",width:"2.5",height:"1.5",rx:".5",fill:v,opacity:".25"})]});case"header":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3",y:"5.5",width:"8",height:"2",rx:".5",fill:v,opacity:".35"}),(0,c.jsx)("rect",{x:"3",y:"9",width:"12",height:"1",rx:".5",fill:v,opacity:".15"})]});case"hero":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"1",width:"18",height:"14",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5",y:"5",width:"10",height:"1.5",rx:".5",fill:v,opacity:".35"}),(0,c.jsx)("rect",{x:"7",y:"8",width:"6",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"7.5",y:"10.5",width:"5",height:"2.5",rx:"1",stroke:v,strokeWidth:O})]});case"section":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"1",width:"18",height:"14",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3",y:"4",width:"6",height:"1",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"3",y:"6.5",width:"14",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"3",y:"9",width:"10",height:"1",rx:".5",fill:v,opacity:".15"})]});case"sidebar":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"1",width:"7",height:"14",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"2.5",y:"4",width:"4",height:"1",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"2.5",y:"6.5",width:"3.5",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"2.5",y:"9",width:"4",height:"1",rx:".5",fill:v,opacity:".15"})]});case"footer":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"7",width:"18",height:"8",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3",y:"9.5",width:"4",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"9",y:"9.5",width:"4",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"15",y:"9.5",width:"3",height:"1",rx:".5",fill:v,opacity:".2"})]});case"modal":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5",y:"4.5",width:"7",height:"1",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"5",y:"7",width:"10",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"11",y:"11",width:"5",height:"2",rx:".75",stroke:v,strokeWidth:O})]});case"divider":return(0,c.jsx)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:(0,c.jsx)("line",{x1:"2",y1:"8",x2:"18",y2:"8",stroke:v,strokeWidth:"0.5",opacity:".3"})});case"card":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"2",y:"1",width:"16",height:"5.5",rx:"1",fill:v,opacity:".04"}),(0,c.jsx)("rect",{x:"4",y:"8.5",width:"8",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"4",y:"11",width:"11",height:"1",rx:".5",fill:v,opacity:".12"})]});case"text":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"4",width:"14",height:"1.5",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"2",y:"7",width:"11",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"2",y:"9.5",width:"13",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"2",y:"12",width:"8",height:"1",rx:".5",fill:v,opacity:".12"})]});case"image":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("line",{x1:"2",y1:"2",x2:"18",y2:"14",stroke:v,strokeWidth:".3",opacity:".25"}),(0,c.jsx)("line",{x1:"18",y1:"2",x2:"2",y2:"14",stroke:v,strokeWidth:".3",opacity:".25"})]});case"video":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("path",{d:"M8.5 5.5v5l4.5-2.5z",stroke:v,strokeWidth:O,fill:v,opacity:".15"})]});case"table":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("line",{x1:"1",y1:"5.5",x2:"19",y2:"5.5",stroke:v,strokeWidth:".3",opacity:".25"}),(0,c.jsx)("line",{x1:"1",y1:"9",x2:"19",y2:"9",stroke:v,strokeWidth:".3",opacity:".25"}),(0,c.jsx)("line",{x1:"7",y1:"2",x2:"7",y2:"14",stroke:v,strokeWidth:".3",opacity:".25"}),(0,c.jsx)("line",{x1:"13",y1:"2",x2:"13",y2:"14",stroke:v,strokeWidth:".3",opacity:".25"})]});case"grid":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1.5",y:"2",width:"7",height:"5.5",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"11.5",y:"2",width:"7",height:"5.5",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"1.5",y:"9.5",width:"7",height:"5.5",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"11.5",y:"9.5",width:"7",height:"5.5",rx:"1",stroke:v,strokeWidth:O})]});case"list":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("circle",{cx:"3.5",cy:"4.5",r:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6.5",y:"4",width:"10",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"3.5",cy:"8",r:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6.5",y:"7.5",width:"8",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"3.5",cy:"11.5",r:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6.5",y:"11",width:"11",height:"1",rx:".5",fill:v,opacity:".2"})]});case"chart":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"9",width:"2.5",height:"4",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("rect",{x:"7",y:"6",width:"2.5",height:"7",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"11",y:"3",width:"2.5",height:"10",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"15",y:"5",width:"2.5",height:"8",rx:".5",fill:v,opacity:".2"})]});case"accordion":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1.5",y:"2",width:"17",height:"4",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3",y:"3.5",width:"6",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"1.5",y:"7.5",width:"17",height:"3",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"1.5",y:"12",width:"17",height:"3",rx:"1",stroke:v,strokeWidth:O})]});case"carousel":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"2",width:"14",height:"10",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("path",{d:"M1.5 7L3 8.5 1.5 10",stroke:v,strokeWidth:O,opacity:".35"}),(0,c.jsx)("path",{d:"M18.5 7L17 8.5 18.5 10",stroke:v,strokeWidth:O,opacity:".35"}),(0,c.jsx)("circle",{cx:"8.5",cy:"14",r:".6",fill:v,opacity:".35"}),(0,c.jsx)("circle",{cx:"10",cy:"14",r:".6",fill:v,opacity:".15"}),(0,c.jsx)("circle",{cx:"11.5",cy:"14",r:".6",fill:v,opacity:".15"})]});case"button":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"5",width:"14",height:"6",rx:"2",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6.5",y:"7.5",width:"7",height:"1",rx:".5",fill:v,opacity:".25"})]});case"input":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"4",width:"5.5",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"2",y:"6.5",width:"16",height:"5.5",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3.5",y:"8.5",width:"7",height:"1",rx:".5",fill:v,opacity:".12"})]});case"search":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"4.5",width:"16",height:"7",rx:"3.5",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"6",cy:"8",r:"2",stroke:v,strokeWidth:O,opacity:".3"}),(0,c.jsx)("line",{x1:"7.5",y1:"9.5",x2:"9",y2:"11",stroke:v,strokeWidth:O,opacity:".3"}),(0,c.jsx)("rect",{x:"9.5",y:"7.5",width:"6",height:"1",rx:".5",fill:v,opacity:".12"})]});case"form":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"1.5",width:"5.5",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"2",y:"3.5",width:"16",height:"3",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"2",y:"8",width:"7",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"2",y:"10",width:"16",height:"3",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"12",y:"14",width:"6",height:"2",rx:".75",stroke:v,strokeWidth:O})]});case"tabs":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"5",width:"18",height:"10",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"1",y:"2",width:"6",height:"3.5",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"2.5",y:"3.25",width:"3",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"7",y:"2",width:"6",height:"3.5",rx:".75",stroke:v,strokeWidth:O})]});case"dropdown":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"2",width:"16",height:"4",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3.5",y:"3.5",width:"7",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("path",{d:"M15 3.5l1.5 1.5L18 3.5",stroke:v,strokeWidth:O,opacity:".3"}),(0,c.jsx)("rect",{x:"2",y:"7",width:"16",height:"7",rx:"1",stroke:v,strokeWidth:O,strokeDasharray:"2 1",opacity:".3"})]});case"toggle":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"4",y:"5",width:"12",height:"6",rx:"3",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"13",cy:"8",r:"2",fill:v,opacity:".3"})]});case"avatar":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("circle",{cx:"10",cy:"8",r:"6",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"10",cy:"6.5",r:"2",stroke:v,strokeWidth:O}),(0,c.jsx)("path",{d:"M6.5 13c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5",stroke:v,strokeWidth:O})]});case"badge":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"5",width:"14",height:"6",rx:"3",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6",y:"7.5",width:"8",height:"1",rx:".5",fill:v,opacity:".25"})]});case"breadcrumb":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1.5",y:"7",width:"3.5",height:"1",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("path",{d:"M6.5 7l1 1-1 1",stroke:v,strokeWidth:O,opacity:".2"}),(0,c.jsx)("rect",{x:"9",y:"7",width:"3.5",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("path",{d:"M14 7l1 1-1 1",stroke:v,strokeWidth:O,opacity:".2"}),(0,c.jsx)("rect",{x:"16.5",y:"7",width:"2",height:"1",rx:".5",fill:v,opacity:".15"})]});case"pagination":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6.5",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"11",y:"5.5",width:"3.5",height:"5",rx:"1",fill:v,opacity:".15",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"15.5",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:v,strokeWidth:O})]});case"progress":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"7",width:"16",height:"2",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"2",y:"7",width:"10",height:"2",rx:"1",fill:v,opacity:".2"})]});case"toast":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"4",width:"16",height:"8",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"5",cy:"8",r:"1.5",stroke:v,strokeWidth:O,opacity:".3"}),(0,c.jsx)("rect",{x:"8",y:"6.5",width:"7",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"8",y:"9",width:"5",height:"1",rx:".5",fill:v,opacity:".12"})]});case"tooltip":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"3",width:"14",height:"7",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5.5",y:"5.5",width:"9",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("path",{d:"M9 10l1 2.5 1-2.5",stroke:v,strokeWidth:O})]});case"pricing":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6",y:"3",width:"8",height:"1.5",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"7",y:"5.5",width:"6",height:"2",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"5",y:"9",width:"10",height:"1",rx:".5",fill:v,opacity:".1"}),(0,c.jsx)("rect",{x:"5",y:"11",width:"10",height:"1",rx:".5",fill:v,opacity:".1"}),(0,c.jsx)("rect",{x:"6",y:"13",width:"8",height:"1.5",rx:".5",fill:v,opacity:".2"})]});case"testimonial":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("text",{x:"4",y:"5.5",fontSize:"4",fill:v,opacity:".2",fontFamily:"serif",children:"\u201C"}),(0,c.jsx)("rect",{x:"4",y:"7",width:"12",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"4",y:"9",width:"9",height:"1",rx:".5",fill:v,opacity:".12"}),(0,c.jsx)("circle",{cx:"5.5",cy:"12.5",r:"1.5",stroke:v,strokeWidth:O,opacity:".25"}),(0,c.jsx)("rect",{x:"8",y:"12",width:"5",height:"1",rx:".5",fill:v,opacity:".15"})]});case"cta":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5",y:"4.5",width:"10",height:"1.5",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"6",y:"7.5",width:"8",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"7",y:"10",width:"6",height:"2.5",rx:"1",stroke:v,strokeWidth:O})]});case"alert":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"4",width:"16",height:"8",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"6",cy:"8",r:"2",stroke:v,strokeWidth:O,opacity:".3"}),(0,c.jsx)("line",{x1:"6",y1:"7",x2:"6",y2:"8.5",stroke:v,strokeWidth:"0.6",opacity:".5"}),(0,c.jsx)("circle",{cx:"6",cy:"9.3",r:".3",fill:v,opacity:".5"}),(0,c.jsx)("rect",{x:"9.5",y:"7",width:"6",height:"1",rx:".5",fill:v,opacity:".2"})]});case"banner":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"5",width:"18",height:"6",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"4",y:"7.5",width:"8",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"14",y:"7",width:"3.5",height:"2",rx:".75",stroke:v,strokeWidth:O})]});case"stat":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6",y:"4.5",width:"8",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"5",y:"7",width:"10",height:"2.5",rx:".5",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"7",y:"11",width:"6",height:"1",rx:".5",fill:v,opacity:".12"})]});case"stepper":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("circle",{cx:"4",cy:"8",r:"2",fill:v,opacity:".2",stroke:v,strokeWidth:O}),(0,c.jsx)("line",{x1:"6",y1:"8",x2:"8",y2:"8",stroke:v,strokeWidth:".4",opacity:".3"}),(0,c.jsx)("circle",{cx:"10",cy:"8",r:"2",stroke:v,strokeWidth:O}),(0,c.jsx)("line",{x1:"12",y1:"8",x2:"14",y2:"8",stroke:v,strokeWidth:".4",opacity:".3"}),(0,c.jsx)("circle",{cx:"16",cy:"8",r:"2",stroke:v,strokeWidth:O})]});case"tag":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"5",width:"14",height:"6",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5.5",y:"7.5",width:"6",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("line",{x1:"14",y1:"6.5",x2:"15.5",y2:"9.5",stroke:v,strokeWidth:O,opacity:".2"}),(0,c.jsx)("line",{x1:"15.5",y1:"6.5",x2:"14",y2:"9.5",stroke:v,strokeWidth:O,opacity:".2"})]});case"rating":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("path",{d:"M4 5.5l1 2 2.2.3-1.6 1.5.4 2.2L4 10.3l-2 1.2.4-2.2L.8 7.8 3 7.5z",fill:v,opacity:".25"}),(0,c.jsx)("path",{d:"M10 5.5l1 2 2.2.3-1.6 1.5.4 2.2L10 10.3l-2 1.2.4-2.2L6.8 7.8 9 7.5z",fill:v,opacity:".25"}),(0,c.jsx)("path",{d:"M16 5.5l1 2 2.2.3-1.6 1.5.4 2.2L16 10.3l-2 1.2.4-2.2-1.6-1.5 2.2-.3z",stroke:v,strokeWidth:O,opacity:".25"})]});case"map":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("line",{x1:"2",y1:"6",x2:"18",y2:"10",stroke:v,strokeWidth:".3",opacity:".15"}),(0,c.jsx)("line",{x1:"7",y1:"2",x2:"11",y2:"14",stroke:v,strokeWidth:".3",opacity:".15"}),(0,c.jsx)("path",{d:"M10 5c-1.7 0-3 1.3-3 3 0 2.5 3 5 3 5s3-2.5 3-5c0-1.7-1.3-3-3-3z",fill:v,opacity:".15",stroke:v,strokeWidth:O})]});case"timeline":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("line",{x1:"5",y1:"2",x2:"5",y2:"14",stroke:v,strokeWidth:".4",opacity:".25"}),(0,c.jsx)("circle",{cx:"5",cy:"4",r:"1.5",fill:v,opacity:".2",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"8",y:"3",width:"8",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("circle",{cx:"5",cy:"8.5",r:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"8",y:"7.5",width:"6",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("circle",{cx:"5",cy:"13",r:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"8",y:"12",width:"7",height:"1",rx:".5",fill:v,opacity:".15"})]});case"fileUpload":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:v,strokeWidth:O,strokeDasharray:"2 1"}),(0,c.jsx)("path",{d:"M10 10V5.5m0 0L7.5 8m2.5-2.5L12.5 8",stroke:v,strokeWidth:O,opacity:".3"}),(0,c.jsx)("rect",{x:"7",y:"11.5",width:"6",height:"1",rx:".5",fill:v,opacity:".15"})]});case"codeBlock":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"4",cy:"4",r:".6",fill:v,opacity:".3"}),(0,c.jsx)("circle",{cx:"5.5",cy:"4",r:".6",fill:v,opacity:".3"}),(0,c.jsx)("circle",{cx:"7",cy:"4",r:".6",fill:v,opacity:".3"}),(0,c.jsx)("rect",{x:"4",y:"7",width:"7",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("rect",{x:"6",y:"9",width:"5",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"4",y:"11",width:"8",height:"1",rx:".5",fill:v,opacity:".12"})]});case"calendar":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"3",width:"16",height:"12",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("line",{x1:"2",y1:"6.5",x2:"18",y2:"6.5",stroke:v,strokeWidth:".4",opacity:".25"}),(0,c.jsx)("rect",{x:"5",y:"4",width:"1",height:"1.5",rx:".3",fill:v,opacity:".2"}),(0,c.jsx)("rect",{x:"14",y:"4",width:"1",height:"1.5",rx:".3",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"7",cy:"9",r:".6",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"10",cy:"9",r:".6",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"13",cy:"9",r:".6",fill:v,opacity:".3"}),(0,c.jsx)("circle",{cx:"7",cy:"12",r:".6",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"10",cy:"12",r:".6",fill:v,opacity:".2"})]});case"notification":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"3",width:"16",height:"10",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"5.5",cy:"8",r:"2",stroke:v,strokeWidth:O,opacity:".25"}),(0,c.jsx)("rect",{x:"9",y:"6",width:"6",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"9",y:"8.5",width:"4.5",height:"1",rx:".5",fill:v,opacity:".12"}),(0,c.jsx)("circle",{cx:"16.5",cy:"4.5",r:"1.5",fill:v,opacity:".25"})]});case"productCard":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"1",width:"14",height:"14",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3",y:"1",width:"14",height:"6",rx:"1",fill:v,opacity:".04"}),(0,c.jsx)("rect",{x:"5",y:"8.5",width:"7",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"5",y:"10.5",width:"4",height:"1.5",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"12",y:"12",width:"4",height:"2",rx:".75",stroke:v,strokeWidth:O})]});case"profile":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("circle",{cx:"10",cy:"5",r:"3",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5",y:"10",width:"10",height:"1.5",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"7",y:"12.5",width:"6",height:"1",rx:".5",fill:v,opacity:".12"})]});case"drawer":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"9",y:"1",width:"10",height:"14",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"10.5",y:"4",width:"5",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"10.5",y:"6.5",width:"7",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"10.5",y:"9",width:"6",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"1",y:"1",width:"7",height:"14",rx:"1",stroke:v,strokeWidth:O,opacity:".15"})]});case"popover":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"2",width:"14",height:"9",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5",y:"4.5",width:"8",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"5",y:"7",width:"6",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("path",{d:"M9 11l1 2.5 1-2.5",stroke:v,strokeWidth:O})]});case"logo":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"3",width:"10",height:"10",rx:"2",stroke:v,strokeWidth:O}),(0,c.jsx)("path",{d:"M5 9.5l2-4 2 4",stroke:v,strokeWidth:O,opacity:".3"}),(0,c.jsx)("rect",{x:"14",y:"6",width:"4",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("rect",{x:"14",y:"8.5",width:"3",height:"1",rx:".5",fill:v,opacity:".12"})]});case"faq":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("text",{x:"2.5",y:"5.5",fontSize:"4",fill:v,opacity:".3",fontWeight:"bold",children:"?"}),(0,c.jsx)("rect",{x:"7",y:"3",width:"10",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"7",y:"5.5",width:"8",height:"1",rx:".5",fill:v,opacity:".12"}),(0,c.jsx)("text",{x:"2.5",y:"11.5",fontSize:"4",fill:v,opacity:".3",fontWeight:"bold",children:"?"}),(0,c.jsx)("rect",{x:"7",y:"9",width:"9",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"7",y:"11.5",width:"7",height:"1",rx:".5",fill:v,opacity:".12"})]});case"gallery":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"7.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"13.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"1.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"7.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"13.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:v,strokeWidth:O})]});case"checkbox":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"5",y:"4",width:"8",height:"8",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("path",{d:"M7.5 8l1.5 1.5 3-3",stroke:v,strokeWidth:O,opacity:".35"})]});case"radio":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("circle",{cx:"10",cy:"8",r:"4",stroke:v,strokeWidth:O}),(0,c.jsx)("circle",{cx:"10",cy:"8",r:"2",fill:v,opacity:".3"})]});case"slider":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"7.5",width:"16",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"2",y:"7.5",width:"10",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("circle",{cx:"12",cy:"8",r:"2.5",stroke:v,strokeWidth:O})]});case"datePicker":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"1",width:"16",height:"5",rx:"1",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"3.5",y:"3",width:"5",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("rect",{x:"14",y:"2.5",width:"2.5",height:"2",rx:".5",fill:v,opacity:".12"}),(0,c.jsx)("rect",{x:"2",y:"7",width:"16",height:"8",rx:"1",stroke:v,strokeWidth:O,strokeDasharray:"2 1",opacity:".3"}),(0,c.jsx)("circle",{cx:"6",cy:"10",r:".6",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"10",cy:"10",r:".6",fill:v,opacity:".3"}),(0,c.jsx)("circle",{cx:"14",cy:"10",r:".6",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"6",cy:"13",r:".6",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"10",cy:"13",r:".6",fill:v,opacity:".2"})]});case"skeleton":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"2",width:"16",height:"3",rx:"1",fill:v,opacity:".08"}),(0,c.jsx)("rect",{x:"2",y:"7",width:"10",height:"2",rx:".75",fill:v,opacity:".08"}),(0,c.jsx)("rect",{x:"2",y:"11",width:"13",height:"2",rx:".75",fill:v,opacity:".08"})]});case"chip":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"1.5",y:"5",width:"10",height:"6",rx:"3",fill:v,opacity:".08",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"4",y:"7.5",width:"4",height:"1",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("line",{x1:"9.5",y1:"6.5",x2:"10.5",y2:"9.5",stroke:v,strokeWidth:O,opacity:".2"}),(0,c.jsx)("line",{x1:"10.5",y1:"6.5",x2:"9.5",y2:"9.5",stroke:v,strokeWidth:O,opacity:".2"}),(0,c.jsx)("rect",{x:"13",y:"5",width:"5.5",height:"6",rx:"3",stroke:v,strokeWidth:O,opacity:".25"})]});case"icon":return(0,c.jsx)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:(0,c.jsx)("path",{d:"M10 3l1.5 3 3.5.5-2.5 2.5.5 3.5L10 11l-3 1.5.5-3.5L5 6.5l3.5-.5z",stroke:v,strokeWidth:O,opacity:".3"})});case"spinner":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("circle",{cx:"10",cy:"8",r:"5",stroke:v,strokeWidth:O,opacity:".12"}),(0,c.jsx)("path",{d:"M10 3a5 5 0 0 1 5 5",stroke:v,strokeWidth:O,opacity:".35",strokeLinecap:"round"})]});case"feature":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"2",width:"5",height:"5",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("path",{d:"M4.5 3.5v3m-1.5-1.5h3",stroke:v,strokeWidth:O,opacity:".25"}),(0,c.jsx)("rect",{x:"9",y:"2.5",width:"8",height:"1.5",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"9",y:"5.5",width:"6",height:"1",rx:".5",fill:v,opacity:".12"}),(0,c.jsx)("rect",{x:"2",y:"10",width:"5",height:"5",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"9",y:"10.5",width:"7",height:"1.5",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"9",y:"13.5",width:"5",height:"1",rx:".5",fill:v,opacity:".12"})]});case"team":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("circle",{cx:"5",cy:"5",r:"2.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"2.5",y:"9",width:"5",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"15",cy:"5",r:"2.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"12.5",y:"9",width:"5",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("circle",{cx:"10",cy:"5",r:"2.5",stroke:v,strokeWidth:O,opacity:".5"}),(0,c.jsx)("rect",{x:"7.5",y:"9",width:"5",height:"1",rx:".5",fill:v,opacity:".15"}),(0,c.jsx)("rect",{x:"4",y:"12",width:"12",height:"1",rx:".5",fill:v,opacity:".1"})]});case"login":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"3",y:"1",width:"14",height:"14",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6",y:"3",width:"8",height:"1.5",rx:".5",fill:v,opacity:".25"}),(0,c.jsx)("rect",{x:"5",y:"5.5",width:"10",height:"3",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"5",y:"9.5",width:"10",height:"3",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"6.5",y:"13.5",width:"7",height:"2",rx:".75",fill:v,opacity:".2"})]});case"contact":return(0,c.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,c.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"4",y:"3",width:"5",height:"1",rx:".5",fill:v,opacity:".2"}),(0,c.jsx)("rect",{x:"4",y:"5",width:"12",height:"2.5",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"4",y:"8.5",width:"12",height:"4",rx:".75",stroke:v,strokeWidth:O}),(0,c.jsx)("rect",{x:"11",y:"13.5",width:"5",height:"1.5",rx:".5",fill:v,opacity:".2"})]});default:return null}}function R6({activeType:e,onSelect:t,onDragStart:n,scrollRef:l,fadeClass:o,blankCanvas:a}){return(0,c.jsx)("div",{ref:l,className:`${B.placeScroll} ${o||""}`,children:tb.map(i=>(0,c.jsxs)("div",{className:B.paletteSection,children:[(0,c.jsx)("div",{className:B.paletteSectionTitle,children:i.section}),i.items.map(r=>(0,c.jsxs)("button",{type:"button","aria-pressed":e===r.type,className:`${B.paletteItem} ${e===r.type?B.active:""} ${a?B.wireframe:""}`,onClick:()=>t(r.type),onMouseDown:s=>{s.button===0&&n(r.type,s)},children:[(0,c.jsx)("span",{className:B.paletteItemIcon,"aria-hidden":"true",children:(0,c.jsx)(N6,{type:r.type})}),(0,c.jsx)("span",{className:B.paletteItemLabel,children:r.label})]},r.type))]},i.section))})}function A6({value:e,suffix:t}){let[n,l]=(0,dn.useState)(null),[o,a]=(0,dn.useState)(t),[i,r]=(0,dn.useState)("up"),s=(0,dn.useRef)(e),d=(0,dn.useRef)(t),f=(0,dn.useRef)(),h=n!==null&&o!==t;return(0,dn.useEffect)(()=>{if(e!==s.current){if(e===0){s.current=e,d.current=t,l(null);return}r(e>s.current?"up":"down"),l(s.current),a(d.current),s.current=e,d.current=t,clearTimeout(f.current),f.current=st(()=>l(null),250)}else d.current=t},[e,t]),n===null?(0,c.jsxs)(c.Fragment,{children:[e,t?` ${t}`:""]}):h?(0,c.jsxs)("span",{className:B.rollingWrap,children:[(0,c.jsxs)("span",{style:{visibility:"hidden"},children:[e," ",t]}),(0,c.jsxs)("span",{className:`${B.rollingNum} ${i==="up"?B.exitUp:B.exitDown}`,children:[n," ",o]},`o${n}-${e}`),(0,c.jsxs)("span",{className:`${B.rollingNum} ${i==="up"?B.enterUp:B.enterDown}`,children:[e," ",t]},`n${e}`)]}):(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)("span",{className:B.rollingWrap,children:[(0,c.jsx)("span",{style:{visibility:"hidden"},children:e}),(0,c.jsx)("span",{className:`${B.rollingNum} ${i==="up"?B.exitUp:B.exitDown}`,children:n},`o${n}-${e}`),(0,c.jsx)("span",{className:`${B.rollingNum} ${i==="up"?B.enterUp:B.enterDown}`,children:e},`n${e}`)]}),t?` ${t}`:""]})}function D6({activeType:e,onSelect:t,isDarkMode:n,sectionCount:l,onDetectSections:o,visible:a,onExited:i,placementCount:r,onClearPlacements:s,onDragStart:d,blankCanvas:f,onBlankCanvasChange:h,wireframePurpose:_,onWireframePurposeChange:b,Tooltip:w}){let{ref:N,mounted:M}=nb(a,{onExited:i}),[y,x]=(0,dn.useState)(!1),[g,k]=(0,dn.useState)(!0),I=(0,dn.useRef)(0),J=(0,dn.useRef)(""),L=(0,dn.useRef)(null),[F,Y]=(0,dn.useState)(""),Z=r>0||l>0,re=r+l;if(re>0&&(I.current=re,J.current=f?re===1?"Component":"Components":re===1?"Change":"Changes"),(0,dn.useEffect)(()=>{if(Z)y?k(!1):(k(!0),x(!0),Ad(()=>{Ad(()=>{k(!1)})}));else{k(!0);let _e=st(()=>x(!1),300);return()=>clearTimeout(_e)}},[Z]),(0,dn.useEffect)(()=>{if(!a)return;let _e=L.current;if(!_e)return;let oe=()=>Y(T6(_e));_e.addEventListener("scroll",oe,{passive:!0});let se=new ResizeObserver(oe);return se.observe(_e),()=>{_e.removeEventListener("scroll",oe),se.disconnect()}},[a]),!M)return null;let K=[];return r>0&&K.push("placed"),l>0&&K.push("captured"),(0,c.jsxs)("div",{className:`${B.palette} ${n?"":B.light}`,ref:_e=>{N.current=_e,_e?.toggleAttribute("inert",!a)},"aria-hidden":!a,"data-feedback-toolbar":!0,"data-agentation-palette":!0,onClick:_e=>_e.stopPropagation(),onMouseDown:_e=>_e.stopPropagation(),children:[(0,c.jsxs)("div",{className:B.paletteHeader,children:[(0,c.jsx)("div",{className:B.paletteHeaderTitle,children:"Layout Mode"}),(0,c.jsxs)("div",{className:B.paletteHeaderDesc,children:["Rearrange and resize existing elements, add new components, and explore layout ideas. Agent results may vary."," ",(0,c.jsx)("a",{href:"https://agentation.com/features#layout-mode",target:"_blank",rel:"noopener noreferrer",children:"Learn more."})]})]}),(0,c.jsxs)("button",{type:"button","aria-pressed":f,className:`${B.canvasToggle} ${f?B.active:""}`,onClick:()=>h(!f),children:[(0,c.jsx)("span",{className:B.canvasToggleIcon,"aria-hidden":"true",children:(0,c.jsxs)("svg",{viewBox:"0 0 14 14",width:"14",height:"14",fill:"none",children:[(0,c.jsx)("rect",{x:"1",y:"1",width:"12",height:"12",rx:"2",stroke:"currentColor",strokeWidth:"1"}),(0,c.jsx)("circle",{cx:"4.5",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"7",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"9.5",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"4.5",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"7",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"9.5",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"4.5",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"7",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,c.jsx)("circle",{cx:"9.5",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"})]})}),(0,c.jsx)("span",{className:B.canvasToggleLabel,children:"Wireframe New Page"})]}),(0,c.jsx)("div",{className:`${B.wireframePurposeWrap} ${f?"":B.collapsed}`,"aria-hidden":!f,ref:_e=>{_e?.toggleAttribute("inert",!f)},children:(0,c.jsx)("div",{className:B.wireframePurposeInner,children:(0,c.jsx)("textarea",{className:B.wireframePurposeInput,placeholder:"Describe this page to provide additional context for your agent.",value:_,onChange:_e=>b(_e.target.value),rows:2})})}),(0,c.jsx)(R6,{activeType:e,onSelect:t,onDragStart:d,scrollRef:L,fadeClass:F,blankCanvas:f}),y&&(0,c.jsx)("div",{className:`${B.paletteFooterWrap} ${g?B.footerHidden:""}`,children:(0,c.jsx)("div",{className:B.paletteFooterInner,children:(0,c.jsx)("div",{className:B.paletteFooterInnerContent,children:(0,c.jsxs)("div",{className:B.paletteFooter,children:[(0,c.jsx)("span",{className:B.paletteFooterCount,children:(0,c.jsx)(A6,{value:I.current,suffix:J.current})}),(0,c.jsx)("button",{className:B.paletteFooterClear,onClick:s,children:"Clear"})]})})})})]})}var z6=new Set(["nav","header","main","section","article","footer","aside"]),Ah={banner:"Header",navigation:"Navigation",main:"Main Content",contentinfo:"Footer",complementary:"Sidebar",region:"Section"},m2={nav:"Navigation",header:"Header",main:"Main Content",section:"Section",article:"Article",footer:"Footer",aside:"Sidebar"},O6=new Set(["script","style","noscript","link","meta"]),L6=40;function lb(e){let t=e;for(;t&&t!==document.body&&t!==document.documentElement;){let n=window.getComputedStyle(t).position;if(n==="fixed"||n==="sticky")return!0;t=t.parentElement}return!1}function _i(e){let t=e.tagName.toLowerCase();if(["nav","header","footer","main"].includes(t)&&document.querySelectorAll(t).length===1)return t;if(e.id)return`#${CSS.escape(e.id)}`;if(e.className&&typeof e.className=="string"){let o=e.className.split(/\s+/).filter(a=>a.length>0).find(a=>a.length>2&&!/^[a-zA-Z0-9]{6,}$/.test(a)&&!/^[a-z]{1,2}$/.test(a));if(o){let a=`${t}.${CSS.escape(o)}`;if(document.querySelectorAll(a).length===1)return a}}let n=e.parentElement;if(n){let o=Array.from(n.children).indexOf(e)+1;return`${n===document.body?"body":_i(n)} > ${t}:nth-child(${o})`}return t}function Dd(e){let t=e.tagName.toLowerCase(),n=e.getAttribute("aria-label");if(n)return n;let l=e.getAttribute("role");if(l&&Ah[l])return Ah[l];if(m2[t])return m2[t];let o=e.querySelector("h1, h2, h3, h4, h5, h6");if(o){let i=o.textContent?.trim();if(i&&i.length<=50)return i;if(i)return i.slice(0,47)+"..."}let{name:a}=Sr(e);return a.charAt(0).toUpperCase()+a.slice(1)}function ob(e){let t=e.className;return typeof t!="string"||!t?null:t.split(/\s+/).map(l=>l.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(l=>l.length>2&&!/^[a-z]{1,2}$/.test(l))||null}function ab(e){let t=e.textContent?.trim();if(!t)return null;let n=t.replace(/\s+/g," ");return n.length<=30?n:n.slice(0,30)+"\u2026"}function B6(){let e=document.querySelector("main")||document.body,t=Array.from(e.children),n=t;e!==document.body&&t.length<3&&(n=Array.from(document.body.children));let l=[];return n.forEach((o,a)=>{if(!(o instanceof HTMLElement))return;let i=o.tagName.toLowerCase();if(O6.has(i)||o.hasAttribute("data-feedback-toolbar")||o.closest("[data-feedback-toolbar]"))return;let r=window.getComputedStyle(o);if(r.display==="none"||r.visibility==="hidden")return;let s=o.getBoundingClientRect();if(s.height<L6)return;let d=z6.has(i),f=o.getAttribute("role")&&Ah[o.getAttribute("role")],h=i==="div"&&s.height>=60;if(!d&&!f&&!h)return;let _=window.scrollY,b=lb(o),w={x:s.x,y:b?s.y:s.y+_,width:s.width,height:s.height};l.push({id:`rs-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,label:Dd(o),tagName:i,selector:_i(o),role:o.getAttribute("role"),className:ob(o),textSnippet:ab(o),originalRect:w,currentRect:{...w},originalIndex:a,isFixed:b})}),l}function H6(e){let t=window.scrollY,n=e.getBoundingClientRect(),l=lb(e),o={x:n.x,y:l?n.y:n.y+t,width:n.width,height:n.height},a=e.parentElement,i=0;return a&&(i=Array.from(a.children).indexOf(e)),{id:`rs-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,label:Dd(e),tagName:e.tagName.toLowerCase(),selector:_i(e),role:e.getAttribute("role"),className:ob(e),textSnippet:ab(e),originalRect:o,currentRect:{...o},originalIndex:i,isFixed:l}}var g2={bg:"rgba(59, 130, 246, 0.08)",border:"rgba(59, 130, 246, 0.5)",pill:"#3b82f6"},y2=["nw","n","ne","e","se","s","sw","w"],xd=24,p2=16,wd=5;function b2(e,t,n,l){let o=1/0,a=1/0,i=e.x,r=e.x+e.width,s=e.x+e.width/2,d=e.y,f=e.y+e.height,h=e.y+e.height/2,_=[];for(let L of t)n.has(L.id)||_.push(L.currentRect);l&&_.push(...l);for(let L of _){let F=L.x,Y=L.x+L.width,Z=L.x+L.width/2,re=L.y,K=L.y+L.height,_e=L.y+L.height/2;for(let oe of[i,r,s])for(let se of[F,Y,Z]){let he=se-oe;Math.abs(he)<wd&&Math.abs(he)<Math.abs(o)&&(o=he)}for(let oe of[d,f,h])for(let se of[re,K,_e]){let he=se-oe;Math.abs(he)<wd&&Math.abs(he)<Math.abs(a)&&(a=he)}}let b=Math.abs(o)<wd?o:0,w=Math.abs(a)<wd?a:0,N=[],M=new Set,y=i+b,x=r+b,g=s+b,k=d+w,I=f+w,J=h+w;for(let L of _){let F=L.x,Y=L.x+L.width,Z=L.x+L.width/2,re=L.y,K=L.y+L.height,_e=L.y+L.height/2;for(let oe of[F,Z,Y])for(let se of[y,g,x])if(Math.abs(se-oe)<.5){let he=`x:${Math.round(oe)}`;M.has(he)||(M.add(he),N.push({axis:"x",pos:oe}))}for(let oe of[re,_e,K])for(let se of[k,J,I])if(Math.abs(se-oe)<.5){let he=`y:${Math.round(oe)}`;M.has(he)||(M.add(he),N.push({axis:"y",pos:oe}))}}return{dx:b,dy:w,guides:N}}var $6=new Set(["script","style","noscript","link","meta","br","hr"]);function v2(e){let t=e;for(;t&&t!==document.body&&t!==document.documentElement;){if(t.closest("[data-feedback-toolbar]"))return null;if($6.has(t.tagName.toLowerCase())){t=t.parentElement;continue}let n=t.getBoundingClientRect();if(n.width>=p2&&n.height>=p2)return t;t=t.parentElement}return null}function U6({rearrangeState:e,onChange:t,isDarkMode:n,exiting:l,className:o,blankCanvas:a,extraSnapRects:i,onSelectionChange:r,deselectSignal:s,onDragMove:d,onDragEnd:f,clearing:h}){let{sections:_}=e,b=(0,ke.useRef)(e);b.current=e;let[w,N]=(0,ke.useState)(new Set);(0,ke.useEffect)(()=>{h&&N(new Set)},[h]);let M=(0,ke.useRef)(s);(0,ke.useEffect)(()=>{s!==M.current&&(M.current=s,N(new Set))},[s]);let[y,x]=(0,ke.useState)(null),[g,k]=(0,ke.useState)(!1),I=(0,ke.useRef)(!1),J=(0,ke.useCallback)(T=>{let A=_.find($=>$.id===T);A&&(I.current=!!A.note,x(T),k(!1))},[_]),L=(0,ke.useCallback)(()=>{y&&(k(!0),st(()=>{x(null),k(!1)},150))},[y]),F=(0,ke.useCallback)(T=>{y&&(t({...e,sections:_.map(A=>A.id===y?{...A,note:T.trim()||void 0}:A)}),L())},[y,_,e,t,L]);(0,ke.useEffect)(()=>{l&&y&&L()},[l]);let[Y,Z]=(0,ke.useState)(new Set),re=(0,ke.useRef)(new Map),[K,_e]=(0,ke.useState)(null),[oe,se]=(0,ke.useState)(null),[he,Ht]=(0,ke.useState)([]),[Ye,tt]=(0,ke.useState)(0),je=(0,ke.useRef)(null),St=(0,ke.useRef)(new Set),_n=(0,ke.useRef)(new Map),[$n,De]=(0,ke.useState)(new Map),[Ml,_o]=(0,ke.useState)(new Map),Ho=(0,ke.useRef)(new Set),$o=(0,ke.useRef)(new Map),fo=(0,ke.useRef)(r);fo.current=r;let ho=(0,ke.useRef)(d);ho.current=d;let mo=(0,ke.useRef)(f);mo.current=f,(0,ke.useEffect)(()=>{a&&N(new Set)},[a]);let[Vt,El]=(0,ke.useState)(()=>!e.sections.some(T=>{let A=T.originalRect,$=T.currentRect;return Math.abs(A.x-$.x)>1||Math.abs(A.y-$.y)>1||Math.abs(A.width-$.width)>1||Math.abs(A.height-$.height)>1}));(0,ke.useEffect)(()=>{if(!Vt){let T=st(()=>El(!0),380);return()=>clearTimeout(T)}},[]);let Yl=(0,ke.useRef)(new Set);(0,ke.useEffect)(()=>{Yl.current=new Set(_.map(T=>T.selector))},[_]),(0,ke.useEffect)(()=>{let T=()=>tt(window.scrollY);return T(),window.addEventListener("scroll",T,{passive:!0}),window.addEventListener("resize",T,{passive:!0}),()=>{window.removeEventListener("scroll",T),window.removeEventListener("resize",T)}},[]),(0,ke.useEffect)(()=>{let T=A=>{if(je.current){_e(null);return}let $=document.elementFromPoint(A.clientX,A.clientY);if(!$){_e(null);return}if($.closest("[data-feedback-toolbar]")){_e(null);return}if($.closest("[data-design-placement]")){_e(null);return}if($.closest("[data-annotation-popup]")){_e(null);return}let X=v2($);if(!X){_e(null);return}for(let ee of Yl.current)try{let G=document.querySelector(ee);if(G&&(G===X||X.contains(G))){_e(null);return}}catch{}let P=X.getBoundingClientRect();_e({x:P.x,y:P.y,w:P.width,h:P.height})};return document.addEventListener("mousemove",T,{passive:!0}),()=>document.removeEventListener("mousemove",T)},[_]),(0,ke.useEffect)(()=>{let T=document.body.style.userSelect;return document.body.style.webkitUserSelect="none",document.body.style.userSelect="none",()=>{document.body.style.webkitUserSelect=T,document.body.style.userSelect=T}},[]),(0,ke.useEffect)(()=>{let T=A=>{if(je.current||A.button!==0)return;let $=A.composedPath()[0]??A.target;if(!$||$.closest("[data-feedback-toolbar]")||$.closest("[data-design-placement]")||$.closest("[data-annotation-popup]"))return;let X=v2($),P=!1;if(X)for(let G of Yl.current)try{let ce=document.querySelector(G);if(ce&&(ce===X||X.contains(ce))){P=!0;break}}catch{}let ee=!!(A.shiftKey||A.metaKey||A.ctrlKey);if(X&&!P){A.preventDefault(),A.stopPropagation();let G=H6(X),ce=[..._,G],we=[...e.originalOrder,G.id];t({...e,sections:ce,originalOrder:we});let Oe=new Set([G.id]);N(Oe),fo.current?.(Oe,ee),_e(null);let ut=A.clientX,mt=A.clientY,lt={x:G.currentRect.x,y:G.currentRect.y},qe=G.originalRect,Ae=!1,At=0,Et=0;je.current="move";let gt=ot=>{let kt=ot.clientX-ut,pt=ot.clientY-mt;if(!Ae&&(Math.abs(kt)>2||Math.abs(pt)>2)&&(Ae=!0),!Ae)return;let ae={x:lt.x+kt,y:lt.y+pt,width:G.currentRect.width,height:G.currentRect.height},Fn=b2(ae,ce,new Set([G.id]),i);Ht(Fn.guides);let Un=kt+Fn.dx,Sn=pt+Fn.dy;At=Un,Et=Sn;let jl=q().querySelector(`[data-rearrange-section="${G.id}"]`);jl&&(jl.style.transform=`translate(${Un}px, ${Sn}px)`),De(new Map([[G.id,{x:lt.x+Un,y:lt.y+Sn,width:G.currentRect.width,height:G.currentRect.height}]])),ho.current?.(Un,Sn)},Be=()=>{window.removeEventListener("mousemove",gt),window.removeEventListener("mouseup",Be),je.current=null,Ht([]),De(new Map);let ot=q().querySelector(`[data-rearrange-section="${G.id}"]`);ot&&(ot.style.transform=""),Ae&&t({...e,sections:ce.map(kt=>kt.id===G.id?{...kt,currentRect:{...kt.currentRect,x:Math.max(0,lt.x+At),y:Math.max(0,lt.y+Et)}}:kt),originalOrder:we}),mo.current?.(At,Et,Ae)};window.addEventListener("mousemove",gt),window.addEventListener("mouseup",Be)}else if(P&&X){A.preventDefault();for(let G of _)try{let ce=document.querySelector(G.selector);if(ce&&ce===X){let we=new Set([G.id]);N(we),fo.current?.(we,ee);return}}catch{}ee||(N(new Set),fo.current?.(new Set,!1))}else ee||(N(new Set),fo.current?.(new Set,!1))};return document.addEventListener("mousedown",T,!0),()=>document.removeEventListener("mousedown",T,!0)},[_,e,t]),(0,ke.useEffect)(()=>{let T=A=>{let $=A.composedPath()[0]||A.target;if(!($.tagName==="INPUT"||$.tagName==="TEXTAREA"||$.isContentEditable)){if((A.key==="Backspace"||A.key==="Delete")&&w.size>0){A.preventDefault();let X=new Set(w);Z(P=>{let ee=new Set(P);for(let G of X)ee.add(G);return ee}),N(new Set),st(()=>{let P=b.current;t({...P,sections:P.sections.filter(ee=>!X.has(ee.id)),originalOrder:P.originalOrder.filter(ee=>!X.has(ee))}),Z(ee=>{let G=new Set(ee);for(let ce of X)G.delete(ce);return G})},180);return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(A.key)&&w.size>0){A.preventDefault();let X=A.shiftKey?20:1,P=A.key==="ArrowLeft"?-X:A.key==="ArrowRight"?X:0,ee=A.key==="ArrowUp"?-X:A.key==="ArrowDown"?X:0;t({...e,sections:_.map(G=>w.has(G.id)?{...G,currentRect:{...G.currentRect,x:Math.max(0,G.currentRect.x+P),y:Math.max(0,G.currentRect.y+ee)}}:G)});return}A.key==="Escape"&&w.size>0&&N(new Set)}};return document.addEventListener("keydown",T),()=>document.removeEventListener("keydown",T)},[w,_,e,t]);let Sa=(0,ke.useCallback)((T,A)=>{if(T.button!==0)return;let $=T.target;if($.closest(`.${B.handle}`)||$.closest(`.${B.deleteButton}`))return;T.preventDefault(),T.stopPropagation();let X;T.shiftKey||T.metaKey||T.ctrlKey?(X=new Set(w),X.has(A)?X.delete(A):X.add(A)):w.has(A)?X=new Set(w):X=new Set([A]),N(X),(X.size!==w.size||[...X].some(Ae=>!w.has(Ae)))&&fo.current?.(X,!!(T.shiftKey||T.metaKey||T.ctrlKey));let ee=T.clientX,G=T.clientY,ce=new Map;for(let Ae of _)X.has(Ae.id)&&ce.set(Ae.id,{x:Ae.currentRect.x,y:Ae.currentRect.y});je.current="move";let we=!1,Oe=0,ut=0,mt=new Map;for(let Ae of _)if(X.has(Ae.id)){let At=q().querySelector(`[data-rearrange-section="${Ae.id}"]`);mt.set(Ae.id,{outlineEl:At,curW:Ae.currentRect.width,curH:Ae.currentRect.height})}let lt=Ae=>{let At=Ae.clientX-ee,Et=Ae.clientY-G;if(At===0&&Et===0)return;we=!0;let gt=1/0,Be=1/0,ot=-1/0,kt=-1/0;for(let[Sn,{curW:jl,curH:yo}]of mt){let Tl=ce.get(Sn);if(!Tl)continue;let cl=Tl.x+At,Rr=Tl.y+Et;gt=Math.min(gt,cl),Be=Math.min(Be,Rr),ot=Math.max(ot,cl+jl),kt=Math.max(kt,Rr+yo)}let pt=b2({x:gt,y:Be,width:ot-gt,height:kt-Be},_,X,i),ae=At+pt.dx,Fn=Et+pt.dy;Oe=ae,ut=Fn,Ht(pt.guides);for(let[,{outlineEl:Sn}]of mt)Sn&&(Sn.style.transform=`translate(${ae}px, ${Fn}px)`);let Un=new Map;for(let[Sn,{curW:jl,curH:yo}]of mt){let Tl=ce.get(Sn);if(Tl){let cl={x:Math.max(0,Tl.x+ae),y:Math.max(0,Tl.y+Fn),width:jl,height:yo};Un.set(Sn,cl)}}De(Un),ho.current?.(ae,Fn)},qe=Ae=>{window.removeEventListener("mousemove",lt),window.removeEventListener("mouseup",qe),je.current=null,Ht([]),De(new Map);for(let[,{outlineEl:At}]of mt)At&&(At.style.transform="");if(we){let At=Ae.clientX-ee,Et=Ae.clientY-G;if(Math.abs(At)<5&&Math.abs(Et)<5)t({...e,sections:_.map(gt=>{let Be=ce.get(gt.id);return Be?{...gt,currentRect:{...gt.currentRect,x:Be.x,y:Be.y}}:gt})});else{t({...e,sections:_.map(gt=>{let Be=ce.get(gt.id);return Be?{...gt,currentRect:{...gt.currentRect,x:Math.max(0,Be.x+Oe),y:Math.max(0,Be.y+ut)}}:gt})}),mo.current?.(Oe,ut,!0);return}}mo.current?.(0,0,!1)};window.addEventListener("mousemove",lt),window.addEventListener("mouseup",qe)},[w,_,e,t]),sl=(0,ke.useCallback)((T,A,$)=>{T.preventDefault(),T.stopPropagation();let X=_.find(qe=>qe.id===A);if(!X)return;N(new Set([A])),je.current="resize";let P=T.clientX,ee=T.clientY,G={...X.currentRect},ce=X.originalRect,we=G.width/G.height,Oe={...G},ut=q().querySelector(`[data-rearrange-section="${A}"]`),mt=qe=>{let Ae=qe.clientX-P,At=qe.clientY-ee,Et=G.x,gt=G.y,Be=G.width,ot=G.height;if($.includes("e")&&(Be=Math.max(xd,G.width+Ae)),$.includes("w")&&(Be=Math.max(xd,G.width-Ae),Et=G.x+G.width-Be),$.includes("s")&&(ot=Math.max(xd,G.height+At)),$.includes("n")&&(ot=Math.max(xd,G.height-At),gt=G.y+G.height-ot),qe.shiftKey)if($.length===2){let pt=Math.abs(Be-G.width),ae=Math.abs(ot-G.height);pt>ae?ot=Be/we:Be=ot*we,$.includes("w")&&(Et=G.x+G.width-Be),$.includes("n")&&(gt=G.y+G.height-ot)}else $==="e"||$==="w"?ot=Be/we:Be=ot*we,$==="w"&&(Et=G.x+G.width-Be),$==="n"&&(gt=G.y+G.height-ot);Oe={x:Et,y:gt,width:Be,height:ot},ut&&(ut.style.left=`${Et}px`,ut.style.top=`${gt-Ye}px`,ut.style.width=`${Be}px`,ut.style.height=`${ot}px`),se({x:qe.clientX+12,y:qe.clientY+12,text:`${Math.round(Be)} \xD7 ${Math.round(ot)}`}),De(new Map([[A,Oe]]))},lt=()=>{window.removeEventListener("mousemove",mt),window.removeEventListener("mouseup",lt),se(null),je.current=null,De(new Map),t({...e,sections:_.map(qe=>qe.id===A?{...qe,currentRect:Oe}:qe)})};window.addEventListener("mousemove",mt),window.addEventListener("mouseup",lt)},[_,e,t,Ye]),go=(0,ke.useCallback)(T=>{Z(A=>{let $=new Set(A);return $.add(T),$}),N(A=>{let $=new Set(A);return $.delete(T),$}),st(()=>{let A=b.current;t({...A,sections:A.sections.filter($=>$.id!==T),originalOrder:A.originalOrder.filter($=>$!==T)}),Z($=>{let X=new Set($);return X.delete(T),X})},180)},[t]),W=T=>{let A=T.originalRect,$=T.currentRect;return Math.abs(A.x-$.x)>1||Math.abs(A.y-$.y)>1||Math.abs(A.width-$.width)>1||Math.abs(A.height-$.height)>1},fe=T=>{let A=T.originalRect,$=T.currentRect;return Math.abs(A.x-$.x)>1||Math.abs(A.y-$.y)>1},Re=T=>{let A=T.originalRect,$=T.currentRect;return Math.abs(A.width-$.width)>1||Math.abs(A.height-$.height)>1};for(let T of _)_n.current.has(T.id)||(fe(T)?_n.current.set(T.id,"move"):Re(T)&&_n.current.set(T.id,"resize"));for(let T of _n.current.keys())_.some(A=>A.id===T)||_n.current.delete(T);let Ce=_.filter(T=>{try{if(Y.has(T.id)||w.has(T.id))return!0;let A=document.querySelector(T.selector);if(!A)return!1;let $=A.getBoundingClientRect(),X=T.originalRect;return Math.abs($.width-X.width)+Math.abs($.height-X.height)<200}catch{return!1}}),xe=Ce.filter(T=>W(T)),nt=Ce.filter(T=>!W(T)),Xe=new Set(xe.map(T=>T.id));for(let T of St.current)Xe.has(T)||St.current.delete(T);let Ke=[...Xe].sort().join(",");for(let T of xe)$o.current.set(T.id,{currentRect:T.currentRect,originalRect:T.originalRect,isFixed:T.isFixed});(0,ke.useEffect)(()=>{let T=Ho.current;Ho.current=Xe;let A=new Map;for(let $ of T)if(!Xe.has($)){if(!_.some(P=>P.id===$))continue;let X=$o.current.get($);X&&(A.set($,{orig:X.originalRect,target:X.currentRect,isFixed:X.isFixed}),$o.current.delete($))}if(A.size>0){_o(X=>{let P=new Map(X);for(let[ee,G]of A)P.set(ee,G);return P});let $=st(()=>{_o(X=>{let P=new Map(X);for(let ee of A.keys())P.delete(ee);return P})},250);return()=>clearTimeout($)}},[Ke,_]);let Fe=(0,ke.useRef)(null),q=()=>Fe.current?.getRootNode()??document;return(0,Ze.jsxs)(Ze.Fragment,{children:[(0,Ze.jsxs)("div",{ref:Fe,className:`${B.rearrangeOverlay} ${n?"":B.light} ${l?B.overlayExiting:""}${o?` ${o}`:""}`,"data-feedback-toolbar":!0,children:[K&&(0,Ze.jsx)("div",{className:B.hoverHighlight,style:{left:K.x,top:K.y,width:K.w,height:K.h}}),nt.map(T=>{let A=T.currentRect,$=T.isFixed?A.y:A.y-Ye,X=g2,P=w.has(T.id);return(0,Ze.jsxs)("div",{"data-rearrange-section":T.id,className:`${B.sectionOutline} ${P?B.selected:""} ${h||l||Y.has(T.id)?B.exiting:""}`,style:{left:A.x,top:$,width:A.width,height:A.height,borderColor:X.border,backgroundColor:X.bg,...Vt?{}:{opacity:0,animation:"none",transition:"none"}},onMouseDown:ee=>Sa(ee,T.id),onDoubleClick:()=>J(T.id),children:[(0,Ze.jsx)("span",{className:B.sectionLabel,style:{backgroundColor:X.pill},children:T.label}),(0,Ze.jsx)("span",{className:`${B.sectionAnnotation} ${T.note?B.annotationVisible:""}`,children:(T.note&&re.current.set(T.id,T.note),T.note||re.current.get(T.id)||"")}),(0,Ze.jsxs)("span",{className:B.sectionDimensions,children:[Math.round(A.width)," \xD7 ",Math.round(A.height)]}),(0,Ze.jsx)("div",{className:B.deleteButton,onMouseDown:ee=>ee.stopPropagation(),onClick:()=>go(T.id),children:"\u2715"}),y2.map(ee=>(0,Ze.jsx)("div",{className:`${B.handle} ${B[`handle${ee.charAt(0).toUpperCase()}${ee.slice(1)}`]}`,onMouseDown:G=>sl(G,T.id,ee)},ee))]},T.id)}),xe.map(T=>{let A=T.currentRect,$=T.isFixed?A.y:A.y-Ye,X=w.has(T.id),P=fe(T),ee=Re(T);if(a&&!X)return null;let ce=!St.current.has(T.id);return ce&&St.current.add(T.id),(0,Ze.jsxs)("div",{"data-rearrange-section":T.id,className:`${B.ghostOutline} ${X?B.selected:""} ${h||l||Y.has(T.id)?B.exiting:""}`,style:{left:A.x,top:$,width:A.width,height:A.height,...Vt?{}:{opacity:0,animation:"none",transition:"none"},...ce?{}:{animation:"none"}},onMouseDown:we=>Sa(we,T.id),onDoubleClick:()=>J(T.id),children:[(0,Ze.jsx)("span",{className:B.sectionLabel,style:{backgroundColor:g2.pill},children:T.label}),(0,Ze.jsx)("span",{className:`${B.sectionAnnotation} ${T.note?B.annotationVisible:""}`,children:(T.note&&re.current.set(T.id,T.note),T.note||re.current.get(T.id)||"")}),(0,Ze.jsxs)("span",{className:B.sectionDimensions,children:[Math.round(A.width)," \xD7 ",Math.round(A.height)]}),(0,Ze.jsx)("div",{className:B.deleteButton,onMouseDown:we=>we.stopPropagation(),onClick:()=>go(T.id),children:"\u2715"}),y2.map(we=>(0,Ze.jsx)("div",{className:`${B.handle} ${B[`handle${we.charAt(0).toUpperCase()}${we.slice(1)}`]}`,onMouseDown:Oe=>sl(Oe,T.id,we)},we)),(0,Ze.jsx)("span",{className:B.ghostBadge,children:(()=>{let we=_n.current.get(T.id);if(P&&ee){let[Oe,ut]=we==="resize"?["Resize","Move"]:["Move","Resize"];return(0,Ze.jsxs)(Ze.Fragment,{children:["Suggested ",Oe," ",(0,Ze.jsxs)("span",{className:B.ghostBadgeExtra,children:["& ",ut]})]})}return`Suggested ${ee?"Resize":"Move"}`})()})]},T.id)})]}),!a&&(()=>{let T=[];for(let A of xe){let $=$n.get(A.id);T.push({id:A.id,orig:A.originalRect,target:$||A.currentRect,isFixed:A.isFixed,isSelected:w.has(A.id),isExiting:Y.has(A.id)})}for(let[A,$]of $n)if(!T.some(X=>X.id===A)){let X=_.find(P=>P.id===A);X&&T.push({id:A,orig:X.originalRect,target:$,isFixed:X.isFixed,isSelected:w.has(A)})}for(let[A,$]of Ml)T.some(X=>X.id===A)||T.push({id:A,orig:$.orig,target:$.target,isFixed:$.isFixed,isSelected:!1,isExiting:!0});return T.length===0?null:(0,Ze.jsxs)("svg",{className:`${B.connectorSvg} ${h||l?B.connectorExiting:""}`,children:[T.map(({id:A,orig:$,target:X,isFixed:P,isSelected:ee,isExiting:G})=>{let ce=$.x+$.width/2,we=(P?$.y:$.y-Ye)+$.height/2,Oe=X.x+X.width/2,ut=(P?X.y:X.y-Ye)+X.height/2,mt=Oe-ce,lt=ut-we,qe=Math.sqrt(mt*mt+lt*lt);if(qe<2)return null;let Ae=Math.min(1,qe/40),At=Math.min(qe*.3,60),Et=qe>0?-lt/qe:0,gt=qe>0?mt/qe:0,Be=(ce+Oe)/2+Et*At,ot=(we+ut)/2+gt*At,kt=$n.has(A),pt=kt||ee?1:.4,ae=kt||ee?1:.5;return(0,Ze.jsxs)("g",{className:G?B.connectorExiting:"",children:[(0,Ze.jsx)("path",{className:B.connectorLine,d:`M ${ce} ${we} Q ${Be} ${ot} ${Oe} ${ut}`,fill:"none",stroke:"rgba(59, 130, 246, 0.45)",strokeWidth:"1.5",opacity:pt*Ae}),(0,Ze.jsx)("circle",{className:B.connectorDot,cx:ce,cy:we,r:4*Ae,fill:"rgba(59, 130, 246, 0.8)",stroke:"#fff",strokeWidth:"1.5",opacity:ae*Ae,filter:"url(#connDotShadow)"}),(0,Ze.jsx)("circle",{className:B.connectorDot,cx:Oe,cy:ut,r:4*Ae,fill:"rgba(59, 130, 246, 0.8)",stroke:"#fff",strokeWidth:"1.5",opacity:ae*Ae,filter:"url(#connDotShadow)"})]},`conn-${A}`)}),(0,Ze.jsx)("defs",{children:(0,Ze.jsx)("filter",{id:"connDotShadow",x:"-50%",y:"-50%",width:"200%",height:"200%",children:(0,Ze.jsx)("feDropShadow",{dx:"0",dy:"0.5",stdDeviation:"1",floodOpacity:"0.15"})})})]})})(),y&&(()=>{let T=_.find(ut=>ut.id===y);if(!T)return null;let A=T.currentRect,$=T.isFixed?A.y:A.y-Ye,X=A.x+A.width/2,P=$-8,ee=$+A.height+8,G=P>200,ce=ee<window.innerHeight-100,we=Math.max(160,Math.min(window.innerWidth-160,X)),Oe;return G?Oe={left:we,bottom:window.innerHeight-P}:ce?Oe={left:we,top:ee}:Oe={left:we,top:Math.max(80,window.innerHeight/2-80)},(0,Ze.jsx)(Ih,{element:T.label,placeholder:"Add a note about this section",initialValue:T.note??"",submitLabel:I.current?"Save":"Set",onSubmit:F,onCancel:L,onDelete:I.current?()=>{F("")}:void 0,isExiting:g,lightMode:!n,style:Oe})})(),oe&&(0,Ze.jsx)("div",{className:B.sizeIndicator,style:{left:oe.x,top:oe.y},"data-feedback-toolbar":!0,children:oe.text}),he.map((T,A)=>(0,Ze.jsx)("div",{className:B.guideLine,style:T.axis==="x"?{position:"fixed",left:T.pos,top:0,width:1,height:"100vh"}:{position:"fixed",left:0,top:T.pos-Ye,width:"100vw",height:1}},`${T.axis}-${T.pos}-${A}`))]})}var Dh=new Set(["script","style","noscript","link","meta","br","hr"]);function Y6(){let e=document.querySelector("main")||document.body,t=[],n=Array.from(e.children),l=e!==document.body&&n.length<3?Array.from(document.body.children):n;for(let o of l){if(!(o instanceof HTMLElement)||Dh.has(o.tagName.toLowerCase())||o.hasAttribute("data-feedback-toolbar"))continue;let a=window.getComputedStyle(o);if(a.display==="none"||a.visibility==="hidden")continue;let i=o.getBoundingClientRect();if(!(i.height<10||i.width<10)){t.push({label:Dd(o),selector:_i(o),top:i.top,bottom:i.bottom,left:i.left,right:i.right,area:i.width*i.height});for(let r of Array.from(o.children)){if(!(r instanceof HTMLElement)||Dh.has(r.tagName.toLowerCase())||r.hasAttribute("data-feedback-toolbar"))continue;let s=window.getComputedStyle(r);if(s.display==="none"||s.visibility==="hidden")continue;let d=r.getBoundingClientRect();d.height<10||d.width<10||t.push({label:Dd(r),selector:_i(r),top:d.top,bottom:d.bottom,left:d.left,right:d.right,area:d.width*d.height})}}}return t}function j6(e){let t=window.scrollY;return e.map(({label:n,selector:l,rect:o})=>{let a=o.y-t;return{label:n,selector:l,top:a,bottom:a+o.height,left:o.x,right:o.x+o.width,area:o.width*o.height}})}function I6(e){let t=window.scrollY,n=e.y-t,l=e.x;return{top:n,bottom:n+e.height,left:l,right:l+e.width,area:e.width*e.height}}function zh(e,t){let n=t?j6(t):Y6(),l=I6(e),o=null,a=null,i=null,r=null,s=null;for(let w of n){if(Math.abs(w.left-l.left)<2&&Math.abs(w.top-l.top)<2&&Math.abs(w.right-w.left-e.width)<2&&Math.abs(w.bottom-w.top-e.height)<2)continue;w.left<=l.left+2&&w.right>=l.right-2&&w.top<=l.top+2&&w.bottom>=l.bottom-2&&w.area>l.area*1.5&&(!s||w.area<s._area)&&(s={label:w.label,selector:w.selector,_area:w.area});let N=l.right>w.left+5&&l.left<w.right-5,M=l.bottom>w.top+5&&l.top<w.bottom-5;if(N&&w.bottom<=l.top+5){let y=Math.round(l.top-w.bottom);(!o||y<o._dist)&&(o={label:w.label,selector:w.selector,gap:Math.max(0,y),_dist:y})}if(N&&w.top>=l.bottom-5){let y=Math.round(w.top-l.bottom);(!a||y<a._dist)&&(a={label:w.label,selector:w.selector,gap:Math.max(0,y),_dist:y})}if(M&&w.right<=l.left+5){let y=Math.round(l.left-w.right);(!i||y<i._dist)&&(i={label:w.label,selector:w.selector,gap:Math.max(0,y),_dist:y})}if(M&&w.left>=l.right-5){let y=Math.round(w.left-l.right);(!r||y<r._dist)&&(r={label:w.label,selector:w.selector,gap:Math.max(0,y),_dist:y})}}let d=window.innerWidth,f=window.innerHeight,h=q6(e,d),_=w=>w?{label:w.label,selector:w.selector,gap:w.gap}:null,b=X6(l,e,d,f,s?{label:s.label,selector:s.selector,_area:s._area}:null,n);return{above:_(o),below:_(a),left:_(i),right:_(r),alignment:h,containedIn:s?{label:s.label,selector:s.selector}:null,outOfBounds:b}}function X6(e,t,n,l,o,a){let i={},r=!1,s=[];if(e.left<-2&&s.push("left"),e.right>n+2&&s.push("right"),e.top<-2&&s.push("top"),e.bottom>l+2&&s.push("bottom"),s.length>0&&(i.viewport=s,r=!0),o){let d=a.find(f=>f.label===o.label&&f.selector===o.selector&&Math.abs(f.area-o._area)<10);if(d){let f=[];e.left<d.left-2&&f.push("left"),e.right>d.right+2&&f.push("right"),e.top<d.top-2&&f.push("top"),e.bottom>d.bottom+2&&f.push("bottom"),f.length>0&&(i.container={label:o.label,edges:f},r=!0)}}return r?i:null}function q6(e,t){if(e.width/t>.85)return"full-width";let l=e.x+e.width/2,o=t/2,a=l-o,i=t*.08;return Math.abs(a)<i?"center":a<0?"left":"right"}function ib(e){switch(e){case"full-width":return"full-width";case"center":return"centered";case"left":return"left-aligned";case"right":return"right-aligned"}}function rb(e,t={}){let n=[];e.above&&n.push(`Below \`${e.above.label}\`${e.above.gap>0?` (${e.above.gap}px gap)`:""}`),e.below&&n.push(`Above \`${e.below.label}\`${e.below.gap>0?` (${e.below.gap}px gap)`:""}`),t.includeLeftRight&&(e.left&&n.push(`Right of \`${e.left.label}\`${e.left.gap>0?` (${e.left.gap}px gap)`:""}`),e.right&&n.push(`Left of \`${e.right.label}\`${e.right.gap>0?` (${e.right.gap}px gap)`:""}`));let l=ib(e.alignment);return e.containedIn?n.push(`${l.charAt(0).toUpperCase()+l.slice(1)} in \`${e.containedIn.label}\``):n.push(`${l.charAt(0).toUpperCase()+l.slice(1)} in page`),t.includePixelRef&&t.pixelRef&&n.push(`Pixel ref: \`${t.pixelRef}\``),e.outOfBounds&&(e.outOfBounds.viewport&&n.push(`**Outside viewport** (${e.outOfBounds.viewport.join(", ")} edge${e.outOfBounds.viewport.length>1?"s":""})`),e.outOfBounds.container&&n.push(`**Outside \`${e.outOfBounds.container.label}\`** (${e.outOfBounds.container.edges.join(", ")} edge${e.outOfBounds.container.edges.length>1?"s":""})`)),n}function Q6(e,t,n){let l=[];e.above&&l.push(`below \`${e.above.label}\``),e.below&&l.push(`above \`${e.below.label}\``),e.left&&l.push(`right of \`${e.left.label}\``),e.right&&l.push(`left of \`${e.right.label}\``),e.containedIn&&l.push(`inside \`${e.containedIn.label}\``),l.push(ib(e.alignment)),e.outOfBounds?.viewport&&l.push(`**outside viewport** (${e.outOfBounds.viewport.join(", ")})`),e.outOfBounds?.container&&l.push(`**outside \`${e.outOfBounds.container.label}\`** (${e.outOfBounds.container.edges.join(", ")})`);let o=n?`, ${Math.round(n.width)}\xD7${Math.round(n.height)}px`:"";return`at (${Math.round(t.x)}, ${Math.round(t.y)})${o}: ${l.join(", ")}`}var x2=15;function w2(e){if(e.length<2)return[];let t=[],n=new Set;for(let l=0;l<e.length;l++){if(n.has(l))continue;let o=[l];for(let a=l+1;a<e.length;a++)n.has(a)||Math.abs(e[l].rect.y-e[a].rect.y)<x2&&o.push(a);if(o.length>=2){let a=o.map(s=>e[s]);a.sort((s,d)=>s.rect.x-d.rect.x);let i=[];for(let s=0;s<a.length-1;s++)i.push(Math.round(a[s+1].rect.x-(a[s].rect.x+a[s].rect.width)));let r=Math.round(a.reduce((s,d)=>s+d.rect.y,0)/a.length);t.push({labels:a.map(s=>s.label),type:"row",sharedEdge:r,gaps:i,avgGap:i.length?Math.round(i.reduce((s,d)=>s+d,0)/i.length):0}),o.forEach(s=>n.add(s))}}for(let l=0;l<e.length;l++){if(n.has(l))continue;let o=[l];for(let a=l+1;a<e.length;a++)n.has(a)||Math.abs(e[l].rect.x-e[a].rect.x)<x2&&o.push(a);if(o.length>=2){let a=o.map(s=>e[s]);a.sort((s,d)=>s.rect.y-d.rect.y);let i=[];for(let s=0;s<a.length-1;s++)i.push(Math.round(a[s+1].rect.y-(a[s].rect.y+a[s].rect.height)));let r=Math.round(a.reduce((s,d)=>s+d.rect.x,0)/a.length);t.push({labels:a.map(s=>s.label),type:"column",sharedEdge:r,gaps:i,avgGap:i.length?Math.round(i.reduce((s,d)=>s+d,0)/i.length):0}),o.forEach(s=>n.add(s))}}return t}function G6(e){if(e.length<2)return[];let t=w2(e.map(i=>({label:i.label,rect:i.originalRect}))),n=w2(e.map(i=>({label:i.label,rect:i.currentRect}))),l=[],o=new Set;for(let i of t){let r=new Set(i.labels),s=null,d=0;for(let f of n){let h=f.labels.filter(_=>r.has(_)).length;h>=2&&h>d&&(s=f,d=h)}if(s){let f=s.labels.filter(_=>r.has(_)),h=f.join(", ");if(s.type!==i.type){let _=i.type==="row"?"y":"x",b=s.type==="row"?"y":"x";l.push(`**${h}**: ${i.type} (${_}\u2248${i.sharedEdge}, ${i.avgGap}px gaps) \u2192 ${s.type} (${b}\u2248${s.sharedEdge}, ${s.avgGap}px gaps)`)}else if(Math.abs(i.sharedEdge-s.sharedEdge)>20||Math.abs(i.avgGap-s.avgGap)>5){let _=i.type==="row"?"y":"x",b=Math.abs(i.sharedEdge-s.sharedEdge)>20?` ${_}: ${i.sharedEdge} \u2192 ${s.sharedEdge}`:"",w=Math.abs(i.avgGap-s.avgGap)>5?` gaps: ${i.avgGap}px \u2192 ${s.avgGap}px`:"";l.push(`**${h}**: ${i.type} shifted \u2014${b}${w}`)}f.forEach(_=>o.add(_))}else{let f=i.labels.join(", "),h=i.type==="row"?"y":"x";l.push(`**${f}**: ${i.type} (${h}\u2248${i.sharedEdge}) dissolved`),i.labels.forEach(_=>o.add(_))}}for(let i of n){if(i.labels.every(d=>o.has(d))||i.labels.filter(d=>!o.has(d)).length<2)continue;if(!t.some(d=>d.labels.filter(h=>i.labels.includes(h)).length>=2)){let d=i.type==="row"?"y":"x";l.push(`**${i.labels.join(", ")}**: new ${i.type} (${d}\u2248${i.sharedEdge}, ${i.avgGap}px gaps)`),i.labels.forEach(f=>o.add(f))}}let a=e.filter(i=>!o.has(i.label));if(a.length>=2){let i={};for(let r of a){let s=Math.round(r.currentRect.x/5)*5;(i[s]??(i[s]=[])).push(r.label)}for(let[r,s]of Object.entries(i))s.length>=2&&l.push(`**${s.join(", ")}**: shared left edge at x\u2248${r}`)}return l}function sb(e){if(typeof document>"u")return{viewport:e,contentArea:null};let t=[],n=new Set,l=r=>{n.has(r)||r instanceof HTMLElement&&(r.hasAttribute("data-feedback-toolbar")||Dh.has(r.tagName.toLowerCase())||(n.add(r),t.push(r)))},o=document.querySelector("main");o&&l(o);let a=document.querySelector("[role='main']");a&&l(a);for(let r of Array.from(document.body.children))if(l(r),r.children){for(let s of Array.from(r.children))if(l(s),s.children)for(let d of Array.from(s.children))l(d)}let i=null;for(let r of t){let s=r.getBoundingClientRect();if(s.height<50)continue;let d=getComputedStyle(r);if(d.maxWidth&&d.maxWidth!=="none"&&d.maxWidth!=="0px"){(!i||s.width<i.rect.width)&&(i={el:r,rect:s});continue}!i&&s.width<e.width-20&&s.width>100&&(i={el:r,rect:s})}if(i){let{el:r,rect:s}=i;return{viewport:e,contentArea:{width:Math.round(s.width),left:Math.round(s.left),right:Math.round(s.right),centerX:Math.round(s.left+s.width/2),selector:_i(r)}}}return{viewport:e,contentArea:null}}function V6(e){if(typeof document>"u")return null;let t=document.querySelector(e);if(!t?.parentElement)return null;let n=getComputedStyle(t.parentElement),l={parentDisplay:n.display,parentSelector:_i(t.parentElement)};return n.display.includes("flex")&&(l.flexDirection=n.flexDirection),n.display.includes("grid")&&n.gridTemplateColumns!=="none"&&(l.gridCols=n.gridTemplateColumns),n.gap&&n.gap!=="normal"&&n.gap!=="0px"&&(l.gap=n.gap),l}function cb(e,t){let n=t.contentArea,l=n?n.width:t.viewport.width,o=n?n.left:0,a=n?n.centerX:Math.round(t.viewport.width/2),i=Math.round(e.x-o),r=Math.round(o+l-(e.x+e.width)),s=(e.width/l*100).toFixed(1),d=e.x+e.width/2,f=Math.abs(d-a)<20,h=e.width/l>.95,_=[];return h?_.push("`width: 100%` of container"):_.push(`left \`${i}px\` in container, right \`${r}px\`, width \`${s}%\` (\`${Math.round(e.width)}px\`)`),f&&!h&&_.push("centered \u2014 `margin-inline: auto`"),_.join(" \u2014 ")}function ub(e){let{viewport:t,contentArea:n}=e,l=`### Reference Frame
`;if(l+=`- Viewport: \`${t.width}\xD7${t.height}px\`
`,n){let o=n;l+=`- Content area: \`${o.width}px\` wide, left edge at \`x=${o.left}\`, right at \`x=${o.right}\` (\`${o.selector}\`)
`,l+=`- Pixel \u2192 CSS translation:
`,l+=`  - **Horizontal position in container**: \`element.x - ${o.left}\` \u2192 use as \`margin-left\` or \`left\`
`,l+=`  - **Width as % of container**: \`element.width / ${o.width} \xD7 100\` \u2192 use as \`width: X%\`
`,l+="  - **Vertical gap between elements**: `nextElement.y - (prevElement.y + prevElement.height)` \u2192 use as `margin-top` or `gap`\n",l+=`  - **Centered**: if \`|element.centerX - ${o.centerX}| < 20px\` \u2192 use \`margin-inline: auto\`
`}else l+=`- No distinct content container \u2014 elements positioned relative to full viewport
`,l+=`- Pixel \u2192 CSS translation:
`,l+=`  - **Width as % of viewport**: \`element.width / ${t.width} \xD7 100\` \u2192 use as \`width: X%\`
`,l+=`  - **Centered**: if \`|(element.x + element.width/2) - ${Math.round(t.width/2)}| < 20px\` \u2192 use \`margin-inline: auto\`
`;return l+=`
`,l}function W6(e){let t=V6(e);if(!t)return null;let n=`\`${t.parentDisplay}\``;return t.flexDirection&&(n+=`, flex-direction: \`${t.flexDirection}\``),t.gridCols&&(n+=`, grid-template-columns: \`${t.gridCols}\``),t.gap&&(n+=`, gap: \`${t.gap}\``),`Parent: ${n} (\`${t.parentSelector}\`)`}function S2(e,t,n,l="standard"){if(e.length===0)return"";let o=[...e].sort((M,y)=>Math.abs(M.y-y.y)<20?M.x-y.x:M.y-y.y),a="";if(n?.blankCanvas?(a+=`## Wireframe: New Page

`,n.wireframePurpose&&(a+=`> **Purpose:** ${n.wireframePurpose}
>
`),a+=`> ${e.length} component${e.length!==1?"s":""} placed \u2014 this is a standalone wireframe, not related to the current page.
>
> This wireframe is a rough sketch for exploring ideas.

`):a+=`## Design Layout

> ${e.length} component${e.length!==1?"s":""} placed

`,l==="compact")return a+=`### Components
`,o.forEach((M,y)=>{let x=Ul[M.type]?.label||M.type;a+=`${y+1}. **${x}** \u2014 \`${Math.round(M.width)}\xD7${Math.round(M.height)}px\` at \`(${Math.round(M.x)}, ${Math.round(M.y)})\`
`,M.text&&(a+=`   - Note: "${M.text}"
`)}),a;let i=sb(t);a+=ub(i),a+=`### Components
`,o.forEach((M,y)=>{let x=Ul[M.type]?.label||M.type,g={x:M.x,y:M.y,width:M.width,height:M.height};a+=`${y+1}. **${x}** \u2014 \`${Math.round(M.width)}\xD7${Math.round(M.height)}px\` at \`(${Math.round(M.x)}, ${Math.round(M.y)})\`
`,M.text&&(a+=`   - Note: "${M.text}"
`);let k=zh(g),J=rb(k,{includeLeftRight:l==="detailed"||l==="forensic"});for(let F of J)a+=`   - ${F}
`;let L=cb(g,i);L&&(a+=`   - CSS: ${L}
`)}),a+=`
### Layout Analysis
`;let r=[];for(let M of o){let y=r.find(x=>Math.abs(x.y-M.y)<30);y?y.items.push(M):r.push({y:M.y,items:[M]})}if(r.sort((M,y)=>M.y-y.y),r.forEach((M,y)=>{M.items.sort((g,k)=>g.x-k.x);let x=M.items.map(g=>Ul[g.type]?.label||g.type);if(M.items.length===1){let k=M.items[0].width>t.width*.8;a+=`- Row ${y+1} (y\u2248${Math.round(M.y)}): ${x[0]}${k?" \u2014 full width":""}
`}else a+=`- Row ${y+1} (y\u2248${Math.round(M.y)}): ${x.join(" | ")} \u2014 ${M.items.length} items side by side
`}),l==="detailed"||l==="forensic"){a+=`
### Spacing & Gaps
`;for(let M=0;M<o.length-1;M++){let y=o[M],x=o[M+1],g=Ul[y.type]?.label||y.type,k=Ul[x.type]?.label||x.type,I=Math.round(x.y-(y.y+y.height)),J=Math.round(x.x-(y.x+y.width));Math.abs(y.y-x.y)<30?a+=`- ${g} \u2192 ${k}: \`${J}px\` horizontal gap
`:a+=`- ${g} \u2192 ${k}: \`${I}px\` vertical gap
`}if(l==="forensic"&&o.length>2){a+=`
### All Pairwise Gaps
`;for(let M=0;M<o.length;M++)for(let y=M+1;y<o.length;y++){let x=o[M],g=o[y],k=Ul[x.type]?.label||x.type,I=Ul[g.type]?.label||g.type,J=Math.round(g.y-(x.y+x.height)),L=Math.round(g.x-(x.x+x.width));a+=`- ${k} \u2194 ${I}: h=\`${L}px\` v=\`${J}px\`
`}}l==="forensic"&&(a+=`
### Z-Order (placement order)
`,e.forEach((M,y)=>{let x=Ul[M.type]?.label||M.type;a+=`${y}. ${x} at \`(${Math.round(M.x)}, ${Math.round(M.y)})\`
`}))}a+=`
### Suggested Implementation
`;let s=o.some(M=>M.type==="navigation"),d=o.some(M=>M.type==="hero"),f=o.some(M=>M.type==="sidebar"),h=o.some(M=>M.type==="footer"),_=o.filter(M=>M.type==="card"),b=o.filter(M=>M.type==="form"),w=o.filter(M=>M.type==="table"),N=o.filter(M=>M.type==="modal");if(s&&(a+=`- Top navigation bar with logo + nav links + CTA
`),d&&(a+=`- Hero section with heading, subtext, and call-to-action
`),f&&(a+=`- Sidebar layout \u2014 use CSS Grid with sidebar + main content area
`),_.length>1?a+=`- ${_.length}-column card grid \u2014 use CSS Grid or Flexbox
`:_.length===1&&(a+=`- Card component with image + content area
`),b.length>0&&(a+=`- ${b.length} form${b.length>1?"s":""} \u2014 add proper labels, validation, and submit handling
`),w.length>0&&(a+=`- Data table \u2014 consider sortable columns and pagination
`),N.length>0&&(a+=`- Modal dialog \u2014 add overlay backdrop and focus trapping
`),h&&(a+=`- Multi-column footer with links
`),l==="detailed"||l==="forensic"){if(a+=`
### CSS Suggestions
`,f){let M=o.find(y=>y.type==="sidebar");a+=`- \`display: grid; grid-template-columns: ${Math.round(M.width)}px 1fr;\`
`}if(_.length>1){let M=Math.round(_[0].width);a+=`- \`display: grid; grid-template-columns: repeat(${_.length}, ${M}px); gap: 16px;\`
`}s&&(a+="- Navigation: `position: sticky; top: 0; z-index: 50;`\n")}return a}function k2(e,t="standard",n){let{sections:l}=e,o=[];for(let f of l){let h=f.originalRect,_=f.currentRect,b=Math.abs(h.x-_.x)>1||Math.abs(h.y-_.y)>1,w=Math.abs(h.width-_.width)>1||Math.abs(h.height-_.height)>1,N=!!f.note;if(!b&&!w&&!N){t==="forensic"&&o.push({section:f,posMoved:!1,sizeChanged:!1});continue}o.push({section:f,posMoved:b,sizeChanged:w})}if(o.length===0||t!=="forensic"&&o.every(f=>!f.posMoved&&!f.sizeChanged&&!f.section.note))return"";let a=`## Suggested Layout Changes

`,i=n?n.width:typeof window<"u"?window.innerWidth:0,r=n?n.height:typeof window<"u"?window.innerHeight:0,s=sb({width:i,height:r});t!=="compact"&&(a+=ub(s)),t==="forensic"&&(a+=`> Detected at: \`${new Date(e.detectedAt).toISOString()}\`
`,a+=`> Total sections: ${l.length}

`);let d=f=>l.map(h=>({label:h.label,selector:h.selector,rect:f==="original"?h.originalRect:h.currentRect}));a+=`**Changes:**
`;for(let{section:f,posMoved:h,sizeChanged:_}of o){let b=f.originalRect,w=f.currentRect;if(!h&&!_){f.note?(a+=`- **${f.label}** \u2014 note only
`,a+=`  - Note: "${f.note}"
`):a+=`- ${f.label} \u2014 unchanged at (${Math.round(w.x)}, ${Math.round(w.y)}) ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`;continue}if(t==="compact"){h&&_?a+=`- Suggested: move **${f.label}** to (${Math.round(w.x)}, ${Math.round(w.y)}) ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`:h?a+=`- Suggested: move **${f.label}** to (${Math.round(w.x)}, ${Math.round(w.y)})
`:a+=`- Suggested: resize **${f.label}** to ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`,f.note&&(a+=`  - Note: "${f.note}"
`);continue}if(h&&_?a+=`- Suggested: move and resize **${f.label}**
`:h?a+=`- Suggested: move **${f.label}**
`:a+=`- Suggested: resize **${f.label}** from ${Math.round(b.width)}\xD7${Math.round(b.height)}px to ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`,f.note&&(a+=`  - Note: "${f.note}"
`),h){let M=zh(b,d("original")),y=zh(w,d("current")),x=_?{width:b.width,height:b.height}:void 0;a+=`  - Currently ${Q6(M,{x:b.x,y:b.y},x)}
`;let g=_?{width:w.width,height:w.height}:void 0,k=`at (${Math.round(w.x)}, ${Math.round(w.y)})`,I=g?`, ${Math.round(g.width)}\xD7${Math.round(g.height)}px`:"",L=rb(y,{includeLeftRight:t==="detailed"||t==="forensic"});if(L.length>0){a+=`  - Suggested position ${k}${I}: ${L[0]}
`;for(let Y=1;Y<L.length;Y++)a+=`    ${L[Y]}
`}else a+=`  - Suggested position ${k}${I}
`;let F=cb(w,s);F&&(a+=`  - CSS: ${F}
`)}let N=W6(f.selector);if(N&&(a+=`  - ${N}
`),a+=`  - Selector: \`${f.selector}\`
`,t==="detailed"||t==="forensic"){let M=f.className?`${f.tagName}.${f.className.split(" ")[0]}`:f.tagName;M!==f.selector&&(a+=`  - Element: \`${M}\`
`),f.role&&(a+=`  - Role: \`${f.role}\`
`),t==="forensic"&&f.textSnippet&&(a+=`  - Text: "${f.textSnippet}"
`)}t==="forensic"&&(a+=`  - Original rect: \`{ x: ${Math.round(b.x)}, y: ${Math.round(b.y)}, w: ${Math.round(b.width)}, h: ${Math.round(b.height)} }\`
`,a+=`  - Current rect: \`{ x: ${Math.round(w.x)}, y: ${Math.round(w.y)}, w: ${Math.round(w.width)}, h: ${Math.round(w.height)} }\`
`)}if(t!=="compact"){let f=o.filter(_=>_.posMoved).map(_=>({label:_.section.label,originalRect:_.section.originalRect,currentRect:_.section.currentRect})),h=G6(f);if(h.length>0){a+=`
### Layout Summary
`;for(let _ of h)a+=`- ${_}
`}}if(t!=="compact"&&l.length>1){a+=`
### All Sections (current positions)
`;let f=[...l].sort((h,_)=>Math.abs(h.currentRect.y-_.currentRect.y)<20?h.currentRect.x-_.currentRect.x:h.currentRect.y-_.currentRect.y);for(let h of f){let _=h.currentRect,b=Math.abs(_.x-h.originalRect.x)>1||Math.abs(_.y-h.originalRect.y)>1||Math.abs(_.width-h.originalRect.width)>1||Math.abs(_.height-h.originalRect.height)>1;a+=`- ${h.label}: \`${Math.round(_.width)}\xD7${Math.round(_.height)}px\` at \`(${Math.round(_.x)}, ${Math.round(_.y)})\`${b?" \u2190 suggested":""}
`}}return a}var Oh="feedback-annotations-",db=7;function Xh(e){return`${Oh}${e}`}function ba(e){if(typeof window>"u")return[];try{let t=localStorage.getItem(Xh(e));if(!t)return[];let n=JSON.parse(t),l=Date.now()-db*24*60*60*1e3;return n.filter(o=>!o.timestamp||o.timestamp>l)}catch{return[]}}function _b(e,t){if(!(typeof window>"u"))try{localStorage.setItem(Xh(e),JSON.stringify(t))}catch{}}function F6(){let e=new Map;if(typeof window>"u")return e;try{let t=Date.now()-db*24*60*60*1e3;for(let n=0;n<localStorage.length;n++){let l=localStorage.key(n);if(l?.startsWith(Oh)){let o=l.slice(Oh.length),a=localStorage.getItem(l);if(a){let r=JSON.parse(a).filter(s=>!s.timestamp||s.timestamp>t);r.length>0&&e.set(o,r)}}}}catch{}return e}function ph(e,t,n){let l=t.map(o=>({...o,_syncedTo:n}));_b(e,l)}var qh="agentation-design-";function Z6(e){if(typeof window>"u")return[];try{let t=localStorage.getItem(`${qh}${e}`);return t?JSON.parse(t):[]}catch{return[]}}function K6(e,t){if(!(typeof window>"u"))try{localStorage.setItem(`${qh}${e}`,JSON.stringify(t))}catch{}}function J6(e){if(!(typeof window>"u"))try{localStorage.removeItem(`${qh}${e}`)}catch{}}var Qh="agentation-rearrange-";function P6(e){if(typeof window>"u")return null;try{let t=localStorage.getItem(`${Qh}${e}`);return t?JSON.parse(t):null}catch{return null}}function e8(e,t){if(!(typeof window>"u"))try{localStorage.setItem(`${Qh}${e}`,JSON.stringify(t))}catch{}}function t8(e){if(!(typeof window>"u"))try{localStorage.removeItem(`${Qh}${e}`)}catch{}}var Gh="agentation-wireframe-";function n8(e){if(typeof window>"u")return null;try{let t=localStorage.getItem(`${Gh}${e}`);return t?JSON.parse(t):null}catch{return null}}function C2(e,t){if(!(typeof window>"u"))try{localStorage.setItem(`${Gh}${e}`,JSON.stringify(t))}catch{}}function Sd(e){if(!(typeof window>"u"))try{localStorage.removeItem(`${Gh}${e}`)}catch{}}var fb="agentation-session-";function Vh(e){return`${fb}${e}`}function l8(e){if(typeof window>"u")return null;try{return localStorage.getItem(Vh(e))}catch{return null}}function bh(e,t){if(!(typeof window>"u"))try{localStorage.setItem(Vh(e),t)}catch{}}function o8(e){if(!(typeof window>"u"))try{localStorage.removeItem(Vh(e))}catch{}}var Lh=`${fb}toolbar-hidden`;function a8(){if(typeof window>"u")return!1;try{return sessionStorage.getItem(Lh)==="1"}catch{return!1}}function i8(e){if(!(typeof window>"u"))try{e?sessionStorage.setItem(Lh,"1"):sessionStorage.removeItem(Lh)}catch{}}async function vh(e,t){let n=await fetch(`${e}/sessions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:t})});if(!n.ok)throw new Error(`Failed to create session: ${n.status}`);return n.json()}async function M2(e,t){let n=await fetch(`${e}/sessions/${t}`);if(!n.ok)throw new Error(`Failed to get session: ${n.status}`);return n.json()}async function E2(e,t,n){!n.elementPath&&(n.element==="body"||n.element==="html")&&(n={...n,elementPath:n.element});let l=await fetch(`${e}/sessions/${t}/annotations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!l.ok)throw new Error(`Failed to sync annotation: ${l.status}`);return l.json()}async function xh(e,t,n){let l=await fetch(`${e}/annotations/${t}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!l.ok)throw new Error(`Failed to update annotation: ${l.status}`);return l.json()}async function kd(e,t){let n=await fetch(`${e}/annotations/${t}`,{method:"DELETE"});if(!n.ok)throw new Error(`Failed to delete annotation: ${n.status}`)}var ht={FunctionComponent:0,ClassComponent:1,IndeterminateComponent:2,HostRoot:3,HostPortal:4,HostComponent:5,HostText:6,Fragment:7,Mode:8,ContextConsumer:9,ContextProvider:10,ForwardRef:11,Profiler:12,SuspenseComponent:13,MemoComponent:14,SimpleMemoComponent:15,LazyComponent:16,IncompleteClassComponent:17,DehydratedFragment:18,SuspenseListComponent:19,ScopeComponent:21,OffscreenComponent:22,LegacyHiddenComponent:23,CacheComponent:24,TracingMarkerComponent:25,HostHoistable:26,HostSingleton:27,IncompleteFunctionComponent:28,Throw:29,ViewTransitionComponent:30,ActivityComponent:31},T2=new Set(["Component","PureComponent","Fragment","Suspense","Profiler","StrictMode","Routes","Route","Outlet","Root","ErrorBoundaryHandler","HotReload","Hot"]),N2=[/Boundary$/,/BoundaryHandler$/,/Provider$/,/Consumer$/,/^(Inner|Outer)/,/Router$/,/^Client(Page|Segment|Root)/,/^Segment(ViewNode|Node)$/,/^LayoutSegment/,/^Server(Root|Component|Render)/,/^RSC/,/Context$/,/^Hot(Reload)?$/,/^(Dev|React)(Overlay|Tools|Root)/,/Overlay$/,/Handler$/,/^With[A-Z]/,/Wrapper$/,/^Root$/],r8=[/Page$/,/View$/,/Screen$/,/Section$/,/Card$/,/List$/,/Item$/,/Form$/,/Modal$/,/Dialog$/,/Button$/,/Nav$/,/Header$/,/Footer$/,/Layout$/,/Panel$/,/Tab$/,/Menu$/];function s8(e){let t=e?.mode??"filtered",n=T2;if(e?.skipExact){let l=e.skipExact instanceof Set?e.skipExact:new Set(e.skipExact);n=new Set([...T2,...l])}return{maxComponents:e?.maxComponents??6,maxDepth:e?.maxDepth??30,mode:t,skipExact:n,skipPatterns:e?.skipPatterns?[...N2,...e.skipPatterns]:N2,userPatterns:e?.userPatterns??r8,filter:e?.filter}}function c8(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").replace(/([A-Z])([A-Z][a-z])/g,"$1-$2").toLowerCase()}function u8(e,t=10){let n=new Set,l=e,o=0;for(;l&&o<t;)l.className&&typeof l.className=="string"&&l.className.split(/\s+/).forEach(a=>{if(a.length>1){let i=a.replace(/[_][a-zA-Z0-9]{5,}.*$/,"").toLowerCase();i.length>1&&n.add(i)}}),l=l.parentElement,o++;return n}function d8(e,t){let n=c8(e);for(let l of t){if(l===n)return!0;let o=n.split("-").filter(i=>i.length>2),a=l.split("-").filter(i=>i.length>2);for(let i of o)for(let r of a)if(i===r||i.includes(r)||r.includes(i))return!0}return!1}function _8(e,t,n,l){if(n.filter)return n.filter(e,t);switch(n.mode){case"all":return!0;case"filtered":return!(n.skipExact.has(e)||n.skipPatterns.some(o=>o.test(e)));case"smart":return n.skipExact.has(e)||n.skipPatterns.some(o=>o.test(e))?!1:!!(l&&d8(e,l)||n.userPatterns.some(o=>o.test(e)));default:return!0}}var wr=null,f8=new WeakMap;function wh(e){return Object.keys(e).some(t=>t.startsWith("__reactFiber$")||t.startsWith("__reactInternalInstance$")||t.startsWith("__reactProps$"))}function h8(){if(wr!==null)return wr;if(typeof document>"u")return!1;if(document.body&&wh(document.body))return wr=!0,!0;let e=["#root","#app","#__next","[data-reactroot]"];for(let t of e){let n=document.querySelector(t);if(n&&wh(n))return wr=!0,!0}if(document.body){for(let t of document.body.children)if(wh(t))return wr=!0,!0}return wr=!1,!1}var Zs={map:f8};function m8(e){return Object.keys(e).find(n=>n.startsWith("__reactFiber$")||n.startsWith("__reactInternalInstance$"))||null}function g8(e){let t=m8(e);return t?e[t]:null}function si(e){return e?e.displayName?e.displayName:e.name?e.name:null:null}function y8(e){let{tag:t,type:n,elementType:l}=e;if(t===ht.HostComponent||t===ht.HostText||t===ht.HostHoistable||t===ht.HostSingleton||t===ht.Fragment||t===ht.Mode||t===ht.Profiler||t===ht.DehydratedFragment||t===ht.HostRoot||t===ht.HostPortal||t===ht.ScopeComponent||t===ht.OffscreenComponent||t===ht.LegacyHiddenComponent||t===ht.CacheComponent||t===ht.TracingMarkerComponent||t===ht.Throw||t===ht.ViewTransitionComponent||t===ht.ActivityComponent)return null;if(t===ht.ForwardRef){let o=l;if(o?.render){let a=si(o.render);if(a)return a}return o?.displayName?o.displayName:si(n)}if(t===ht.MemoComponent||t===ht.SimpleMemoComponent){let o=l;if(o?.type){let a=si(o.type);if(a)return a}return o?.displayName?o.displayName:si(n)}if(t===ht.ContextProvider){let o=n;return o?._context?.displayName?`${o._context.displayName}.Provider`:null}if(t===ht.ContextConsumer){let o=n;return o?.displayName?`${o.displayName}.Consumer`:null}if(t===ht.LazyComponent){let o=l;return o?._status===1&&o._result?si(o._result):null}return t===ht.SuspenseComponent||t===ht.SuspenseListComponent?null:t===ht.IncompleteClassComponent||t===ht.IncompleteFunctionComponent||t===ht.FunctionComponent||t===ht.ClassComponent||t===ht.IndeterminateComponent?si(n):null}function p8(e){return e.length<=2||e.length<=3&&e===e.toLowerCase()}function b8(e,t){let n=s8(t),l=n.mode==="all";if(l){let s=Zs.map.get(e);if(s!==void 0)return s}if(!h8()){let s={path:null,components:[]};return l&&Zs.map.set(e,s),s}let o=n.mode==="smart"?u8(e):void 0,a=[];try{let s=g8(e),d=0;for(;s&&d<n.maxDepth&&a.length<n.maxComponents;){let f=y8(s);f&&!p8(f)&&_8(f,d,n,o)&&a.push(f),s=s.return,d++}}catch{let s={path:null,components:[]};return l&&Zs.map.set(e,s),s}if(a.length===0){let s={path:null,components:[]};return l&&Zs.map.set(e,s),s}let r={path:a.slice().reverse().map(s=>`<${s}>`).join(" "),components:a};return l&&Zs.map.set(e,r),r}var Ks={FunctionComponent:0,ClassComponent:1,IndeterminateComponent:2,HostRoot:3,HostPortal:4,HostComponent:5,HostText:6,Fragment:7,Mode:8,ContextConsumer:9,ContextProvider:10,ForwardRef:11,Profiler:12,SuspenseComponent:13,MemoComponent:14,SimpleMemoComponent:15,LazyComponent:16};function x8(e){if(!e||typeof e!="object")return null;let t=Object.keys(e),n=t.find(a=>a.startsWith("__reactFiber$"));if(n)return e[n]||null;let l=t.find(a=>a.startsWith("__reactInternalInstance$"));if(l)return e[l]||null;let o=t.find(a=>{if(!a.startsWith("__react"))return!1;let i=e[a];return i&&typeof i=="object"&&"_debugSource"in i});return o&&e[o]||null}function oc(e){if(!e.type||typeof e.type=="string")return null;if(typeof e.type=="object"||typeof e.type=="function"){let t=e.type;if(t.displayName)return t.displayName;if(t.name)return t.name}return null}function w8(e,t=50){let n=e,l=0;for(;n&&l<t;){if(n._debugSource)return{source:n._debugSource,componentName:oc(n)};if(n._debugOwner?._debugSource)return{source:n._debugOwner._debugSource,componentName:oc(n._debugOwner)};n=n.return,l++}return null}function S8(e){let t=e,n=0,l=50;for(;t&&n<l;){let o=t,a=["_debugSource","__source","_source","debugSource"];for(let i of a){let r=o[i];if(r&&typeof r=="object"&&"fileName"in r)return{source:r,componentName:oc(t)}}if(t.memoizedProps){let i=t.memoizedProps;if(i.__source&&typeof i.__source=="object"){let r=i.__source;if(r.fileName&&r.lineNumber)return{source:{fileName:r.fileName,lineNumber:r.lineNumber,columnNumber:r.columnNumber},componentName:oc(t)}}}t=t.return,n++}return null}var Cd=new Map;function k8(e){let t=e.tag,n=e.type,l=e.elementType;if(typeof n=="string"||n==null||typeof n=="function"&&n.prototype?.isReactComponent)return null;if((t===Ks.FunctionComponent||t===Ks.IndeterminateComponent)&&typeof n=="function")return n;if(t===Ks.ForwardRef&&l){let o=l.render;if(typeof o=="function")return o}if((t===Ks.MemoComponent||t===Ks.SimpleMemoComponent)&&l){let o=l.type;if(typeof o=="function")return o}return typeof n=="function"?n:null}function C8(){let e=v8,t=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;if(t&&"H"in t)return{get:()=>t.H,set:l=>{t.H=l}};let n=e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;if(n){let l=n.ReactCurrentDispatcher;if(l&&"current"in l)return{get:()=>l.current,set:o=>{l.current=o}}}return null}function M8(e,t){let n=e.split(`
`),l=[/source-location/,/\/dist\/index\./,/node_modules\//,/react-dom/,/react\.development/,/react\.production/,/chunk-[A-Z0-9]+/i,/\/_next\/static\/chunks\//,/\/\.vite\/deps\//,/\/_astro\//,/\/assets\/[^\s/]+[-.][\w-]{8,}\.m?js(?:[?:]|$)/,/react-stack-bottom-frame/,/react-reconciler/,/scheduler/,/<anonymous>/],o=/^\s*at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)\)?$/,a=/^[^@]*@(.+?):(\d+):(\d+)$/;for(let i of n){let r=i.trim();if(!r||l.some(d=>d.test(r)))continue;if(t){let d=t.replace(/^bound /,"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");if(!new RegExp(`(?:at (?:Object\\.)?|^)${d}(?: \\(|@| \\[)`).test(r))continue}let s=o.exec(r)||a.exec(r);if(s)return{fileName:s[1],line:parseInt(s[2],10),column:parseInt(s[3],10)}}return null}function E8(e){let t=e;return t=t.replace(/[?#].*$/,""),t=t.replace(/^turbopack:\/\/\/\[project\]\//,""),t=t.replace(/^webpack-internal:\/\/\/\.\//,""),t=t.replace(/^webpack-internal:\/\/\//,""),t=t.replace(/^webpack:\/\/\/\.\//,""),t=t.replace(/^webpack:\/\/\//,""),t=t.replace(/^turbopack:\/\/\//,""),t=t.replace(/^https?:\/\/[^/]+\//,""),t=t.replace(/^file:\/\/\//,"/"),t=t.replace(/^\([^)]+\)\/\.\//,""),t=t.replace(/^\.\//,""),t}function T8(e){let t=k8(e);if(!t)return null;if(Cd.has(t))return Cd.get(t);let n=C8();if(!n)return Cd.set(t,null),null;let l=n.get(),o=null;try{let a=new Proxy({},{get(){throw new Error("probe")}});n.set(a);try{t({})}catch(i){if(i instanceof Error&&i.message==="probe"&&i.stack){let r=M8(i.stack,t.name);r&&(o={fileName:E8(r.fileName),lineNumber:r.line,columnNumber:r.column,componentName:oc(e)||void 0})}}}finally{n.set(l)}return Cd.set(t,o),o}function N8(e,t=15){let n=e,l=0;for(;n&&l<t;){let o=T8(n);if(o)return o;n=n.return,l++}return null}function Bh(e){let t=x8(e);if(!t)return{found:!1,reason:"no-fiber",isReactApp:!1,isProduction:!1};let n=w8(t);if(n||(n=S8(t)),n?.source)return{found:!0,source:{fileName:n.source.fileName,lineNumber:n.source.lineNumber,columnNumber:n.source.columnNumber,componentName:n.componentName||void 0},isReactApp:!0,isProduction:!1};let l=N8(t);return l?{found:!0,source:l,isReactApp:!0,isProduction:!1}:{found:!1,reason:"no-debug-source",isReactApp:!0,isProduction:!1}}function R8(e,t="path"){let{fileName:n,lineNumber:l,columnNumber:o}=e,a=`${n}:${l}`;return o!==void 0&&(a+=`:${o}`),t==="vscode"?`vscode://file${n.startsWith("/")?"":"/"}${a}`:a}function A8(e,t=10){let n=e,l=0;for(;n&&l<t;){let o=Bh(n);if(o.found)return o;n=n.parentElement,l++}return Bh(e)}var Js=[{value:"compact",label:"Compact"},{value:"standard",label:"Standard"},{value:"detailed",label:"Detailed"},{value:"forensic",label:"Forensic"}];function Rd(e,t){let n=`## Page Feedback: ${e}
`,l=t?.replace(/[\r\n\t]+/g," ").trim();return l&&(n+=`**App:** ${l.replace(/[\\`*_\[\]<>]/g,"\\$&")}
`),n}function R2(e,t,n="standard",l={}){if(e.length===0)return"";let o=typeof window<"u"?`${window.innerWidth}\xD7${window.innerHeight}`:"unknown",a=Rd(t,l.appName);return n==="forensic"?(a+=`
**Environment:**
`,a+=`- Viewport: ${o}
`,typeof window<"u"&&(a+=`- URL: ${window.location.href}
`,a+=`- User Agent: ${navigator.userAgent}
`,a+=`- Timestamp: ${new Date().toISOString()}
`,a+=`- Device Pixel Ratio: ${window.devicePixelRatio}
`),a+=`
---
`):n!=="compact"&&(a+=`**Viewport:** ${o}
`),a+=`
`,e.forEach((i,r)=>{n==="compact"?(a+=`${r+1}. **${i.element}**${i.sourceFile?` (${i.sourceFile})`:""}: ${i.comment}`,i.selectedText&&(a+=` (re: "${i.selectedText.slice(0,30)}${i.selectedText.length>30?"...":""}")`),a+=`
`):n==="forensic"?(a+=`### ${r+1}. ${i.element}
`,i.isMultiSelect&&i.fullPath&&(a+=`*Forensic data shown for first element of selection*
`),i.fullPath&&(a+=`**Full DOM Path:** ${i.fullPath}
`),i.cssClasses&&(a+=`**CSS Classes:** ${i.cssClasses}
`),i.boundingBox&&(a+=`**Position:** x:${Math.round(i.boundingBox.x)}, y:${Math.round(i.boundingBox.y)} (${Math.round(i.boundingBox.width)}\xD7${Math.round(i.boundingBox.height)}px)
`),a+=`**Annotation at:** ${i.x.toFixed(1)}% from left, ${Math.round(i.y)}px from top
`,i.selectedText&&(a+=`**Selected text:** "${i.selectedText}"
`),i.nearbyText&&!i.selectedText&&(a+=`**Context:** ${i.nearbyText.slice(0,100)}
`),i.computedStyles&&(a+=`**Computed Styles:** ${i.computedStyles}
`),i.accessibility&&(a+=`**Accessibility:** ${i.accessibility}
`),i.nearbyElements&&(a+=`**Nearby Elements:** ${i.nearbyElements}
`),i.sourceFile&&(a+=`**Source:** ${i.sourceFile}
`),i.reactComponents&&(a+=`**React:** ${i.reactComponents}
`),a+=`**Feedback:** ${i.comment}

`):(a+=`### ${r+1}. ${i.element}
`,a+=`**Location:** ${i.elementPath}
`,i.sourceFile&&(a+=`**Source:** ${i.sourceFile}
`),i.reactComponents&&(a+=`**React:** ${i.reactComponents}
`),n==="detailed"&&(i.cssClasses&&(a+=`**Classes:** ${i.cssClasses}
`),i.boundingBox&&(a+=`**Position:** ${Math.round(i.boundingBox.x)}px, ${Math.round(i.boundingBox.y)}px (${Math.round(i.boundingBox.width)}\xD7${Math.round(i.boundingBox.height)}px)
`)),i.selectedText&&(a+=`**Selected text:** "${i.selectedText}"
`),n==="detailed"&&i.nearbyText&&!i.selectedText&&(a+=`**Context:** ${i.nearbyText.slice(0,100)}
`),a+=`**Feedback:** ${i.comment}

`)}),a.trim()}function A2(e,t,n="markdown"){return n==="markdown"?t:[...new Set(e.map(l=>n==="source"?l.sourceFile:n==="classes"?l.cssClasses:l.attributes?.[n.attribute]).filter(l=>typeof l=="string"&&l.length>0))].join(`
`)}async function D8(e){if(typeof window>"u")return!1;try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}return z8(e)}function z8(e){let t=document.createElement("textarea"),n=document.activeElement;for(;n?.shadowRoot?.activeElement;)n=n.shadowRoot.activeElement;let l=n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement?n:null,o=l&&l.selectionStart!==null?{start:l.selectionStart,end:l.selectionEnd,direction:l.selectionDirection}:null,a=document.getSelection(),i=a?Array.from({length:a.rangeCount},(r,s)=>a.getRangeAt(s).cloneRange()):[];try{return t.value=e,t.setAttribute("readonly",""),t.style.cssText="position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;",document.body.appendChild(t),t.focus({preventScroll:!0}),t.select(),t.setSelectionRange(0,e.length),document.execCommand("copy")}catch{return!1}finally{if(t.remove(),n instanceof HTMLElement&&n.isConnected&&(n.focus({preventScroll:!0}),l&&o&&l.setSelectionRange(o.start,o.end,o.direction)),a){a.removeAllRanges();for(let r of i)a.addRange(r)}}}function D2(e){if(!e)return e;try{let t=new URL(e,"http://agentation.invalid");return t.pathname+t.search+t.hash}catch{return e}}function z2(e,t,n=[]){let l=new Map,o=new Map(n.map(r=>[r.id,r])),a=!1;async function i(r,s){if(a||s.running||s.timer)return;let d=s.desired,f=t.get(r);if(!d&&!f){l.delete(r),t.delete(r);return}let h=d?JSON.stringify(d):void 0;if(!(d&&f&&s.synced===h)){s.running=!0;try{if(!d)await e.remove(f),t.delete(r),s.synced=void 0;else if(f)await e.update(f,d),s.synced=h;else{t.set(r,"");let _=await e.create(d);t.set(r,_.id),s.synced=h}s.retries=0,s.running=!1,!a&&l.get(r)===s&&i(r,s)}catch(_){if(s.running=!1,!a&&l.get(r)===s&&(console.warn("[Agentation] Failed to sync layout feedback:",_),t.get(r)&&s.retries<3)){let b=500*2**s.retries++;s.timer=st(()=>{s.timer=void 0,i(r,s)},b)}}}}return{replace(r){let s=new Map(r.map(d=>[d.id,d]));for(let[d,f]of s){let h=l.get(d);if(!h){h={running:!1,retries:0},l.set(d,h);let _=[...o.values()].find(b=>b.kind===f.kind&&D2(b.url)===D2(f.url)&&(f.kind==="placement"?b.timestamp===f.timestamp&&b.element===f.element:b.element===f.element));_&&(t.set(d,_.id),o.delete(_.id))}JSON.stringify(h.desired)!==JSON.stringify(f)&&(h.retries=0,h.timer&&clearTimeout(h.timer),h.timer=void 0),h.desired=f}for(let[d,f]of l)s.has(d)||(f.desired=void 0),i(d,f)},forget(r){let s=l.get(r);s?.timer&&clearTimeout(s.timer),l.delete(r),t.delete(r)},dispose(){a=!0;for(let r of l.values())r.timer&&clearTimeout(r.timer)}}}function O8(e,t,n,l){let o=!1,a,i,r=1e3,s,d=b=>{!o&&(b?.status==="resolved"||b?.status==="dismissed")&&l(b)},f=async()=>{if(o||s||!n())return;let b=new AbortController;s=b;let w=st(()=>b.abort(),5e3);try{let N=await fetch(`${e}/sessions/${t}`,{signal:b.signal});if(!N.ok)return;let M=await N.json();!o&&!b.signal.aborted&&Array.isArray(M.annotations)&&M.annotations.forEach(d)}catch{}finally{clearTimeout(w),s===b&&(s=void 0)}},h=()=>{if(o)return;let b=new EventSource(`${e}/sessions/${t}/events`),w=()=>{r=1e3,f()},N=y=>{try{d(JSON.parse(y.data).payload)}catch{}},M=()=>{b.readyState!==EventSource.CLOSED||o||i!==void 0||(a?.(),i=st(()=>{i=void 0,h()},r),r=Math.min(r*2,1e4))};b.addEventListener("open",w),b.addEventListener("annotation.updated",N),b.addEventListener("error",M),a=()=>{b.removeEventListener("open",w),b.removeEventListener("annotation.updated",N),b.removeEventListener("error",M),b.close()}};h();let _=j2(()=>{f()},1e4);return()=>{o=!0,a?.(),i!==void 0&&clearTimeout(i),clearInterval(_),s?.abort()}}var L8=`.styles-module__surface___7qnpJ {
  padding: 0;
  width: var(--preview-width, 200px);
  max-width: calc(100vw - 24px);
  overflow: auto;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  border-radius: 12px;
  z-index: inherit;
  will-change: auto;
  transform: translateX(-50%);
  transition: left 200ms cubic-bezier(0.2, 0.8, 0.2, 1), top 200ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), width 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 100ms ease-out, visibility 0s 200ms;
}
.styles-module__surface___7qnpJ[data-positioning] {
  transition: none;
}
.styles-module__surface___7qnpJ[data-direct-entry] *, .styles-module__surface___7qnpJ[data-direct-entry] *::before, .styles-module__surface___7qnpJ[data-direct-entry] *::after {
  transition: none !important;
}
.styles-module__surface___7qnpJ[data-state=preview], .styles-module__surface___7qnpJ[data-state=edit] {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}
.styles-module__surface___7qnpJ[data-state=edit], .styles-module__surface___7qnpJ[data-annotation-popup][data-state=hidden] {
  width: 280px;
  border-radius: 16px;
}
.styles-module__surface___7qnpJ[data-state=edit] {
  pointer-events: auto;
}
.styles-module__surface___7qnpJ[data-state=preview] {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=light] .styles-module__surface___7qnpJ[data-state=preview] {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
}

@media (prefers-reduced-motion: reduce) {
  .styles-module__surface___7qnpJ {
    transition: opacity 100ms ease-out, visibility 0s 100ms;
  }
}`,B8={surface:"styles-module__surface___7qnpJ"},H8=(0,Wn.forwardRef)(function({annotation:t,editing:n,exiting:l,restorePreview:o,editorProps:a,lightMode:i,scrollY:r,onExited:s},d){let f=(0,Wn.useRef)({annotation:t,editorProps:a}),h=t??f.current.annotation,_=t?a:f.current.editorProps,b=(0,Wn.useRef)(null),w=(0,Wn.useRef)(null),N=(0,Wn.useRef)(),M=(0,Wn.useRef)(r),y=n&&!l?"edit":t&&(!n||o)?"preview":"hidden",x=y==="preview"||!n;return(0,Wn.useLayoutEffect)(()=>{t&&(f.current={annotation:t,editorProps:a})},[t,a]),(0,Wn.useLayoutEffect)(()=>{let g=b.current;if(!g||!h)return;let k=y==="edit"&&(N.current!==h.id||g.dataset.state==="hidden"&&getComputedStyle(g).opacity==="0");k&&(g.dataset.directEntry="true");let I=()=>{let F=h.x/100*window.innerWidth,Y=h.isFixed?h.y:h.y-r,Z=y==="preview"||!n,re=parseFloat(g.style.getPropertyValue("--preview-width"))||200,K=Math.min(re,window.innerWidth-24),_e=Math.max(12,Math.min(window.innerWidth-K-12,F-K/2)),oe=Z?K:Math.min(280,window.innerWidth-24),se=Math.min(Z?12:20,(window.innerWidth-oe)/2),he=Y>window.innerHeight-(Z?101:290);g.style.left=`${Math.max(se,Math.min(window.innerWidth-oe-se,_e))}px`,g.style.right="auto",g.style.top=`${Math.max(12,Math.min(window.innerHeight-12,Y+(he?-21:21)))}px`,g.style.bottom="auto",g.style.transform=he?"translateY(-100%)":"translateY(0)",g.style.maxHeight=`${Math.max(100,he?Y-33:window.innerHeight-Y-33)}px`},J=N.current!==h.id||M.current!==r||g.dataset.state==="hidden";J&&(g.dataset.positioning="true"),I(),(J||k)&&g.getBoundingClientRect(),delete g.dataset.positioning,delete g.dataset.directEntry,g.dataset.state=y,g.inert=y!=="edit",N.current=h.id,M.current=r;let L=()=>{g.dataset.positioning="true",I(),g.getBoundingClientRect(),delete g.dataset.positioning};return window.addEventListener("resize",L),()=>window.removeEventListener("resize",L)},[h?.id,h?.x,h?.y,h?.isFixed,y,n,r,h?.comment]),(0,Wn.useLayoutEffect)(()=>{n&&!l&&w.current?.focus()},[n,l,h?.id]),Yh(b,l,s),(0,Wn.useImperativeHandle)(d,()=>({shake(){b.current?.animate?.([{translate:"0px"},{translate:"-3px"},{translate:"3px"},{translate:"-2px"},{translate:"2px"},{translate:"0px"}],{duration:250}),w.current?.focus()}}),[]),!h||!_?null:(0,Hh.jsx)("div",{ref:b,className:`${He.popup} ${B8.surface} ${i?He.light:""}`,"data-feedback-toolbar":!0,"data-annotation-card":!0,"data-annotation-popup":n?"":void 0,"data-state":"hidden","aria-hidden":y==="hidden",onClick:g=>g.stopPropagation(),onKeyDownCapture:g=>{g.key!=="Escape"||g.nativeEvent.isComposing||!n||(g.preventDefault(),g.stopPropagation(),_.onCancel())},children:(0,Hh.jsx)(P2,{ref:w,..._,variant:"card",preview:x,resetOnPreview:!n,disabled:!n||l},h.id)})}),$8=`@keyframes styles-module__markerIn___x4G8D {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes styles-module__markerOut___6VhQN {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
}
@keyframes styles-module__renumberRoll___akV9B {
  0% {
    transform: translateX(-40%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.styles-module__marker___9CKF7 {
  padding: 0;
  border: 0;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1;
  text-align: center;
  appearance: none;
  position: absolute;
  width: 22px;
  height: 22px;
  background: var(--agentation-color-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  -webkit-user-select: none;
  user-select: none;
  will-change: transform, opacity;
  contain: layout style;
  z-index: 1;
}
.styles-module__marker___9CKF7 > * {
  pointer-events: none;
}
.styles-module__marker___9CKF7:focus-visible {
  outline: 2px solid var(--agentation-color-accent);
  outline-offset: 3px;
}
.styles-module__marker___9CKF7:hover, .styles-module__marker___9CKF7:focus-visible, .styles-module__marker___9CKF7.styles-module__previewVisible___imMag {
  z-index: 2;
}
.styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K):not(.styles-module__confirm___BtMvq) {
  transition: background-color 0.15s ease, transform 0.1s ease, z-index 0s 0.1s;
}
.styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K):not(.styles-module__confirm___BtMvq):hover, .styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K):not(.styles-module__confirm___BtMvq):focus-visible, .styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K):not(.styles-module__confirm___BtMvq).styles-module__previewVisible___imMag {
  transition-delay: 0s;
}
.styles-module__marker___9CKF7.styles-module__enter___8kI3q {
  animation: styles-module__markerIn___x4G8D 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.styles-module__marker___9CKF7.styles-module__confirm___BtMvq {
  animation: styles-module__markerConfirm___RT4Sk 220ms ease-out both;
}
.styles-module__marker___9CKF7.styles-module__exit___KBdR3 {
  animation: styles-module__markerOut___6VhQN 0.2s ease-out both;
  pointer-events: none;
}
.styles-module__marker___9CKF7.styles-module__clearing___8rM7K {
  animation: styles-module__markerOut___6VhQN 0.15s ease-out both;
  pointer-events: none;
}
.styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K):not(.styles-module__confirm___BtMvq):hover {
  transform: translate(-50%, -50%) scale(1.1);
}
.styles-module__marker___9CKF7.styles-module__pending___BiY-U {
  background-color: var(--agentation-color-blue);
  cursor: default;
}
.styles-module__marker___9CKF7.styles-module__pending___BiY-U.styles-module__exit___KBdR3 {
  animation-duration: 150ms;
}
.styles-module__marker___9CKF7.styles-module__multiSelect___CPfTC {
  background-color: var(--agentation-color-green);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 0.75rem;
}
.styles-module__marker___9CKF7.styles-module__multiSelect___CPfTC.styles-module__pending___BiY-U {
  background-color: var(--agentation-color-green);
}
.styles-module__marker___9CKF7.styles-module__hovered___-mg2N {
  background-color: var(--agentation-color-red);
}

.styles-module__renumber___16lvD {
  display: block;
  animation: styles-module__renumberRoll___akV9B 0.2s ease-out;
}

@keyframes styles-module__markerConfirm___RT4Sk {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  25% {
    transform: translate(-50%, -50%) scale(0.94);
  }
  65% {
    transform: translate(-50%, -50%) scale(1.06);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}
.styles-module__number___1JFu9 {
  display: block;
}

.styles-module__numberGlyph___qchdk {
  display: block;
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
  transition: opacity 140ms ease-out, transform 180ms cubic-bezier(0.22, 1, 0.36, 1), filter 140ms ease-out;
}

.styles-module__actionGlyph___AFRt0 {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0;
  transform: translateY(2px) scale(0.8) rotate(-12deg);
  filter: blur(1px);
  transition: opacity 120ms ease-out, transform 160ms cubic-bezier(0.22, 1, 0.36, 1), filter 120ms ease-out;
}

.styles-module__actionVisible___Kb--l .styles-module__numberGlyph___qchdk {
  opacity: 0;
  transform: translateY(-2px) scale(0.8);
  filter: blur(1px);
}
.styles-module__actionVisible___Kb--l .styles-module__actionGlyph___AFRt0 {
  opacity: 1;
  transform: translateY(0) scale(1) rotate(0);
  filter: blur(0);
}

.styles-module__plus___xslMP {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
  filter: blur(1px);
  transition: opacity 100ms ease-out, transform 140ms ease-out, filter 100ms ease-out;
  pointer-events: none;
}

.styles-module__pending___BiY-U .styles-module__numberGlyph___qchdk {
  opacity: 0;
  transform: translateY(5px);
  filter: blur(2px);
}
.styles-module__pending___BiY-U .styles-module__plus___xslMP {
  opacity: 1;
  transform: rotate(0) scale(1);
  filter: blur(0);
}

@media (prefers-reduced-motion: reduce) {
  .styles-module__marker___9CKF7.styles-module__enter___8kI3q, .styles-module__marker___9CKF7.styles-module__exit___KBdR3, .styles-module__marker___9CKF7.styles-module__clearing___8rM7K, .styles-module__marker___9CKF7.styles-module__confirm___BtMvq {
    animation-duration: 1ms;
    animation-delay: 0ms !important;
  }
  .styles-module__numberGlyph___qchdk, .styles-module__actionGlyph___AFRt0, .styles-module__plus___xslMP {
    transition: opacity 100ms ease-out;
    transform: none;
    filter: none;
  }
  .styles-module__pending___BiY-U .styles-module__numberGlyph___qchdk, .styles-module__pending___BiY-U .styles-module__plus___xslMP,
  .styles-module__actionVisible___Kb--l .styles-module__numberGlyph___qchdk, .styles-module__actionVisible___Kb--l .styles-module__actionGlyph___AFRt0 {
    transform: none;
    filter: none;
  }
}`,xn={marker:"styles-module__marker___9CKF7",previewVisible:"styles-module__previewVisible___imMag",enter:"styles-module__enter___8kI3q",exit:"styles-module__exit___KBdR3",clearing:"styles-module__clearing___8rM7K",confirm:"styles-module__confirm___BtMvq",markerIn:"styles-module__markerIn___x4G8D",markerConfirm:"styles-module__markerConfirm___RT4Sk",markerOut:"styles-module__markerOut___6VhQN",pending:"styles-module__pending___BiY-U",multiSelect:"styles-module__multiSelect___CPfTC",hovered:"styles-module__hovered___-mg2N",renumber:"styles-module__renumber___16lvD",renumberRoll:"styles-module__renumberRoll___akV9B",number:"styles-module__number___1JFu9",numberGlyph:"styles-module__numberGlyph___qchdk",actionGlyph:"styles-module__actionGlyph___AFRt0",actionVisible:"styles-module__actionVisible___Kb--l",plus:"styles-module__plus___xslMP"},O2=(0,Cl.memo)(function({annotation:t,pending:n=!1,globalIndex:l,layerIndex:o,layerSize:a,isExiting:i,isClearing:r,isAnimated:s,isNew:d,isHovered:f,isRemoving:h,onRemoveComplete:_,isEditingAny:b,renumberFrom:w,markerClickBehavior:N,onHoverEnter:M,onEnterComplete:y,onHoverLeave:x,onClick:g,onContextMenu:k}){let[I,J]=(0,Cl.useState)(s),L=(0,Cl.useRef)(n),[F,Y]=(0,Cl.useState)(!1),Z=L.current&&!n&&I&&!F;(0,Cl.useLayoutEffect)(()=>{i&&J(!1)},[i]);let re=(0,Cl.useRef)(null),K=(0,Cl.useRef)({action:!1,delete:!1}),_e=f&&!b,oe=_e&&N==="delete";(0,Cl.useLayoutEffect)(()=>{h||(K.current={action:_e,delete:oe})},[h,_e,oe]);let se=h?K.current.action:_e,he=h?K.current.delete:oe;Yh(re,h,()=>_(t.id));let Ht=t.isMultiSelect,Ye=Ht?"var(--agentation-color-green)":"var(--agentation-color-accent)",tt=r?xn.clearing:i||h?xn.exit:Z?xn.confirm:!s&&!I?xn.enter:"",je=r?`${Math.min(o*20,120)}ms`:h||n||Z?"0ms":i?`${(a-1-o)*20}ms`:`${d?0:o*20}ms`;return(0,co.jsxs)("button",{ref:re,type:"button","aria-label":n?"Pending annotation":`${N==="delete"?"Delete":"Edit"} annotation ${l+1}: ${t.element}`,disabled:n||i||h||r,tabIndex:n||b?-1:0,className:`${xn.marker} ${n?xn.pending:""} ${Ht?xn.multiSelect:""} ${tt} ${!n&&se?xn.actionVisible:""} ${he?xn.hovered:""} ${f&&!b&&!h?xn.previewVisible:""}`,"data-annotation-marker":n?void 0:"","data-annotation-pending":n?"":void 0,style:{left:`${t.x}%`,top:t.y,backgroundColor:he?void 0:Ye,animationDelay:je},onAnimationEnd:St=>{St.target===St.currentTarget&&(tt===xn.enter||tt===xn.confirm)&&(J(!0),n||Y(!0),n||y(t.id))},onMouseOver:()=>{n||M(t)},onMouseOut:St=>{let _n=St.relatedTarget;(!(_n instanceof Node)||!St.currentTarget.contains(_n))&&x(t.id)},onFocus:St=>{!n&&St.currentTarget.matches(":focus-visible")&&M(t)},onBlur:()=>x(t.id),onClick:St=>{St.stopPropagation(),!n&&!i&&!h&&g(t,St.currentTarget)},onContextMenu:k?St=>{N==="delete"&&(St.preventDefault(),St.stopPropagation(),!n&&!i&&!h&&k(t,St.currentTarget))}:void 0,children:[(0,co.jsx)("span",{className:`${xn.number} ${w!==null&&l>=w?xn.renumber:""}`,"aria-hidden":"true",children:(0,co.jsx)("span",{className:xn.numberGlyph,children:l+1})},l),(0,co.jsx)("span",{className:xn.actionGlyph,"aria-hidden":"true",children:N==="delete"?(0,co.jsx)(n3,{size:Ht?18:16}):(0,co.jsx)(a3,{size:16})}),L.current&&(0,co.jsx)("span",{className:xn.plus,"aria-hidden":"true",children:(0,co.jsx)(W4,{size:12})})]})}),U8=`.styles-module__switchContainer___Ka-AB {
  display: flex;
  align-items: center;
  position: relative;
  padding: 2px;
  width: 24px;
  height: 16px;
  border-radius: 8px;
  background-color: #cdcdcd;
  transition: background-color 0.15s, opacity 0.15s;
}
[data-agentation-theme=dark] .styles-module__switchContainer___Ka-AB {
  background-color: #484848;
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:checked) {
  background-color: var(--agentation-color-blue);
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:disabled) {
  opacity: 0.3;
}

.styles-module__switchInput___kYDSD {
  position: absolute;
  z-index: 1;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
}
.styles-module__switchInput___kYDSD:disabled {
  cursor: not-allowed;
}

.styles-module__switchThumb___4sCPH {
  border-radius: 50%;
  width: 12px;
  height: 12px;
  background-color: #fff;
  transition: transform 0.15s;
}
.styles-module__switchContainer___Ka-AB[data-checked] .styles-module__switchThumb___4sCPH {
  transform: translateX(8px);
}`,Sh={switchContainer:"styles-module__switchContainer___Ka-AB",switchInput:"styles-module__switchInput___kYDSD",switchThumb:"styles-module__switchThumb___4sCPH"},kh=({className:e="",checked:t,onChange:n,...l})=>(0,ac.jsxs)("div",{className:`${Sh.switchContainer} ${e}`,"data-checked":t?"":void 0,children:[(0,ac.jsx)("input",{className:Sh.switchInput,checked:t,onChange:n,type:"checkbox",...l}),(0,ac.jsx)("div",{className:Sh.switchThumb})]}),Y8=`.styles-module__checkboxContainer___joqZk {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 1px solid rgba(26, 26, 26, 0.2);
  border-radius: 4px;
  width: 14px;
  height: 14px;
  background-color: #fff;
  transition: background-color 0.2s ease;
}
[data-agentation-theme=dark] .styles-module__checkboxContainer___joqZk {
  border-color: rgba(255, 255, 255, 0.2);
  background-color: #252525;
}
.styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) {
  background-color: #1a1a1a;
}
[data-agentation-theme=dark] .styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) {
  background-color: #fff;
}

.styles-module__checkboxInput___ECzzO {
  position: absolute;
  z-index: 1;
  inset: -1px;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
}

.styles-module__checkboxCheck___fUXpr {
  color: #fafafa;
}
[data-agentation-theme=dark] .styles-module__checkboxCheck___fUXpr {
  color: #1a1a1a;
}

.styles-module__checkboxCheckPath___cDyh8 {
  stroke-dasharray: 9.29px;
  stroke-dashoffset: 9.29px;
  color: #fafafa;
  transition: stroke-dashoffset 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__checkboxCheckPath___cDyh8 {
  color: #1a1a1a;
}
.styles-module__checkboxContainer___joqZk[data-checked] .styles-module__checkboxCheckPath___cDyh8 {
  transition-duration: 0.2s;
  stroke-dashoffset: 0;
}`,Md={checkboxContainer:"styles-module__checkboxContainer___joqZk",checkboxInput:"styles-module__checkboxInput___ECzzO",checkboxCheck:"styles-module__checkboxCheck___fUXpr",checkboxCheckPath:"styles-module__checkboxCheckPath___cDyh8"},j8=({className:e="",checked:t,onChange:n,...l})=>(0,kr.jsxs)("div",{className:`${Md.checkboxContainer} ${e}`,"data-checked":t?"":void 0,children:[(0,kr.jsx)("input",{className:Md.checkboxInput,type:"checkbox",checked:t,onChange:n,...l}),(0,kr.jsx)("svg",{className:Md.checkboxCheck,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:(0,kr.jsx)("path",{className:Md.checkboxCheckPath,d:"M3.94 7L6.13 9.19L10.5 4.81",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),I8=`.styles-module__container___w8eAF {
  display: flex;
  align-items: center;
  height: 24px;
}

.styles-module__label___J5mxE {
  padding-inline: 8px 2px;
  line-height: 20px;
  font-size: 13px;
  letter-spacing: -0.15px;
  color: rgba(26, 26, 26, 0.5);
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
}
[data-agentation-theme=dark] .styles-module__label___J5mxE {
  color: rgba(255, 255, 255, 0.5);
}`,L2={container:"styles-module__container___w8eAF",label:"styles-module__label___J5mxE"},B2=({className:e="",label:t,tooltip:n,checked:l,onChange:o,...a})=>{let i=(0,hb.useId)();return(0,Cr.jsxs)("div",{className:`${L2.container} ${e}`,...a,children:[(0,Cr.jsx)(j8,{id:i,onChange:o,checked:l}),(0,Cr.jsx)("label",{className:L2.label,htmlFor:i,children:t}),n&&(0,Cr.jsx)(ci,{content:n})]})},X8=`@keyframes styles-module__cycleTextIn___VBNTi {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes styles-module__scaleIn___QpQ8E {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__mcpPulse___5Q3Jj {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpPulseError___VHxhx {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
}
@keyframes styles-module__themeIconIn___qUWMV {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-30deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
.styles-module__settingsPanel___qNkn- :where(button, a, input, select, textarea):focus-visible {
  outline: 2px solid var(--agentation-color-accent);
  outline-offset: 2px;
}
.styles-module__settingsPanel___qNkn- {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  z-index: 1;
  overflow: hidden;
  background: #1c1c1c;
  border-radius: 16px;
  padding: 12px 0;
  width: 253px;
  max-width: calc(100vw - 20px);
  cursor: default;
  opacity: 1;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}
.styles-module__settingsPanel___qNkn-::before, .styles-module__settingsPanel___qNkn-::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16px;
  z-index: 2;
  pointer-events: none;
}
.styles-module__settingsPanel___qNkn-::before {
  left: 0;
  background: linear-gradient(to right, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___qNkn-::after {
  right: 0;
  background: linear-gradient(to left, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___qNkn- .styles-module__settingsHeader___Fn1DP,
.styles-module__settingsPanel___qNkn- .styles-module__settingsBrand___OoKlM,
.styles-module__settingsPanel___qNkn- .styles-module__settingsVersion___rXmL9,
.styles-module__settingsPanel___qNkn- .styles-module__settingsSection___n5V-4,
.styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ,
.styles-module__settingsPanel___qNkn- .styles-module__cycleButton___XMBx3,
.styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY,
.styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8,
.styles-module__settingsPanel___qNkn- .styles-module__sliderLabel___6K5v1,
.styles-module__settingsPanel___qNkn- .styles-module__slider___v5z-c,
.styles-module__settingsPanel___qNkn- .styles-module__themeToggle___3imlT {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__settingsPanel___qNkn- {
  opacity: 0;
  transform: translateY(var(--panel-offset-y, 4px)) scale(0.98);
  transform-origin: var(--panel-origin, bottom right);
  filter: blur(2px);
  pointer-events: none;
  visibility: hidden;
  transition: opacity 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.styles-module__settingsPanel___qNkn-[data-panel-present=true] {
  visibility: visible;
}
.styles-module__settingsPanel___qNkn-[data-panel-open=true] {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  pointer-events: auto;
  transition-duration: 160ms;
}
@media (prefers-reduced-motion: reduce) {
  .styles-module__settingsPanel___qNkn- {
    transition: none;
    transform: none;
    filter: none;
  }
}
.styles-module__settingsPanel___qNkn-.styles-module__below___Vpv-k {
  --panel-offset-y: -4px;
  --panel-origin: top right;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- {
  background: #1a1a1a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ {
  color: rgba(255, 255, 255, 0.6);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH- {
  color: rgba(255, 255, 255, 0.85);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH-:hover {
  background: rgba(255, 255, 255, 0.1);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH-.styles-module__selected___k1-Vq {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.styles-module__settingsPanelContainer___5it-H {
  overflow: visible;
  position: relative;
  display: flex;
  padding: 0 16px;
}

.styles-module__settingsPage___BMn-3 {
  min-width: 100%;
  flex-basis: 0;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transition-delay: 0s;
  opacity: 1;
}

.styles-module__settingsPage___BMn-3.styles-module__slideLeft___qUvW4 {
  transform: translateX(-24px);
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___N7By0 {
  position: absolute;
  top: 0;
  left: 24px;
  width: 100%;
  height: 100%;
  padding: 0 16px 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___N7By0.styles-module__slideIn___uXDSu {
  transform: translateX(-24px);
  opacity: 1;
  pointer-events: auto;
}

.styles-module__settingsHeader___Fn1DP {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
}

.styles-module__settingsBrand___OoKlM {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.0094em;
  color: #bbb;
  text-decoration: none;
}

.styles-module__settingsVersion___rXmL9 {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: 6px;
  letter-spacing: -0.0094em;
}

.styles-module__themeToggle___3imlT {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: auto;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  transition: background-color 0.15s ease, color 0.15s ease;
  cursor: pointer;
}
.styles-module__themeToggle___3imlT:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}
[data-agentation-theme=light] .styles-module__themeToggle___3imlT {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__themeToggle___3imlT:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.7);
}

.styles-module__themeIconWrapper___pyaYa {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 20px;
  height: 20px;
}

.styles-module__themeIcon___w7lAm {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: styles-module__themeIconIn___qUWMV 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.styles-module__settingsSectionGrow___eZTRw {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.styles-module__settingsRow___y-tDE {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}
.styles-module__settingsRow___y-tDE.styles-module__settingsRowMarginTop___uLpGb {
  margin-top: 8px;
}

.styles-module__settingsRowDisabled___ydl3Q .styles-module__settingsLabel___VCVOQ {
  color: rgba(255, 255, 255, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsRowDisabled___ydl3Q .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.2);
}

.styles-module__settingsLabel___VCVOQ {
  display: flex;
  align-items: center;
  column-gap: 2px;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.15px;
  color: rgba(255, 255, 255, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__cycleButton___XMBx3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  letter-spacing: -0.0094em;
}
[data-agentation-theme=light] .styles-module__cycleButton___XMBx3 {
  color: rgba(0, 0, 0, 0.85);
}
.styles-module__cycleButton___XMBx3:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.styles-module__cycleButtonText___mbbnD {
  display: inline-block;
  animation: styles-module__cycleTextIn___VBNTi 0.2s ease-out;
}

.styles-module__cycleDots___ehp6i {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.styles-module__cycleDot___zgSXY {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.667);
  transition: background-color 0.25s ease-out, transform 0.25s ease-out;
}
.styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: #fff;
  transform: scale(1);
}
[data-agentation-theme=light] .styles-module__cycleDot___zgSXY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: rgba(0, 0, 0, 0.7);
}

.styles-module__colorOptions___pbxZx {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  height: 26px;
}

.styles-module__colorOption___Co955 {
  padding: 0;
  position: relative;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: #fff;
  cursor: pointer;
}
[data-agentation-theme=dark] .styles-module__colorOption___Co955 {
  background-color: #1a1a1a;
}
.styles-module__colorOption___Co955::before, .styles-module__colorOption___Co955::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: var(--swatch);
  transition: opacity 0.2s, transform 0.2s;
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOption___Co955::before, .styles-module__colorOption___Co955::after {
    --color: var(--swatch-p3);
  }
}
.styles-module__colorOption___Co955::after {
  z-index: -1;
  transform: scale(1.2);
  opacity: 0;
}
.styles-module__colorOption___Co955.styles-module__selected___k1-Vq::before {
  transform: scale(0.8);
}
.styles-module__colorOption___Co955.styles-module__selected___k1-Vq::after {
  opacity: 1;
}

.styles-module__settingsNavLink___uYIwM {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.15s ease;
  cursor: pointer;
}
.styles-module__settingsNavLink___uYIwM:hover {
  color: rgba(255, 255, 255, 0.9);
}
.styles-module__settingsNavLink___uYIwM svg {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___uYIwM:hover svg {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM:hover {
  color: rgba(0, 0, 0, 0.8);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM svg {
  color: rgba(0, 0, 0, 0.25);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.styles-module__settingsNavLinkRight___XBUzC {
  display: flex;
  align-items: center;
  gap: 6px;
}

.styles-module__settingsBackButton___fflll {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  border: none;
  background: transparent;
  font-family: inherit;
  line-height: 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___fflll svg {
  opacity: 0.4;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.18s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___fflll:hover svg {
  opacity: 1;
}
[data-agentation-theme=light] .styles-module__settingsBackButton___fflll {
  color: rgba(0, 0, 0, 0.85);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.styles-module__automationHeader___Avra9 {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #fff;
}
[data-agentation-theme=light] .styles-module__automationHeader___Avra9 {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__automationDescription___vFTmJ {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  line-height: 14px;
}
[data-agentation-theme=light] .styles-module__automationDescription___vFTmJ {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__learnMoreLink___cG7OI {
  color: rgba(255, 255, 255, 0.8);
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__learnMoreLink___cG7OI:hover {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__learnMoreLink___cG7OI {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__learnMoreLink___cG7OI:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__autoSendContainer___VpkXk {
  display: flex;
  align-items: center;
}

.styles-module__autoSendLabel___ngNdC {
  padding-inline-end: 8px;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s, opacity 0.15s;
  cursor: pointer;
}
.styles-module__autoSendLabel___ngNdC.styles-module__active___dpAhM {
  color: #66b8ff;
  color: color(display-p3 0.4 0.72 1);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___ngNdC {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___ngNdC.styles-module__active___dpAhM {
  color: var(--agentation-color-blue);
}
.styles-module__autoSendLabel___ngNdC.styles-module__disabled___9AZYS {
  opacity: 0.3;
  cursor: not-allowed;
}

.styles-module__mcpStatusDot___8AMxP {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__connecting___QEO1r {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___5Q3Jj 1.5s infinite;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__connected___WyFkx {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___5Q3Jj 2.5s ease-in-out infinite;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__disconnected___mvmvQ {
  background-color: var(--agentation-color-red);
  animation: styles-module__mcpPulseError___VHxhx 2s infinite;
}

.styles-module__mcpNavIndicator___auBHI {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpNavIndicator___auBHI.styles-module__connected___WyFkx {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___5Q3Jj 2.5s ease-in-out infinite;
}
.styles-module__mcpNavIndicator___auBHI.styles-module__connecting___QEO1r {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___5Q3Jj 1.5s ease-in-out infinite;
}

.styles-module__webhookUrlInput___WDDDC {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 60px;
  box-sizing: border-box;
  margin-top: 11px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 400;
  color: #fff;
  outline: none;
  resize: none;
  user-select: text;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.styles-module__webhookUrlInput___WDDDC::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__webhookUrlInput___WDDDC:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn-::before {
  background: linear-gradient(to right, #fff 0%, transparent 100%);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn-::after {
  background: linear-gradient(to left, #fff 0%, transparent 100%);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsHeader___Fn1DP {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsBrand___OoKlM {
  color: #333;
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsVersion___rXmL9 {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsSection___n5V-4 {
  border-top-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleButton___XMBx3 {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: rgba(0, 0, 0, 0.7);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8 {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8:hover {
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__checkboxField___ZrSqv:not(:first-child) {
  margin-top: 8px;
}

.styles-module__divider___h6Yux {
  margin-block: 8px;
  width: 100%;
  height: 1px;
  background-color: rgba(26, 26, 26, 0.07);
}
[data-agentation-theme=dark] .styles-module__divider___h6Yux {
  background-color: rgba(255, 255, 255, 0.07);
}`,ie={settingsPanel:"styles-module__settingsPanel___qNkn-",settingsHeader:"styles-module__settingsHeader___Fn1DP",settingsBrand:"styles-module__settingsBrand___OoKlM",settingsVersion:"styles-module__settingsVersion___rXmL9",settingsSection:"styles-module__settingsSection___n5V-4",settingsLabel:"styles-module__settingsLabel___VCVOQ",cycleButton:"styles-module__cycleButton___XMBx3",cycleDot:"styles-module__cycleDot___zgSXY",dropdownButton:"styles-module__dropdownButton___mKHe8",sliderLabel:"styles-module__sliderLabel___6K5v1",slider:"styles-module__slider___v5z-c",themeToggle:"styles-module__themeToggle___3imlT",below:"styles-module__below___Vpv-k",settingsOption:"styles-module__settingsOption___JoyH-",selected:"styles-module__selected___k1-Vq",settingsPanelContainer:"styles-module__settingsPanelContainer___5it-H",settingsPage:"styles-module__settingsPage___BMn-3",slideLeft:"styles-module__slideLeft___qUvW4",automationsPage:"styles-module__automationsPage___N7By0",slideIn:"styles-module__slideIn___uXDSu",themeIconWrapper:"styles-module__themeIconWrapper___pyaYa",themeIcon:"styles-module__themeIcon___w7lAm",themeIconIn:"styles-module__themeIconIn___qUWMV",settingsSectionGrow:"styles-module__settingsSectionGrow___eZTRw",settingsRow:"styles-module__settingsRow___y-tDE",settingsRowMarginTop:"styles-module__settingsRowMarginTop___uLpGb",settingsRowDisabled:"styles-module__settingsRowDisabled___ydl3Q",cycleButtonText:"styles-module__cycleButtonText___mbbnD",cycleTextIn:"styles-module__cycleTextIn___VBNTi",cycleDots:"styles-module__cycleDots___ehp6i",active:"styles-module__active___dpAhM",colorOptions:"styles-module__colorOptions___pbxZx",colorOption:"styles-module__colorOption___Co955",settingsNavLink:"styles-module__settingsNavLink___uYIwM",settingsNavLinkRight:"styles-module__settingsNavLinkRight___XBUzC",settingsBackButton:"styles-module__settingsBackButton___fflll",automationHeader:"styles-module__automationHeader___Avra9",automationDescription:"styles-module__automationDescription___vFTmJ",learnMoreLink:"styles-module__learnMoreLink___cG7OI",autoSendContainer:"styles-module__autoSendContainer___VpkXk",autoSendLabel:"styles-module__autoSendLabel___ngNdC",disabled:"styles-module__disabled___9AZYS",mcpStatusDot:"styles-module__mcpStatusDot___8AMxP",connecting:"styles-module__connecting___QEO1r",mcpPulse:"styles-module__mcpPulse___5Q3Jj",connected:"styles-module__connected___WyFkx",disconnected:"styles-module__disconnected___mvmvQ",mcpPulseError:"styles-module__mcpPulseError___VHxhx",mcpNavIndicator:"styles-module__mcpNavIndicator___auBHI",webhookUrlInput:"styles-module__webhookUrlInput___WDDDC",checkboxField:"styles-module__checkboxField___ZrSqv",divider:"styles-module__divider___h6Yux",scaleIn:"styles-module__scaleIn___QpQ8E"},q8=(0,xa.memo)(function({settings:t,onSettingsChange:n,isDarkMode:l,onToggleTheme:o,isDevMode:a,connectionStatus:i,endpoint:r,onExited:s,isOpen:d,toolbarNearBottom:f,settingsPage:h,onSettingsPageChange:_,onHideToolbar:b}){let{ref:w}=nb(d,{keepMounted:!0,onExited:s}),N=(0,xa.useRef)(null),M=(0,xa.useRef)(null),y=(0,xa.useRef)(!1);(0,xa.useLayoutEffect)(()=>{!d||!y.current||(y.current=!1,(h==="automations"?M:N).current?.focus())},[d,h]);let x=l?"Switch to light mode":"Switch to dark mode";return(0,le.jsx)("div",{className:`${ie.settingsPanel} ${f?ie.below:""}`,style:f?{bottom:"auto",top:"calc(100% + 0.5rem)"}:void 0,"data-agentation-settings-panel":!0,ref:g=>{w.current=g,g?.toggleAttribute("inert",!d)},role:"group","aria-label":"Feedback settings","aria-hidden":!d,children:(0,le.jsxs)("div",{className:ie.settingsPanelContainer,children:[(0,le.jsxs)("div",{className:`${ie.settingsPage} ${h==="automations"?ie.slideLeft:""}`,ref:g=>{g?.toggleAttribute("inert",h!=="main")},"aria-hidden":h!=="main",children:[(0,le.jsxs)("div",{className:ie.settingsHeader,children:[(0,le.jsx)("a",{className:ie.settingsBrand,href:"https://agentation.com",target:"_blank",rel:"noopener noreferrer","aria-label":"Agentation",children:"Agentation"}),(0,le.jsxs)("p",{className:ie.settingsVersion,children:["v","3.1.2"]}),(0,le.jsx)("button",{className:ie.themeToggle,onClick:o,title:x,"aria-label":x,children:(0,le.jsx)("span",{className:ie.themeIconWrapper,children:(0,le.jsx)("span",{className:ie.themeIcon,children:l?(0,le.jsx)(l3,{size:20}):(0,le.jsx)(o3,{size:20})},l?"sun":"moon")})})]}),(0,le.jsx)("div",{className:ie.divider}),(0,le.jsxs)("div",{className:ie.settingsSection,children:[(0,le.jsxs)("div",{className:ie.settingsRow,children:[(0,le.jsxs)("div",{className:ie.settingsLabel,children:["Output Detail",(0,le.jsx)(ci,{content:"Controls how much detail is included in the copied output"})]}),(0,le.jsxs)("button",{className:ie.cycleButton,onClick:()=>{let k=(Js.findIndex(I=>I.value===t.outputDetail)+1)%Js.length;n({outputDetail:Js[k].value})},children:[(0,le.jsx)("span",{className:ie.cycleButtonText,children:Js.find(g=>g.value===t.outputDetail)?.label},t.outputDetail),(0,le.jsx)("span",{className:ie.cycleDots,children:Js.map(g=>(0,le.jsx)("span",{className:`${ie.cycleDot} ${t.outputDetail===g.value?ie.active:""}`},g.value))})]})]}),(0,le.jsxs)("div",{className:`${ie.settingsRow} ${ie.settingsRowMarginTop} ${a?"":ie.settingsRowDisabled}`,children:[(0,le.jsxs)("div",{className:ie.settingsLabel,children:["React Components",(0,le.jsx)(ci,{content:a?"Include React component names in annotations":"Disabled \u2014 production builds minify component names, making detection unreliable. Use in development mode."})]}),(0,le.jsx)(kh,{"aria-label":"React Components",checked:a&&t.reactEnabled,onChange:g=>n({reactEnabled:g.target.checked}),disabled:!a})]}),(0,le.jsxs)("div",{className:`${ie.settingsRow} ${ie.settingsRowMarginTop}`,children:[(0,le.jsxs)("div",{className:ie.settingsLabel,children:["Hide Until Restart",(0,le.jsx)(ci,{content:"Hides the toolbar until you open a new tab"})]}),(0,le.jsx)(kh,{"aria-label":"Hide Until Restart",checked:!1,onChange:g=>{g.target.checked&&b()}})]})]}),(0,le.jsx)("div",{className:ie.divider}),(0,le.jsxs)("div",{className:ie.settingsSection,children:[(0,le.jsx)("div",{className:`${ie.settingsLabel} ${ie.settingsLabelMarker}`,children:"Marker Color"}),(0,le.jsx)("div",{className:ie.colorOptions,children:nc.map(g=>(0,le.jsx)("button",{className:`${ie.colorOption} ${t.annotationColorId===g.id?ie.selected:""}`,style:{"--swatch":g.srgb,"--swatch-p3":g.p3},onClick:()=>n({annotationColorId:g.id}),title:g.label,"aria-label":g.label,type:"button"},g.id))})]}),(0,le.jsx)("div",{className:ie.divider}),(0,le.jsxs)("div",{className:ie.settingsSection,children:[(0,le.jsx)(B2,{className:"checkbox-field",label:"Clear on copy/send",checked:t.autoClearAfterCopy,onChange:g=>n({autoClearAfterCopy:g.target.checked}),tooltip:"Automatically clear annotations after copying"}),(0,le.jsx)(B2,{className:ie.checkboxField,label:"Block page interactions",checked:t.blockInteractions,onChange:g=>n({blockInteractions:g.target.checked})})]}),(0,le.jsx)("div",{className:ie.divider}),(0,le.jsxs)("button",{className:ie.settingsNavLink,ref:N,onClick:g=>{y.current=g.detail===0,g.currentTarget.blur(),_("automations")},children:[(0,le.jsx)("span",{children:"Manage MCP & Webhooks"}),(0,le.jsxs)("span",{className:ie.settingsNavLinkRight,children:[r&&i!=="disconnected"&&(0,le.jsx)("span",{className:`${ie.mcpNavIndicator} ${ie[i]}`}),(0,le.jsx)("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,le.jsx)("path",{d:"M7.5 12.5L12 8L7.5 3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]})]})]}),(0,le.jsxs)("div",{className:`${ie.settingsPage} ${ie.automationsPage} ${h==="automations"?ie.slideIn:""}`,ref:g=>{g?.toggleAttribute("inert",h!=="automations")},"aria-hidden":h!=="automations",children:[(0,le.jsxs)("button",{className:ie.settingsBackButton,ref:M,"aria-label":"Back to settings",onClick:g=>{y.current=g.detail===0,g.currentTarget.blur(),_("main")},children:[(0,le.jsx)(i3,{size:16}),(0,le.jsx)("span",{children:"Manage MCP & Webhooks"})]}),(0,le.jsx)("div",{className:ie.divider}),(0,le.jsxs)("div",{className:ie.settingsSection,children:[(0,le.jsxs)("div",{className:ie.settingsRow,children:[(0,le.jsxs)("span",{className:ie.automationHeader,children:["MCP Connection",(0,le.jsx)(ci,{content:"Connect via Model Context Protocol to let AI agents like Claude Code receive annotations in real-time."})]}),r&&(0,le.jsx)("div",{className:`${ie.mcpStatusDot} ${ie[i]}`,title:i==="connected"?"Connected":i==="connecting"?"Connecting...":"Disconnected"})]}),(0,le.jsxs)("p",{className:ie.automationDescription,style:{paddingBottom:6},children:["MCP connection allows agents to receive and act on annotations."," ",(0,le.jsx)("a",{href:"https://agentation.com/mcp",target:"_blank",rel:"noopener noreferrer",className:ie.learnMoreLink,children:"Learn more"})]})]}),(0,le.jsx)("div",{className:ie.divider}),(0,le.jsxs)("div",{className:`${ie.settingsSection} ${ie.settingsSectionGrow}`,children:[(0,le.jsxs)("div",{className:ie.settingsRow,children:[(0,le.jsxs)("span",{className:ie.automationHeader,children:["Webhooks",(0,le.jsx)(ci,{content:"Send annotation data to any URL endpoint when annotations change. Useful for custom integrations."})]}),(0,le.jsxs)("div",{className:ie.autoSendContainer,children:[(0,le.jsx)("label",{htmlFor:"agentation-auto-send",className:`${ie.autoSendLabel} ${t.webhooksEnabled?ie.active:""} ${t.webhookUrl?"":ie.disabled}`,children:"Auto-Send"}),(0,le.jsx)(kh,{id:"agentation-auto-send",checked:t.webhooksEnabled,onChange:g=>n({webhooksEnabled:g.target.checked}),disabled:!t.webhookUrl})]})]}),(0,le.jsx)("p",{className:ie.automationDescription,children:"The webhook URL will receive live annotation changes and annotation data."}),(0,le.jsx)("textarea",{className:ie.webhookUrlInput,placeholder:"Webhook URL","aria-label":"Webhook URL",value:t.webhookUrl,onKeyDown:g=>g.stopPropagation(),onChange:g=>n({webhookUrl:g.target.value})})]})]})]})})});function Q8({x:e,y:t,elementName:n,reactComponents:l}){let o=(0,Hd.useRef)(null);return(0,Hd.useLayoutEffect)(()=>{let a=o.current;if(!a)return;let i=()=>{let r=a.offsetWidth,s=a.offsetHeight;a.style.left=`${Math.max(8,Math.min(e,window.innerWidth-r-8))}px`;let d=t-s-8;a.style.top=`${Math.max(8,Math.min(d,window.innerHeight-s-8))}px`};return i(),window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[e,t,n,l]),(0,ic.jsxs)("div",{ref:o,className:`${U.hoverTooltip} ${U.enter}`,children:[l&&(0,ic.jsx)("div",{className:U.hoverReactPath,children:l}),(0,ic.jsx)("div",{className:U.hoverElementName,children:n})]})}var G8=`@charset "UTF-8";
/* Reset box-model and set borders */
/* ============================================ */
*,
::before,
::after {
  border-width: 0;
  border-style: solid;
  box-sizing: border-box;
}

/* Document */
/* ============================================ */
/**
 * 1. Correct line height in all browsers.
 * 2. Prevent adjustments of font size after orientation changes in iOS.
 * 3. Remove gray overlay on links for iOS.
 * 4. Render kerning consistently in all browsers.
 * 5. Correct font smoothing for macOS.
 */
:host {
  /* Inherited properties cross the shadow boundary, so a host page's
     text-transform, letter-spacing or font would otherwise restyle the UI. */
  font: 400 16px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-variant: normal;
  color: initial;
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  text-align: start;
  text-indent: 0;
  text-shadow: none;
  white-space: normal;
  direction: ltr;
  writing-mode: horizontal-tb;
  hyphens: manual;
  word-break: normal;
  overflow-wrap: normal;
  tab-size: 8;
  list-style: none;
  quotes: initial;
  caret-color: auto;
  user-select: auto;
  -webkit-text-fill-color: initial;
  -webkit-text-stroke: 0;
  text-rendering: auto;
  -webkit-text-size-adjust: 100%; /* 2 */
  -webkit-tap-highlight-color: transparent; /* 3 */
  font-feature-settings: "kern"; /* 4 */
  -webkit-font-feature-settings: "kern"; /* 5 */
  -moz-font-feature-settings: "kern"; /* 5 */
  -webkit-font-smoothing: antialiased; /* 5 */
  -moz-osx-font-smoothing: grayscale; /* 5 */
}

/* Vertical rhythm */
/* ============================================ */
p,
table,
blockquote,
address,
pre,
iframe,
form,
figure,
dl {
  margin: 0;
}

/* Headings */
/* ============================================ */
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}

/* Lists (enumeration) */
/* ============================================ */
ul,
ol,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Lists (definition) */
/* ============================================ */
dd {
  margin-left: 0;
}

/* Grouping content */
/* ============================================ */
/**
 * 1. Add the correct box sizing in Firefox.
 * 2. Show the overflow in Edge and IE.
 */
hr {
  clear: both;
  margin: 0;
  border-top-width: 1px;
  height: 0; /* 1 */
  box-sizing: content-box; /* 1 */
  overflow: visible; /* 2 */
  color: inherit;
}

/**
 * 1. Correct the inheritance and scaling of font size in all browsers.
 * 2. Correct the odd \`em\` font sizing in all browsers.
 * 3. Wrap lines by default instead of overflow.
 */
pre {
  font-family: inherit; /* 1 */
  font-size: inherit; /* 2 */
  white-space: pre-line; /* 3 */
}

address {
  font-style: inherit;
}

/* Text-level semantics */
/* ============================================ */
/**
 * Remove the gray background on active links in IE 10.
 */
a {
  background-color: transparent;
  text-decoration: none;
  color: inherit;
}

/**
 * 1. Remove the bottom border in Chrome 57-
 * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.
 */
abbr[title] {
  border-bottom: none; /* 1 */
  text-decoration: none; /* 2 */
}

/**
 * Add the correct font weight in Chrome, Edge, and Safari.
 */
b,
strong {
  font-weight: bolder;
}

/**
 * 1. Correct the inheritance and scaling of font size in all browsers.
 * 2. Correct the odd \`em\` font sizing in all browsers.
 */
code,
kbd,
samp {
  font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace; /* 1 */
  font-size: inherit; /* 2 */
}

/**
 * Add the correct font size in all browsers.
 */
small {
  font-size: 80%;
}

/**
 * Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
 */
sub,
sup {
  position: relative;
  vertical-align: baseline;
  line-height: 0;
  font-size: 75%;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/* Replaced content */
/* ============================================ */
/**
 * Prevent vertical alignment issues.
 */
svg,
img,
embed,
object,
iframe {
  vertical-align: bottom;
}

/*
 * 1. Remove image default bottom space.
 * 2. Prevent image from overflowing the container.
 */
img {
  display: block;
  max-width: 100%;
}

/**
 * Prevent alignment issues on Safari.
 */
@supports (background: -webkit-named-image(i)) {
  svg {
    will-change: transform;
  }
}
/* Forms */
/* ============================================ */
/**
 * Reset form fields to make them styleable.
 * 1. Make form elements stylable across systems iOS especially.
 * 2. Inherit text-transform from parent.
 */
button,
input,
optgroup,
select,
textarea {
  -webkit-appearance: none; /* 1 */
  appearance: none;
  border-radius: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  vertical-align: middle;
  text-align: inherit;
  text-transform: inherit; /* 2 */
  font: inherit;
  color: inherit;
}

/**
 * Correct cursors for clickable elements.
 */
button,
[type=button],
[type=reset],
[type=submit] {
  cursor: pointer;
}

button:disabled,
[type=button]:disabled,
[type=reset]:disabled,
[type=submit]:disabled {
  cursor: default;
}

/**
 * Clickable labels and selects.
 */
select,
label {
  cursor: pointer;
}

/**
 * Improve outlines for Firefox and unify style with input elements & buttons.
 */
:-moz-focusring {
  outline: auto;
}

select:disabled {
  opacity: inherit;
}

/**
 * 1. Remove padding.
 */
option {
  padding: 0; /* 1 */
}

/**
 * Reset to invisible
 */
fieldset {
  margin: 0;
  padding: 0;
  min-width: 0;
}

legend {
  display: contents;
  padding: 0;
}

/**
 * Add the correct vertical alignment in Chrome, Firefox, and Opera.
 */
progress {
  vertical-align: baseline;
}

/**
 * Remove the default vertical scrollbar in IE 10+.
 */
textarea {
  overflow: auto;
}

/**
 * Remove increment and decrement buttons in Chrome.
 */
[type=number]::-webkit-inner-spin-button,
[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

/**
 * Correct the outline style in Safari.
 */
[type=search] {
  outline-offset: -2px;
}

/**
 * Remove the inner padding in Chrome and Safari on macOS.
 */
[type=search]::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
 * Remove the \u2018X\u2019 from Chrome and Safari.
 */
[type=search]::-webkit-search-decoration,
[type=search]::-webkit-search-cancel-button,
[type=search]::-webkit-search-results-button,
[type=search]::-webkit-search-results-decoration {
  display: none;
}

/**
 * 1. Hide file input completely.
 * 2. Remove selected file text.
 * 3. Set cursor to pointer for all browsers.
 */
[type=file] {
  opacity: 0; /* 1 */
  font-size: 0; /* 2 */
  cursor: pointer; /* 3 */
}

/**
	* Fix appearance for Firefox
	*/
[type=number] {
  -moz-appearance: textfield;
}

/**
 * Set cursor to pointer for all browsers.
 */
[type=range] {
  cursor: pointer;
}

/**
 * Reset slider thumbs to make them styleable.
 */
[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
}

[type=range]::-moz-range-thumb {
  -moz-appearance: none;
  appearance: none;
  border-width: 0;
  border-radius: 0;
  background-color: transparent;
}

/* Interactive */
/* ============================================ */
/*
 * Add the correct display in Edge, IE 10+, and Firefox.
 */
details {
  display: block;
}

/*
 * Add the correct display in all browsers.
 */
summary {
  display: list-item;
}

/*
 * Remove outline for editable content.
 */
[contenteditable]:focus {
  outline: auto;
}

/* Tables */
/* ============================================ */
/**
1. Correct table border color inheritance in all Chrome and Safari.
*/
table {
  border-color: inherit; /* 1 */
  border-collapse: collapse;
}

caption {
  text-align: left;
}

td,
th {
  vertical-align: top;
  padding: 0;
}

th {
  text-align: left;
  font-weight: inherit;
}

/* Misc */
/* ============================================ */
/*
 * Make placeholder style consistent across all browsers.
 */
::placeholder {
  color: #999;
  opacity: 1;
}

/*
 * Hide focus outline but keep it visible for Windows High Contrast Mode.
 */
:focus {
  outline-style: solid;
  outline-color: transparent;
}

/*
 * Hide input arrow when used with datalist.
 */
::-webkit-calendar-picker-indicator {
  display: none !important;
}`,V8=[G8,u3,Z2,Y8,M6,c3,Bd,$8,L8,I8,X8,U8].join(`
`);function Ed(e,t="filtered",n){let{name:l,path:o}=Sr(e,n);if(t==="off")return{name:l,elementName:l,path:o,reactComponents:null};let a=b8(e,{mode:t});return{name:a.path?`${a.path} ${l}`:l,elementName:l,path:o,reactComponents:a.path}}var H2=!1,Ch={outputDetail:"standard",autoClearAfterCopy:!1,annotationColorId:"blue",blockInteractions:!0,reactEnabled:!0,markerClickBehavior:"edit",webhookUrl:"",webhooksEnabled:!0},$2=e=>{if(!e||!e.trim())return!1;try{let t=new URL(e.trim());return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},W8={compact:"off",standard:"filtered",detailed:"smart",forensic:"all"},va=e=>e.metaKey||e.ctrlKey,nc=[{id:"indigo",label:"Indigo",srgb:"#6155F5",p3:"color(display-p3 0.38 0.33 0.96)"},{id:"blue",label:"Blue",srgb:"#0088FF",p3:"color(display-p3 0.00 0.53 1.00)"},{id:"cyan",label:"Cyan",srgb:"#00C3D0",p3:"color(display-p3 0.00 0.76 0.82)"},{id:"green",label:"Green",srgb:"#34C759",p3:"color(display-p3 0.20 0.78 0.35)"},{id:"yellow",label:"Yellow",srgb:"#FFCC00",p3:"color(display-p3 1.00 0.80 0.00)"},{id:"orange",label:"Orange",srgb:"#FF8D28",p3:"color(display-p3 1.00 0.55 0.16)"},{id:"red",label:"Red",srgb:"#FF383C",p3:"color(display-p3 1.00 0.22 0.24)"}],F8=[...nc.map(e=>`
    [data-agentation-accent="${e.id}"] {
      --agentation-color-accent: ${e.srgb};
    }
    @supports (color: color(display-p3 0 0 0)) {
      [data-agentation-accent="${e.id}"] {
        --agentation-color-accent: ${e.p3};
      }
    }
  `),`:host {
    ${nc.map(e=>`--agentation-color-${e.id}: ${e.srgb};`).join(`
`)}
  }`,`@supports (color: color(display-p3 0 0 0)) {
    :host {
      ${nc.map(e=>`--agentation-color-${e.id}: ${e.p3};`).join(`
`)}
    }
  }`].join("");function Mh(e){let t=e;for(let l=rl(t.ownerDocument);l;l=rl(t.ownerDocument))t=l;let n=t;for(;n&&n!==document.body;){let o=window.getComputedStyle(n).position;if(o==="fixed"||o==="sticky")return!0;n=n.parentElement}return!1}function Ps(e){return e.kind!=="placement"&&e.kind!=="rearrange"&&e.status!=="resolved"&&e.status!=="dismissed"}function Td(e){let t=Bh(e),n=t.found?t:A8(e);if(n.found&&n.source)return R8(n.source,"path")}function gb(e={}){let t=X4(e.useHashLocation??!1),n=(0,C.useState)(!1),l=G4(e.portalContainer);return l?(0,V2.createPortal)((0,mb.createElement)(Z8,{...e,key:e.useHashLocation?t:void 0,pathname:t,activeState:n,portalHost:l}),l):null}function Z8({pathname:e,activeState:t,portalHost:n,useHashLocation:l=!1,appName:o,enableKeyboardShortcuts:a=!0,identifyingAttributes:i=Uh,copyFormat:r="markdown",onOpenSource:s,portalContainer:d,demoAnnotations:f,demoDelay:h=1e3,enableDemoMode:_=!1,onAnnotationAdd:b,onAnnotationDelete:w,onAnnotationUpdate:N,onAnnotationsClear:M,onCopy:y,onSubmit:x,copyToClipboard:g=!0,endpoint:k,sessionId:I,onSessionCreated:J,webhookUrl:L,className:F}){let[Y,Z]=t,[,re]=(0,C.useState)(0),[K]=(0,C.useState)(()=>D4(document,()=>re(m=>m+1)));(0,C.useEffect)(()=>(K.start(),()=>K.stop()),[K]);let _e=typeof r=="object"?r.attribute:void 0,oe=(0,C.useMemo)(()=>_e?[...i,_e]:i,[i,_e]),se=(0,C.useRef)(!0);(0,C.useLayoutEffect)(()=>(se.current=!0,()=>{se.current=!1}),[]);let he=(0,C.useCallback)(m=>l?q4(JSON.stringify([k,e]),m):m(),[k,e,l]),Ht=(0,C.useRef)(new Map),Ye=(0,C.useRef)(new Set),tt=m=>Ps(m)&&!Ye.current.has(m.id),je=async(...m)=>{let p=await E2(...m),S=m[2],E=S.id;if(E&&(Ht.current.set(E,p.id),Ye.current.has(E)&&Ye.current.add(p.id)),!l){let D=new URL(S.url||window.location.href).pathname,R=ba(D).find(z=>z.id===E);try{if(Ye.current.has(E))await kd(m[0],p.id);else if(R&&R.comment!==S.comment)return await xh(m[0],p.id,{comment:R.comment}),{...p,comment:R.comment}}catch(z){console.warn("[Agentation] Failed to apply changes made during sync:",z)}}return p},St=m=>l?{...m,annotations:m.annotations.filter(p=>!Ye.current.has(p.id)&&Q4(p.url||m.url,e,window.location.origin))}:m,_n=(0,C.useRef)(e);_n.current=e;let $n=(m,p,S,E=e)=>{let D=M4(m,ba(E),p,Ht.current).filter(tt);E===_n.current&&se.current&&Ml(D),ph(E,D,S)},[De,Ml]=(0,C.useState)([]),[_o,Ho]=(0,C.useState)(!0),[$o,fo]=(0,C.useState)(()=>a8()),[ho,mo]=(0,C.useState)(!1);(0,C.useLayoutEffect)(()=>{Y2()},[]);let Vt=(0,C.useRef)(null),El=(0,C.useRef)(null),Yl=(0,C.useRef)(null),Sa=(0,C.useRef)(null),sl=(0,C.useRef)(!1),go=(0,C.useRef)(!1),W=(0,C.useRef)(!1);(0,C.useLayoutEffect)(()=>{Y&&sl.current?(sl.current=!1,Yl.current?.querySelector("button:not(:disabled)")?.focus()):!Y&&go.current&&(go.current=!1,El.current?.focus())},[Y]),(0,C.useEffect)(()=>{let m=S=>{let E=Vt.current;E&&S.composedPath().includes(E)&&S.stopPropagation()},p=["mousedown","click","pointerdown"];return p.forEach(S=>n.addEventListener(S,m)),()=>{p.forEach(S=>n.removeEventListener(S,m))}},[n]);let[fe,Re]=(0,C.useState)(!1),[Ce,xe]=(0,C.useState)(!1),[nt,Xe]=(0,C.useState)(null),[Ke,Fe]=(0,C.useState)({x:0,y:0}),[q,T]=(0,C.useState)(null),[A,$]=(0,C.useState)(!1),X=r2(),P=r2(),[ee,G]=(0,C.useState)("idle"),[ce,we]=(0,C.useState)(!1),Oe=(0,C.useRef)(new Set),ut=(0,C.useRef)(new Set),mt=(0,C.useRef)(),lt=(0,C.useCallback)(()=>{!Oe.current.size&&!mt.current&&we(!1)},[]);(0,C.useEffect)(()=>()=>clearTimeout(mt.current),[]);let[qe,Ae]=(0,C.useState)(null),[At,Et]=(0,C.useState)(null),[gt,Be]=(0,C.useState)([]),[ot,kt]=(0,C.useState)(null),pt=(0,C.useRef)(null);(0,C.useEffect)(()=>()=>{pt.current&&clearTimeout(pt.current)},[]);let[ae,Fn]=(0,C.useState)(null),Un=(0,C.useRef)(null),Sn=(0,C.useRef)(!1),[jl,yo]=(0,C.useState)(!1);(0,C.useLayoutEffect)(()=>{if(ae||!Un.current)return;let m=Un.current;if(Un.current=null,q)return;(Y&&m.isConnected&&!m.disabled?m:El.current)?.focus({preventScroll:!0})},[ae,Y,q]);let[Tl,cl]=(0,C.useState)(null),[Rr,Ar]=(0,C.useState)([]),[ka,Wh]=(0,C.useState)(0),[Fh,Zh]=(0,C.useState)(!1),[dt,vb]=(0,C.useState)(!1),[ul,Kh]=(0,C.useState)(!1),[kn,Ca]=(0,C.useState)(!1),[xb,Jh]=(0,C.useState)("main"),[Ph,$d]=(0,C.useState)(!1),[Je,Ud]=(0,C.useState)(!1),[Ma,Dr]=(0,C.useState)(!1),[$e,po]=(0,C.useState)([]),[fi,Ea]=(0,C.useState)(null),Yd=(0,C.useRef)(!1),[Dt,em]=(0,C.useState)(!1),[tm,jd]=(0,C.useState)(!1),[nm,wb]=(0,C.useState)(1),[lm,K8]=(0,C.useState)("new-page"),[Cn,sc]=(0,C.useState)(""),[Sb,kb]=(0,C.useState)(!1),[me,Il]=(0,C.useState)(null),Id=(0,C.useRef)(!1),Xd=(0,C.useRef)({rearrange:null,placements:[]}),Ta=(0,C.useRef)({rearrange:null,placements:[]}),[Cb,om]=(0,C.useState)(0),[Mb,Eb]=(0,C.useState)(0),[hi,am]=(0,C.useState)([]),[mi,im]=(0,C.useState)(null),rm=(0,C.useRef)({designPlacements:$e,rearrangeState:me,blankCanvas:Dt,wireframePurpose:Cn});rm.current={designPlacements:$e,rearrangeState:me,blankCanvas:Dt,wireframePurpose:Cn};let gi=(0,C.useRef)({placements:hi,rearrange:mi}),zr=(0,C.useRef)(new Set),cc=(0,C.useRef)(new Set),Nl=(0,C.useRef)(null),yi=(0,C.useRef)(),sm=Je&&Y&&!Ma&&Dt;(0,C.useEffect)(()=>{if(sm){jd(!1);let m=Ad(()=>{jd(!0)});return()=>cancelAnimationFrame(m)}else jd(!1)},[sm]);let qd=(0,C.useRef)(new Map),Qd=(0,C.useRef)([]),Gd=(0,C.useRef)(new Map),Na=(0,C.useRef)(null),[dl,Vd]=(0,C.useState)(!1),[Rl,Tb]=(0,C.useState)([]),Wd=(0,C.useRef)(Rl);Wd.current=Rl;let[cm,J8]=(0,C.useState)(null),Fd=(0,C.useRef)(null),P8=(0,C.useRef)(!1),e7=(0,C.useRef)([]),t7=(0,C.useRef)(0),n7=(0,C.useRef)(null),l7=(0,C.useRef)(null),o7=(0,C.useRef)(1),[Zd,um]=(0,C.useState)(!1),pi=(0,C.useRef)(null),[Yn,Uo]=(0,C.useState)([]),Or=(0,C.useRef)(!1),Mn=()=>{$d(!0)},Nb=()=>{$d(!1)},dm=()=>{Zd||(pi.current=st(()=>um(!0),850))},_m=()=>{pi.current&&(clearTimeout(pi.current),pi.current=null),um(!1),Nb()};(0,C.useEffect)(()=>()=>{pi.current&&clearTimeout(pi.current)},[]);let[at,Rb]=(0,C.useState)(()=>{try{let m=JSON.parse(localStorage.getItem("feedback-toolbar-settings")??"");return{...Ch,...m,annotationColorId:nc.find(p=>p.id===m.annotationColorId)?m.annotationColorId:Ch.annotationColorId}}catch{return Ch}}),[Xl,fm]=(0,C.useState)(!0),[hm,mm]=(0,C.useState)(!1),Ab=(0,C.useCallback)(m=>{Rb(p=>({...p,...m}))},[]),Db=(0,C.useCallback)(()=>{Vt.current?.classList.add(U.disableTransitions),fm(m=>!m),Ad(()=>{Vt.current?.classList.remove(U.disableTransitions)})},[]),gm=!1,bo=gm&&at.reactEnabled?W8[at.outputDetail]:"off",[tn,Kd]=(0,C.useState)(l?null:I??null),ym=(0,C.useRef)(!1),[Ra,Aa]=(0,C.useState)(k?"connecting":"disconnected"),[Xt,Jd]=(0,C.useState)(null),[uc,pm]=(0,C.useState)(!1),Lr=(0,C.useRef)(null),dc=(0,C.useRef)(!1),Da=(0,C.useRef)(new Set),_c=(0,C.useRef)(new Map),bm=(0,C.useCallback)(m=>{Da.current.add(m),Al.current===m&&(Al.current=null)},[]),[Yo,fc]=(0,C.useState)(new Set),[_l,Br]=(0,C.useState)(!1),[za,bi]=(0,C.useState)(!1),[vo,Pd]=(0,C.useState)(!1),Oa=(0,C.useRef)(null),fl=(0,C.useRef)(null),Hr=(0,C.useRef)(null),vi=(0,C.useRef)(null),$r=(0,C.useRef)(!1),vm=(0,C.useRef)(0),Al=(0,C.useRef)(null),xm=(0,C.useRef)(null),e_=8,zb=50,t_=(0,C.useRef)(null),hc=(0,C.useRef)(null),Ur=(0,C.useRef)(null),Ob=(0,C.useCallback)(()=>Jh("main"),[]);(0,C.useEffect)(()=>{kn||$d(!1)},[kn]),(0,C.useLayoutEffect)(()=>{kn&&W.current&&(W.current=!1,Vt.current?.querySelector("[data-agentation-settings-panel] button")?.focus())},[kn]);let mc=Y&&_o&&!Je;(0,C.useEffect)(()=>{if(mc)xe(!1),Re(!0),Da.current.clear();else if(fe){xe(!0);let m=st(()=>{Re(!1),xe(!1)},250);return()=>clearTimeout(m)}},[mc]),(0,C.useEffect)(()=>{vb(!0),Wh(window.scrollY);let m=ba(e);Ml(m.filter(Ps)),H2||(mm(!0),H2=!0,st(()=>mm(!1),750));try{let p=localStorage.getItem("feedback-toolbar-theme");p!==null&&fm(p==="dark")}catch{}try{let p=localStorage.getItem("feedback-toolbar-position");if(p){let S=JSON.parse(p);typeof S.x=="number"&&typeof S.y=="number"&&Jd(S)}}catch{}},[e]),(0,C.useEffect)(()=>{dt&&localStorage.setItem("feedback-toolbar-settings",JSON.stringify(at))},[at,dt]),(0,C.useEffect)(()=>{dt&&localStorage.setItem("feedback-toolbar-theme",Xl?"dark":"light")},[Xl,dt]);let wm=(0,C.useRef)(!1);(0,C.useEffect)(()=>{let m=wm.current;wm.current=uc,m&&!uc&&Xt&&dt&&localStorage.setItem("feedback-toolbar-position",JSON.stringify(Xt))},[uc,Xt,dt]),(0,C.useEffect)(()=>{if(!k||!dt||ym.current)return;ym.current=!0,Aa("connecting");let m=window.location.href;he(async()=>{try{let S=l8(e),E=I||S,D=!1;if(E)try{let R=ba(e),z=St(await M2(k,E));Qd.current=z.annotations.filter(ge=>ge.kind==="placement"||ge.kind==="rearrange"),se.current&&(Kd(z.id),Aa("connected")),bh(e,z.id),D=!0;let V=ba(e).filter(Ps),de=new Set(z.annotations.map(ge=>ge.id)),ye=V.filter(ge=>!de.has(ge.id));if(ye.length>0){let pe=`${typeof window<"u"?window.location.origin:""}${e}`,Ie=(await Promise.allSettled(ye.map(be=>je(k,z.id,{...be,sessionId:z.id,url:pe})))).map((be,Me)=>be.status==="fulfilled"?be.value:(console.warn("[Agentation] Failed to sync annotation:",be.reason),ye[Me])),ue=[...z.annotations,...Ie];$n(R,ue,z.id)}else $n(R,z.annotations,z.id)}catch(R){console.warn("[Agentation] Could not join session, creating new:",R),o8(e)}if(!D){let R=await vh(k,m);bh(e,R.id),se.current&&(Kd(R.id),Aa("connected"),J?.(R.id));let z=l?new Map([[e,ba(e)]]):F6(),V=typeof window<"u"?window.location.origin:"",de=[];for(let[ye,ge]of z){let pe=ge.filter(ue=>Ps(ue)&&!ue._syncedTo);if(pe.length===0)continue;let ze=`${V}${ye}`,Ie=ye===e;de.push((async()=>{try{let ue=Ie?R:await vh(k,ze),Me=(await Promise.allSettled(pe.map(Pe=>je(k,ue.id,{...Pe,sessionId:ue.id,url:ze})))).map((Pe,$t)=>Pe.status==="fulfilled"?Pe.value:(console.warn("[Agentation] Failed to sync annotation:",Pe.reason),pe[$t]));$n(pe,Me,ue.id,ye)}catch(ue){console.warn(`[Agentation] Failed to sync annotations for ${ye}:`,ue)}})())}await Promise.allSettled(de)}}catch(S){se.current&&Aa("disconnected"),console.warn("[Agentation] Failed to initialize session, using local storage:",S)}})},[k,I,dt,J,e,he]),(0,C.useEffect)(()=>{if(!k||!dt)return;let m=async()=>{try{(await fetch(`${k}/health`)).ok?Aa("connected"):Aa("disconnected")}catch{Aa("disconnected")}};m();let p=j2(m,1e4);return()=>clearInterval(p)},[k,dt]);let gc=(0,C.useRef)(De),Sm=(0,C.useRef)(!1);(0,C.useLayoutEffect)(()=>{gc.current=De,Sm.current=De.length>0||$e.length>0||(me?.sections.length??0)>0},[De,$e.length,me?.sections.length]);let n_=(0,C.useCallback)(m=>{let p=Oe.current.has(m);if(p&&(ut.current.delete(m),ut.current.size))return;let S=p?new Set(Oe.current):new Set([m]);p&&(Oe.current.clear(),lt());for(let R of S)_c.current.delete(R),Da.current.delete(R);Ml(R=>R.filter(z=>!S.has(z.id))),fc(R=>new Set([...R].filter(z=>!S.has(z))));let E=p?[]:gc.current.filter(R=>R.kind!=="placement"&&R.kind!=="rearrange"),D=E.findIndex(R=>R.id===m);D>=0&&D<E.length-1&&(kt(R=>R===null?D:Math.min(R,D)),pt.current&&clearTimeout(pt.current),pt.current=st(()=>kt(null),200))},[lt]);(0,C.useEffect)(()=>!k||!dt||!tn?void 0:O8(k,tn,()=>Sm.current,S=>{let{id:E,kind:D}=S;if(D==="placement"){for(let[R,z]of qd.current)if(z===E){Na.current?.placements.forget(R),po(V=>V.filter(de=>de.id!==R));break}}else if(D==="rearrange"){for(let[R,z]of Gd.current)if(z===E){Na.current?.rearrange.forget(R),Il(V=>{if(!V)return null;let de=V.sections.filter(ye=>ye.id!==R);return de.length===0?null:{...V,sections:de}});break}}else{if(!gc.current.some(R=>R.id===E))return;fc(R=>new Set(R).add(E))}}),[k,dt,tn]),(0,C.useEffect)(()=>{if(!k||!dt)return;let m=xm.current==="disconnected",p=Ra==="connected";xm.current=Ra,m&&p&&he(async()=>{try{let E=ba(e).filter(Ps);if(E.length===0)return;let R=`${typeof window<"u"?window.location.origin:""}${e}`,z=tn,V=[];if(z)try{V=St(await M2(k,z)).annotations}catch{z=null}z||(z=(await vh(k,R)).id,se.current&&Kd(z),bh(e,z));let de=new Set(V.map(ge=>ge.id)),ye=E.filter(ge=>!de.has(ge.id));if(ye.length>0){let pe=(await Promise.allSettled(ye.map(Ie=>je(k,z,{...Ie,sessionId:z,url:R})))).map((Ie,ue)=>Ie.status==="fulfilled"?Ie.value:(console.warn("[Agentation] Failed to sync annotation on reconnect:",Ie.reason),ye[ue])),ze=[...V,...pe];$n(E,ze,z)}}catch(E){console.warn("[Agentation] Failed to sync on reconnect:",E)}})},[Ra,k,dt,tn,e,he]);let Lb=(0,C.useCallback)(()=>{ho||(mo(!0),Ca(!1),Z(!1),st(()=>{i8(!0),fo(!0),mo(!1)},400))},[ho]);(0,C.useEffect)(()=>{if(!_||!dt||!f||f.length===0||De.length>0)return;let m=[];return m.push(st(()=>{Z(!0)},h-200)),f.forEach((p,S)=>{let E=h+S*300;m.push(st(()=>{let D=document.querySelector(p.selector);if(!D)return;let R=en(D),{name:z,path:V}=Sr(D),de={id:`demo-${Date.now()}-${S}`,x:(R.left+R.width/2)/window.innerWidth*100,y:R.top+R.height/2+window.scrollY,comment:p.comment,element:z,elementPath:V,timestamp:Date.now(),selectedText:p.selectedText,boundingBox:{x:R.left,y:R.top+window.scrollY,width:R.width,height:R.height},nearbyText:Ws(D),cssClasses:Fs(D)};Ml(ye=>[...ye,de])},E))}),()=>{m.forEach(clearTimeout)}},[_,dt,f,h]),(0,C.useEffect)(()=>{let m=()=>{Wh(window.scrollY),re(p=>p+1),Zh(!0),Ur.current&&clearTimeout(Ur.current),Ur.current=st(()=>{Zh(!1)},150)};return K.addEventListener("scroll",m,{passive:!0,capture:!0}),()=>{K.removeEventListener("scroll",m,!0),Ur.current&&clearTimeout(Ur.current)}},[K]),(0,C.useEffect)(()=>{if(!dt)return;let m=De.filter(p=>!Yo.has(p.id));m.length>0?tn?ph(e,m,tn):_b(e,m):localStorage.removeItem(Xh(e))},[De,e,dt,tn,ce,Yo]),(0,C.useEffect)(()=>{if(dt&&!Yd.current){Yd.current=!0;let m=Z6(e);m.length>0&&po(m)}},[dt,e]),(0,C.useEffect)(()=>{if(dt&&Yd.current&&!Dt){let m=$e.filter(p=>!hi.includes(p));m.length>0?K6(e,m):J6(e)}},[$e,e,dt,Dt,hi]),(0,C.useEffect)(()=>{if(dt&&!Id.current){Id.current=!0;let m=P6(e);if(m){let p={...m,sections:m.sections.map(S=>({...S,currentRect:S.currentRect??{...S.originalRect}}))};Il(p)}}},[dt,e]),(0,C.useEffect)(()=>{dt&&Id.current&&!Dt&&(me&&me!==mi?e8(e,me):t8(e))},[me,e,dt,Dt,mi]);let l_=(0,C.useRef)(!1);(0,C.useEffect)(()=>{if(dt&&!l_.current){l_.current=!0;let m=n8(e);m&&(Ta.current={rearrange:m.rearrange,placements:m.placements||[]},m.purpose&&sc(m.purpose))}},[dt,e]),(0,C.useEffect)(()=>{if(!dt||!l_.current||ce)return;let m=Ta.current;Dt?(me?.sections?.length??0)>0||$e.length>0||Cn?C2(e,{rearrange:me,placements:$e,purpose:Cn}):Sd(e):(m.rearrange?.sections?.length??0)>0||m.placements.length>0||Cn?C2(e,{rearrange:m.rearrange,placements:m.placements,purpose:Cn}):Sd(e)},[me,$e,Cn,Dt,e,dt,ce]),(0,C.useEffect)(()=>{Je&&!me&&Il({sections:[],originalOrder:[],detectedAt:Date.now()})},[Je,me]),(0,C.useEffect)(()=>{if(!k||!tn)return;let m={create:S=>he(()=>E2(k,tn,S)),update:(S,E)=>he(()=>xh(k,S,E)),remove:S=>he(()=>kd(k,S))};qd.current=new Map,Gd.current=new Map;let p={placements:z2(m,qd.current,Qd.current.filter(S=>S.kind==="placement")),rearrange:z2(m,Gd.current,Qd.current.filter(S=>S.kind==="rearrange"))};return Na.current=p,()=>{p.placements.dispose(),p.rearrange.dispose(),Na.current===p&&(Na.current=null)}},[k,tn,e,he]),(0,C.useEffect)(()=>{let m=window.location.pathname+window.location.search+window.location.hash;Na.current?.placements.replace($e.filter(p=>!hi.includes(p)).map(p=>({id:p.id,x:p.x/window.innerWidth*100,y:p.y,comment:`Place ${p.type} at (${Math.round(p.x)}, ${Math.round(p.y)}), ${p.width}\xD7${p.height}px${p.text?` \u2014 "${p.text}"`:""}`,element:`[design:${p.type}]`,elementPath:"[placement]",timestamp:p.timestamp,url:m,intent:"change",severity:"important",kind:"placement",placement:{componentType:p.type,width:p.width,height:p.height,scrollY:p.scrollY,text:p.text}})))},[$e,k,tn,e,hi]),(0,C.useEffect)(()=>{let m=Na.current;if(!m)return;if(me===mi){m.rearrange.replace([]);return}let p=st(()=>{let S=window.location.pathname+window.location.search+window.location.hash,E=[];for(let D of me?.sections??[]){let R=D.originalRect,z=D.currentRect,V=Math.abs(R.x-z.x)>1||Math.abs(R.y-z.y)>1||Math.abs(R.width-z.width)>1||Math.abs(R.height-z.height)>1;if(!V&&!D.note)continue;let de=D.note?` \u2014 "${D.note}"`:"";E.push({id:D.id,x:z.x/window.innerWidth*100,y:z.y,comment:V?`Move ${D.label} section (${D.tagName}) \u2014 from (${Math.round(R.x)},${Math.round(R.y)}) ${Math.round(R.width)}\xD7${Math.round(R.height)} to (${Math.round(z.x)},${Math.round(z.y)}) ${Math.round(z.width)}\xD7${Math.round(z.height)}${de}`:`Note on ${D.label} section (${D.tagName})${de}`,element:D.selector,elementPath:"[rearrange]",timestamp:me.detectedAt,url:S,intent:"change",severity:"important",kind:"rearrange",rearrange:{selector:D.selector,label:D.label,tagName:D.tagName,originalRect:R,currentRect:z}})}m.rearrange.replace(E)},300);return()=>clearTimeout(p)},[me,k,tn,e,mi]);let o_=(0,C.useCallback)(()=>{clearTimeout(yi.current),Dr(!1),Ud(!0)},[]);(0,C.useEffect)(()=>()=>clearTimeout(yi.current),[]);let Yr=(0,C.useCallback)(()=>{Dr(!0),Ud(!1),Ea(null),clearTimeout(yi.current),yi.current=st(()=>{Dr(!1)},300)},[]),yc=(0,C.useCallback)(()=>{let m=El.current?.getRootNode();go.current=!!m?.activeElement&&!!Vt.current?.contains(m.activeElement),go.current&&m?.activeElement?.blur(),Ca(!1),Je&&(Dr(!0),Ud(!1),Ea(null),clearTimeout(yi.current),yi.current=st(()=>{Dr(!1)},300)),Z(!1)},[Je]),km=(0,C.useCallback)(()=>{ul||(C4(),Kh(!0))},[ul]),pc=(0,C.useCallback)(()=>{ul&&(i2(),Kh(!1))},[ul]),a_=(0,C.useCallback)(()=>{ul?pc():km()},[ul,km,pc]),jr=(0,C.useCallback)((m=Yn)=>{let p=m.filter(z=>z.element.isConnected);if(p.length===0){Uo([]);return}let S=p[0],E=S.element,D=p.length>1,R=p.map(z=>en(z.element));if(D){let z={left:Math.min(...R.map(Me=>Me.left)),top:Math.min(...R.map(Me=>Me.top)),right:Math.max(...R.map(Me=>Me.right)),bottom:Math.max(...R.map(Me=>Me.bottom))},V=p.slice(0,5).map(Me=>Me.name).join(", "),de=p.length>5?` +${p.length-5} more`:"",ye=R.map(Me=>({x:Me.left,y:Me.top+window.scrollY,width:Me.width,height:Me.height})),pe=p[p.length-1].element,ze=R[R.length-1],Ie=ze.left+ze.width/2,ue=ze.top+ze.height/2,be=Mh(pe);T({id:Date.now().toString(),x:Ie/window.innerWidth*100,y:be?ue:ue+window.scrollY,clientY:ue,element:`${p.length} elements: ${V}${de}`,elementPath:"multi-select",boundingBox:{x:z.left,y:z.top+window.scrollY,width:z.right-z.left,height:z.bottom-z.top},isMultiSelect:!0,isFixed:be,elementBoundingBoxes:ye,multiSelectElements:p.map(Me=>Me.element),targetElement:pe,fullPath:tc(E),accessibility:yd(E),computedStyles:gd(E),computedStylesObj:md(E),nearbyElements:hd(E),cssClasses:Fs(E),nearbyText:Ws(E),sourceFile:Td(E),attributes:ec(E,oe)})}else{let z=R[0],V=Mh(E);T({id:Date.now().toString(),x:z.left/window.innerWidth*100,y:V?z.top:z.top+window.scrollY,clientY:z.top,element:S.name,elementPath:S.path,boundingBox:{x:z.left,y:V?z.top:z.top+window.scrollY,width:z.width,height:z.height},isFixed:V,fullPath:tc(E),accessibility:yd(E),computedStyles:gd(E),computedStylesObj:md(E),nearbyElements:hd(E),cssClasses:Fs(E),nearbyText:Ws(E),reactComponents:S.reactComponents,targetElement:E,sourceFile:Td(E),attributes:ec(E,oe)})}Uo([]),Xe(null)},[Yn,oe]);(0,C.useEffect)(()=>{Y||(T(null),Fn(null),cl(null),Ar([]),Xe(null),Ca(!1),Uo([]),Or.current=!1,ul&&pc())},[Y,ul,pc]),(0,C.useEffect)(()=>()=>{i2()},[]),(0,C.useEffect)(()=>{if(!Y)return;let m=["p","span","h1","h2","h3","h4","h5","h6","li","td","th","label","blockquote","figcaption","caption","legend","dt","dd","pre","code","em","strong","b","i","u","s","a","time","address","cite","q","abbr","dfn","mark","small","sub","sup","[contenteditable]"].join(", "),p=document.createElement("style");return p.id="agentation-cursor",p.textContent=`
      body { cursor: crosshair !important; }
      body :is(${m}) { cursor: text !important; }
    `,document.head.appendChild(p),()=>{let S=document.getElementById("agentation-cursor");S&&S.remove()}},[Y]),(0,C.useEffect)(()=>{if(cm!==null&&Y)return document.documentElement.setAttribute("data-drawing-hover",""),()=>document.documentElement.removeAttribute("data-drawing-hover")},[cm,Y]),(0,C.useEffect)(()=>{if(!Y||q||ae||dl||Je)return;let m=null,p=(R,z,V)=>{let de=Nd(R,z),ye=V?c2(R,z):de;if(!ye||wn(ye,"[data-feedback-toolbar], [data-annotation-popup], [data-annotation-marker]")){Xe(null);return}let{name:ge,elementName:pe,path:ze,reactComponents:Ie}=Ed(ye,bo,oe);Xe({element:ge,elementName:pe,elementPath:ze,rect:en(ye),reactComponents:Ie,isPiercing:V&&ye!==de}),Fe({x:R,y:z})},S=R=>{let z=R.composedPath()[0]||R.target;if(wn(z,"[data-feedback-toolbar], [data-annotation-popup], [data-annotation-marker]")){m=null,Xe(null);return}m={x:R.clientX,y:R.clientY},p(R.clientX,R.clientY,va(R))},E=R=>{(R.key==="Meta"||R.key==="Control")&&m&&p(m.x,m.y,va(R))},D=()=>{m=null,Xe(null)};return K.addEventListener("mousemove",S),K.addEventListener("keydown",E),K.addEventListener("keyup",E),K.addEventListener("mouseleave",D),window.addEventListener("blur",D),()=>{K.removeEventListener("mousemove",S),K.removeEventListener("keydown",E),K.removeEventListener("keyup",E),K.removeEventListener("mouseleave",D),window.removeEventListener("blur",D)}},[Y,q,ae,dl,Je,bo,oe]);let bc=(0,C.useCallback)((m,p)=>{if(ae&&!za){hc.current?.shake();return}if(q&&!_l){if(Vt.current?.querySelector("[data-annotation-popup]:not([data-annotation-card]) textarea")?.value.trim()){t_.current?.shake();return}Br(!0)}if(Un.current=p??null,Sn.current=p?.matches(":focus-visible")??!1,yo(!1),bi(!1),Fn(m),Ae(null),Et(null),Be([]),m.elementBoundingBoxes?.length){let S=[];for(let E of m.elementBoundingBoxes){let D=E.x+E.width/2,R=E.y+E.height/2-window.scrollY,z=pd(D,R,E);z&&S.push(z)}Ar(S),cl(null)}else if(m.boundingBox){let S=m.boundingBox,E=S.x+S.width/2,D=m.isFixed?S.y+S.height/2:S.y+S.height/2-window.scrollY,R=pd(E,D,S);if(R){let z=en(R),V=z.width/S.width,de=z.height/S.height;V<.5||de<.5?cl(null):cl(R)}else cl(null);Ar([])}else cl(null),Ar([])},[q,_l,ae,za]);(0,C.useEffect)(()=>{if(!Y||dl||Je)return;let m=p=>{if($r.current){$r.current=!1,p.preventDefault(),p.stopPropagation();return}let S=p.composedPath()[0]||p.target;if(wn(S,"[data-feedback-toolbar]")||wn(S,"[data-annotation-popup]")||wn(S,"[data-annotation-marker]"))return;if(va(p)&&!q&&!ae){p.preventDefault(),p.stopPropagation(),Or.current=p.shiftKey;let Me=c2(p.clientX,p.clientY);if(!Me)return;let Pe=en(Me),{name:$t,path:An,reactComponents:Ee}=Ed(Me,bo,oe),Se=Yn.findIndex(it=>it.element===Me);Se>=0?Uo(it=>it.filter((qt,Gl)=>Gl!==Se)):Uo(it=>[...it,{element:Me,rect:Pe,name:$t,path:An,reactComponents:Ee??void 0}]);return}let E=wn(S,"button, a, input, select, textarea, [role='button'], [onclick]");if(at.blockInteractions&&(p.preventDefault(),p.stopPropagation()),q&&!_l){if(E&&!at.blockInteractions)return;p.preventDefault(),t_.current?.shake();return}if(ae&&!za){if(E&&!at.blockInteractions)return;p.preventDefault(),hc.current?.shake();return}p.preventDefault();let D=Nd(p.clientX,p.clientY);if(!D)return;let{name:R,path:z,reactComponents:V}=Ed(D,bo,oe),de=en(D),ye=p.clientX/window.innerWidth*100,ge=Mh(D),pe=ge?p.clientY:p.clientY+window.scrollY,ze=D.ownerDocument.defaultView?.getSelection(),Ie;ze&&ze.toString().trim().length>0&&(Ie=ze.toString().trim().slice(0,500));let ue=md(D),be=gd(D);Br(!1),T({id:Date.now().toString(),x:ye,y:pe,clientY:p.clientY,element:R,elementPath:z,selectedText:Ie,boundingBox:{x:de.left,y:ge?de.top:de.top+window.scrollY,width:de.width,height:de.height},nearbyText:Ws(D),cssClasses:Fs(D),isFixed:ge,fullPath:tc(D),accessibility:yd(D),computedStyles:be,computedStylesObj:ue,nearbyElements:hd(D),reactComponents:V??void 0,sourceFile:Td(D),attributes:ec(D,oe),frame:T4(D,p.clientX,p.clientY),targetElement:D}),Xe(null)};return K.addEventListener("click",m,!0),()=>K.removeEventListener("click",m,!0)},[Y,dl,Je,q,_l,ae,za,at.blockInteractions,bo,oe,Yn]),(0,C.useEffect)(()=>{if(!Y)return;let m=S=>{let E=(S.key==="Meta"||S.key==="Control")&&!va(S),D=S.key==="Shift"&&Or.current;(E||D)&&!fl.current&&Yn.length>0&&jr()},p=()=>{Or.current=!1,Uo([]),Xe(null),Oa.current=null,fl.current=null,Pd(!1),vi.current?.replaceChildren()};return K.addEventListener("keyup",m),window.addEventListener("blur",p),()=>{K.removeEventListener("keyup",m),window.removeEventListener("blur",p)}},[Y,Yn,jr]),(0,C.useEffect)(()=>{if(!Y||q||dl||Je)return;let m=p=>{if(p.button!==0)return;$r.current=!1;let S=p.composedPath()[0]||p.target;if(wn(S,"[data-feedback-toolbar]")||wn(S,"[data-annotation-marker]")||wn(S,"[data-annotation-popup]"))return;let E=new Set(["P","SPAN","H1","H2","H3","H4","H5","H6","LI","TD","TH","LABEL","BLOCKQUOTE","FIGCAPTION","CAPTION","LEGEND","DT","DD","PRE","CODE","EM","STRONG","B","I","U","S","A","TIME","ADDRESS","CITE","Q","ABBR","DFN","MARK","SMALL","SUB","SUP"]);!va(p)&&(E.has(S.tagName)||S.isContentEditable)||(p.preventDefault(),Oa.current={x:p.clientX,y:p.clientY})};return K.addEventListener("mousedown",m),()=>K.removeEventListener("mousedown",m)},[Y,q,dl,Je]),(0,C.useEffect)(()=>{if(!Y||q)return;let m=p=>{if(!Oa.current)return;let S=p.clientX-Oa.current.x,E=p.clientY-Oa.current.y,D=S*S+E*E,R=e_*e_;if(!vo&&D>=R&&(fl.current=Oa.current,Pd(!0),p.preventDefault()),(vo||D>=R)&&fl.current){if(Hr.current){let Ee=Math.min(fl.current.x,p.clientX),Se=Math.min(fl.current.y,p.clientY),it=Math.abs(p.clientX-fl.current.x),qt=Math.abs(p.clientY-fl.current.y);Hr.current.style.transform=`translate(${Ee}px, ${Se}px)`,Hr.current.style.width=`${it}px`,Hr.current.style.height=`${qt}px`}let z=Date.now();if(z-vm.current<zb)return;vm.current=z;let V=fl.current.x,de=fl.current.y,ye=Math.min(V,p.clientX),ge=Math.min(de,p.clientY),pe=Math.max(V,p.clientX),ze=Math.max(de,p.clientY),Ie=(ye+pe)/2,ue=(ge+ze)/2,be=new Set,Me=[[ye,ge],[pe,ge],[ye,ze],[pe,ze],[Ie,ue],[Ie,ge],[Ie,ze],[ye,ue],[pe,ue]];for(let[Ee,Se]of Me){let it=document.elementsFromPoint(Ee,Se);for(let qt of it)qt instanceof HTMLElement&&be.add(qt)}let Pe=K.querySelectorAll("button, a, input, img, p, h1, h2, h3, h4, h5, h6, li, label, td, th, div, span, section, article, aside, nav");for(let Ee of Pe)if(Ee instanceof HTMLElement){let Se=en(Ee),it=Se.left+Se.width/2,qt=Se.top+Se.height/2,Gl=it>=ye&&it<=pe&&qt>=ge&&qt<=ze,Dl=Math.min(Se.right,pe)-Math.max(Se.left,ye),Xr=Math.min(Se.bottom,ze)-Math.max(Se.top,ge),Cc=Dl>0&&Xr>0?Dl*Xr:0,fn=Se.width*Se.height,qr=fn>0?Cc/fn:0;(Gl||qr>.5)&&be.add(Ee)}let $t=[],An=new Set(["BUTTON","A","INPUT","IMG","P","H1","H2","H3","H4","H5","H6","LI","LABEL","TD","TH","SECTION","ARTICLE","ASIDE","NAV"]);for(let Ee of be){if(wn(Ee,"[data-feedback-toolbar]")||wn(Ee,"[data-annotation-marker]"))continue;let Se=en(Ee);if(!(Se.width>window.innerWidth*.8&&Se.height>window.innerHeight*.5)&&!(Se.width<10||Se.height<10)&&Se.left<pe&&Se.right>ye&&Se.top<ze&&Se.bottom>ge){let it=Ee.tagName,qt=An.has(it);if(!qt&&(it==="DIV"||it==="SPAN")){let Gl=Ee.textContent&&Ee.textContent.trim().length>0,Dl=Ee.onclick!==null||Ee.getAttribute("role")==="button"||Ee.getAttribute("role")==="link"||Ee.classList.contains("clickable")||Ee.hasAttribute("data-clickable");(Gl||Dl)&&!Ee.querySelector("p, h1, h2, h3, h4, h5, h6, button, a")&&(qt=!0)}if(qt){let Gl=!1;for(let Dl of $t)if(Dl.left<=Se.left&&Dl.right>=Se.right&&Dl.top<=Se.top&&Dl.bottom>=Se.bottom){Gl=!0;break}Gl||$t.push(Se)}}}if(vi.current){let Ee=vi.current;for(;Ee.children.length>$t.length;)Ee.removeChild(Ee.lastChild);$t.forEach((Se,it)=>{let qt=Ee.children[it];qt||(qt=document.createElement("div"),qt.className=U.selectedElementHighlight,Ee.appendChild(qt)),qt.style.transform=`translate(${Se.left}px, ${Se.top}px)`,qt.style.width=`${Se.width}px`,qt.style.height=`${Se.height}px`})}}};return K.addEventListener("mousemove",m,{passive:!0}),()=>K.removeEventListener("mousemove",m)},[Y,q,vo,e_]),(0,C.useEffect)(()=>{if(!Y)return;let m=p=>{let S=vo,E=fl.current;if(vo&&E){$r.current=!0;let D=Math.min(E.x,p.clientX),R=Math.min(E.y,p.clientY),z=Math.max(E.x,p.clientX),V=Math.max(E.y,p.clientY),de=[];K.querySelectorAll("button, a, input, img, p, h1, h2, h3, h4, h5, h6, li, label, td, th").forEach(ue=>{if(!(ue instanceof HTMLElement)||wn(ue,"[data-feedback-toolbar]")||wn(ue,"[data-annotation-marker]"))return;let be=en(ue);be.width>window.innerWidth*.8&&be.height>window.innerHeight*.5||be.width<10||be.height<10||be.left<z&&be.right>D&&be.top<V&&be.bottom>R&&de.push({element:ue,rect:be})});let ge=de.filter(({element:ue})=>!de.some(({element:be})=>be!==ue&&ue.contains(be))),pe=p.clientX/window.innerWidth*100,ze=p.clientY+window.scrollY,Ie=(va(p)||Yn.length>0)&&!q&&!ae;if(ge.length>0)if(Ie){let ue=[...Yn];for(let{element:be,rect:Me}of ge){if(ue.some(Ee=>Ee.element===be))continue;let{name:Pe,path:$t,reactComponents:An}=Ed(be,bo,oe);ue.push({element:be,rect:Me,name:Pe,path:$t,reactComponents:An??void 0})}Or.current=p.shiftKey,va(p)?Uo(ue):jr(ue)}else{let ue=ge.reduce((Ee,{rect:Se})=>({left:Math.min(Ee.left,Se.left),top:Math.min(Ee.top,Se.top),right:Math.max(Ee.right,Se.right),bottom:Math.max(Ee.bottom,Se.bottom)}),{left:1/0,top:1/0,right:-1/0,bottom:-1/0}),be=ge.slice(0,5).map(({element:Ee})=>Sr(Ee).name).join(", "),Me=ge.length>5?` +${ge.length-5} more`:"",Pe=ge[0].element,$t=md(Pe),An=gd(Pe);T({id:Date.now().toString(),x:pe,y:ze,clientY:p.clientY,element:`${ge.length} elements: ${be}${Me}`,elementPath:"multi-select",boundingBox:{x:ue.left,y:ue.top+window.scrollY,width:ue.right-ue.left,height:ue.bottom-ue.top},isMultiSelect:!0,fullPath:tc(Pe),accessibility:yd(Pe),computedStyles:An,computedStylesObj:$t,nearbyElements:hd(Pe),cssClasses:Fs(Pe),nearbyText:Ws(Pe),sourceFile:Td(Pe),attributes:ec(Pe,oe)})}else if(Ie&&!va(p))jr();else if(!Ie){let ue=Math.abs(z-D),be=Math.abs(V-R);ue>20&&be>20&&T({id:Date.now().toString(),x:pe,y:ze,clientY:p.clientY,element:"Area selection",elementPath:`region at (${Math.round(D)}, ${Math.round(R)})`,boundingBox:{x:D,y:R+window.scrollY,width:ue,height:be},isMultiSelect:!0})}Xe(null)}else S&&($r.current=!0);Oa.current=null,fl.current=null,Pd(!1),vi.current&&(vi.current.innerHTML="")};return K.addEventListener("mouseup",m),()=>K.removeEventListener("mouseup",m)},[Y,vo,q,ae,bo,oe,Yn,jr]);let ql=(0,C.useCallback)(async(m,p,S)=>{let E=at.webhookUrl||L;if(!E||!at.webhooksEnabled&&!S)return!1;try{return(await fetch(E,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:m,timestamp:Date.now(),url:typeof window<"u"?window.location.href:void 0,...p})})).ok}catch(D){return console.warn("[Agentation] Webhook failed:",D),!1}},[L,at.webhookUrl,at.webhooksEnabled]),Bb=(0,C.useCallback)(m=>{if(!q||q.isSubmitted)return;let p={id:q.id,x:q.x,y:q.y,comment:m,element:q.element,elementPath:q.elementPath,timestamp:Date.now(),selectedText:q.selectedText,boundingBox:q.boundingBox,nearbyText:q.nearbyText,cssClasses:q.cssClasses,isMultiSelect:q.isMultiSelect,isFixed:q.isFixed,fullPath:q.fullPath,accessibility:q.accessibility,computedStyles:q.computedStyles,nearbyElements:q.nearbyElements,reactComponents:q.reactComponents,sourceFile:q.sourceFile,attributes:q.attributes,frame:q.frame,elementBoundingBoxes:q.elementBoundingBoxes,...k&&tn?{sessionId:tn,url:typeof window<"u"?window.location.href:void 0,status:"pending"}:{}};Ml(S=>[...S,p]),T({...q,isSubmitted:!0}),Al.current=p.id,b?.(p),ql("annotation.add",{annotation:p}),Br(!0),window.getSelection()?.removeAllRanges(),k&&tn&&he(async()=>{let S=await je(k,tn,p);if(l){let E=ba(e);ph(e,E.map(D=>D.id===p.id?{...D,id:S.id}:D),tn)}!se.current||Ye.current.has(p.id)||S.id!==p.id&&(_c.current.set(S.id,p.id),Al.current===p.id&&(Al.current=S.id),Ml(E=>E.map(D=>D.id===p.id?{...D,id:S.id}:D)),Da.current.delete(p.id)&&Da.current.add(S.id))}).catch(S=>{console.warn("[Agentation] Failed to sync annotation:",S)})},[q,b,ql,k,tn,he,e,l]),i_=(0,C.useCallback)(()=>{Br(!0)},[]),r_=(0,C.useCallback)(()=>{T(null),Br(!1)},[]),s_=(0,C.useCallback)(m=>{if(Ye.current.has(m))return;Ye.current.add(m);let p=De.find(S=>S.id===m);ae?.id===m&&(yo(!1),bi(!0)),fc(S=>new Set(S).add(m)),p&&(w?.(p),ql("annotation.delete",{annotation:p})),k&&he(()=>kd(k,Ht.current.get(m)??m)).catch(S=>{console.warn("[Agentation] Failed to delete annotation from server:",S)})},[De,ae,w,ql,k,he]),vc=(0,C.useCallback)(m=>{if(!m){Ae(null),Et(null),Be([]);return}if(Ae(m.id),m.elementBoundingBoxes?.length){let p=[];for(let S of m.elementBoundingBoxes){let E=S.x+S.width/2,D=S.y+S.height/2-window.scrollY,R=pd(E,D,S);R&&p.push(R)}Be(p),Et(null)}else if(m.boundingBox){let p=m.boundingBox,S=p.x+p.width/2,E=m.isFixed?p.y+p.height/2:p.y+p.height/2-window.scrollY,D=pd(S,E,p);if(D){let R=en(D),z=R.width/p.width,V=R.height/p.height;z<.5||V<.5?Et(null):Et(D)}else Et(null);Be([])}else Et(null),Be([])},[]),Hb=(0,C.useCallback)(m=>{if(!ae)return;let p={...ae,comment:m};Fn(p),Ml(S=>S.map(E=>E.id===ae.id?p:E)),N?.(p),ql("annotation.update",{annotation:p}),k&&he(()=>xh(k,Ht.current.get(ae.id)??ae.id,{comment:m})).catch(S=>{console.warn("[Agentation] Failed to update annotation on server:",S)}),yo(Sn.current||!!Un.current?.matches(":hover")),bi(!0)},[ae,N,ql,k,he]),$b=(0,C.useCallback)(()=>{yo(Sn.current||!!Un.current?.matches(":hover")),bi(!0)},[]),Ub=(0,C.useCallback)(()=>{jl&&ae&&!q&&Ae(ae.id),Fn(null),cl(null),Ar([]),bi(!1)},[jl,ae,q]),xc=(0,C.useCallback)((m,p)=>{if(!m.length&&!p)return;we(!0);let S={placements:[...gi.current.placements,...m],rearrange:p??gi.current.rearrange};gi.current=S,am(S.placements),im(S.rearrange),clearTimeout(mt.current),mt.current=st(()=>{po(E=>E.filter(D=>!S.placements.includes(D))),Il(E=>E===S.rearrange?null:E),gi.current={placements:[],rearrange:null},am([]),im(null),mt.current=void 0,lt()},200)},[lt]),La=(0,C.useCallback)(()=>{if(!se.current)return;let m=new Map(gc.current.map(V=>[V.id,V])),p=[];for(let V of De){let de=m.get(Ht.current.get(V.id)??V.id)??m.get(V.id);de&&de.comment===V.comment&&!Ye.current.has(de.id)&&!p.includes(de)&&p.push(de)}let S=p.length,E=rm.current,D=$e.filter(V=>E.designPlacements.includes(V)&&!gi.current.placements.includes(V)),R=me===E.rearrangeState&&me!==gi.current.rearrange?me:null,z=Rl.filter(V=>Wd.current.includes(V));if(!(S===0&&z.length===0&&D.length===0&&!R)){for(let V of p)Ye.current.add(V.id),Oe.current.add(V.id),ut.current.add(V.id);if(fc(V=>new Set([...V,...p.map(de=>de.id)])),M?.(p),ql("annotations.clear",{annotations:p}),k&&Promise.all(p.map(V=>he(()=>kd(k,Ht.current.get(V.id)??V.id)).catch(de=>{console.warn("[Agentation] Failed to delete annotation from server:",de)}))),we(!0),Tb(V=>V.filter(de=>!z.includes(de))),z.length>0&&z.length===Wd.current.length){let V=Fd.current;V?.getContext("2d")?.clearRect(0,0,V.width,V.height)}xc(D,R),Dt===E.blankCanvas&&Cn===E.wireframePurpose&&$e===E.designPlacements&&me===E.rearrangeState&&(Dt&&em(!1),Cn&&sc(""),Ta.current={rearrange:null,placements:[]},Sd(e)),lt()}},[e,De,Rl,$e,me,Dt,Cn,M,ql,k,he,lt,xc]),c_=(0,C.useCallback)(async()=>{let m=X.start(),p=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:e,S=Je&&Dt,E;if(S){if($e.length===0&&!me&&!Cn)return;E=o?Rd(p,o):""}else{if(E=R2(De,p,at.outputDetail,{appName:o}),!E&&Rl.length===0&&$e.length===0&&!me)return;E||(E=Rd(p,o))}if(!S&&Rl.length>0){let R=new Set;for(let ye of De)ye.drawingIndex!=null&&R.add(ye.drawingIndex);let z=Fd.current;z&&(z.style.visibility="hidden");let V=[],de=window.scrollY;for(let ye=0;ye<Rl.length;ye++){if(R.has(ye))continue;let ge=Rl[ye];if(ge.points.length<2)continue;let pe=ge.fixed?ge.points:ge.points.map(Ft=>({x:Ft.x,y:Ft.y-de})),ze=1/0,Ie=1/0,ue=-1/0,be=-1/0;for(let Ft of pe)ze=Math.min(ze,Ft.x),Ie=Math.min(Ie,Ft.y),ue=Math.max(ue,Ft.x),be=Math.max(be,Ft.y);let Me=ue-ze,Pe=be-Ie,$t=Math.hypot(Me,Pe),An=pe[0],Ee=pe[pe.length-1],Se=Math.hypot(Ee.x-An.x,Ee.y-An.y),it,qt=Se<$t*.35,Gl=Me/Math.max(Pe,1);if(qt&&$t>20){let Ft=Math.max(Me,Pe)*.15,jo=0;for(let Ba of pe){let jb=Ba.x-ze<Ft,Ib=ue-Ba.x<Ft,Xb=Ba.y-Ie<Ft,qb=be-Ba.y<Ft;(jb||Ib)&&(Xb||qb)&&jo++}it=jo>pe.length*.15?"box":"circle"}else Gl>3&&Pe<40?it="underline":Se>$t*.5?it="arrow":it="drawing";let Dl=Math.min(10,pe.length),Xr=Math.max(1,Math.floor(pe.length/Dl)),Cc=new Set,fn=[],qr=[An];for(let Ft=Xr;Ft<pe.length-1;Ft+=Xr)qr.push(pe[Ft]);qr.push(Ee);for(let Ft of qr){let jo=Nd(Ft.x,Ft.y);if(!jo||Cc.has(jo)||wn(jo,"[data-feedback-toolbar]"))continue;Cc.add(jo);let{name:Ba}=Sr(jo);fn.includes(Ba)||fn.push(Ba)}let Mc=`${Math.round(ze)},${Math.round(Ie)} \u2192 ${Math.round(ue)},${Math.round(be)}`,wi;(it==="circle"||it==="box")&&fn.length>0?wi=`${it==="box"?"Boxed":"Circled"} **${fn[0]}**${fn.length>1?` (and ${fn.slice(1).join(", ")})`:""} (region: ${Mc})`:it==="underline"&&fn.length>0?wi=`Underlined **${fn[0]}** (${Mc})`:it==="arrow"&&fn.length>=2?wi=`Arrow from **${fn[0]}** to **${fn[fn.length-1]}** (${Math.round(An.x)},${Math.round(An.y)} \u2192 ${Math.round(Ee.x)},${Math.round(Ee.y)})`:fn.length>0?wi=`${it==="arrow"?"Arrow":"Drawing"} near **${fn.join("**, **")}** (region: ${Mc})`:wi=`Drawing at ${Mc}`,V.push(wi)}z&&(z.style.visibility=""),V.length>0&&(E+=`
**Drawings:**
`,V.forEach((ye,ge)=>{E+=`${ge+1}. ${ye}
`}))}if(($e.length>0||S&&Cn)&&(E+=`
`+S2($e,{width:window.innerWidth,height:window.innerHeight},{blankCanvas:Dt,wireframePurpose:Cn||void 0},at.outputDetail)),me){let R=k2(me,at.outputDetail,{width:window.innerWidth,height:window.innerHeight});R&&(E+=`
`+R)}if(E=A2(De,E,r),!E){$(!1);return}let D=!g||await D8(E);y?.(E),X.isCurrent(m)&&($(D),D&&(X.schedule(m,()=>$(!1),2e3),at.autoClearAfterCopy&&X.schedule(m,La,500)))},[De,Rl,$e,me,Dt,Je,lm,Cn,e,at.outputDetail,bo,oe,at.autoClearAfterCopy,La,X,g,r,o,y]),u_=$2(at.webhookUrl)||$2(L||""),Ql=x!=null||u_&&!at.webhooksEnabled,wc=Y?Ql?337:297:44,d_=(0,C.useCallback)(async()=>{let m=P.start(),p=typeof window<"u"?window.location.href:e,S=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:e,E=R2(De,S,at.outputDetail,{appName:o});if(!E&&$e.length===0&&!me)return;if(E||(E=Rd(S,o)),$e.length>0&&(E+=`
`+S2($e,{width:window.innerWidth,height:window.innerHeight},{blankCanvas:Dt,wireframePurpose:Cn||void 0},at.outputDetail)),me){let V=k2(me,at.outputDetail,{width:window.innerWidth,height:window.innerHeight});V&&(E+=`
`+V)}G("sending");let D=!0;try{await x?.(E,De)}catch(V){console.warn("[Agentation] Submit callback failed:",V),D=!1}if(!P.isCurrent(m))return;let R=u_?await ql("submit",{output:E,annotations:De,url:p},!0):!0,z=D&&R&&Ql;P.isCurrent(m)&&(G(z?"sent":"failed"),P.schedule(m,()=>G("idle"),2500),z&&at.autoClearAfterCopy&&P.schedule(m,La,500))},[x,o,ql,De,$e,me,Dt,lm,e,at.outputDetail,bo,oe,at.autoClearAfterCopy,La,u_,Ql,P]);(0,C.useEffect)(()=>{let p=(R=!1)=>{Lr.current?.dragging&&(dc.current=R,pm(!1)),Lr.current=null},S=R=>{let z=Lr.current;if(!z)return;if((R.buttons&1)===0){p();return}let V=R.clientX-z.x,de=R.clientY-z.y,ye=Math.sqrt(V*V+de*de);if(!z.dragging&&ye>10&&(z.dragging=!0,pm(!0)),z.dragging){let ge=z.toolbarX+V,pe=z.toolbarY+de,ze=20,Ie=337,ue=44,Me=Ie-wc,Pe=ze-Me,$t=window.innerWidth-ze-Ie;ge=Math.max(Pe,Math.min($t,ge)),pe=Math.max(ze,Math.min(window.innerHeight-ue-ze,pe)),Jd({x:ge,y:pe})}},E=()=>p(!0),D=()=>p();return K.addEventListener("mousemove",S),K.addEventListener("mouseup",E,!0),window.addEventListener("blur",D),()=>{K.removeEventListener("mousemove",S),K.removeEventListener("mouseup",E,!0),window.removeEventListener("blur",D)}},[wc]);let Yb=(0,C.useCallback)(m=>{if(dc.current=!1,Lr.current=null,m.button!==0||m.target.closest("button")&&(m.target.closest("button")!==El.current||Y)||m.target.closest("[data-agentation-settings-panel]"))return;let p=m.currentTarget.parentElement;if(!p)return;let S=en(p);Lr.current={x:m.clientX,y:m.clientY,toolbarX:S.left,toolbarY:S.top,dragging:!1}},[Y]);(0,C.useLayoutEffect)(()=>{if(!Xt)return;let m=()=>{let D=Xt.x,R=Xt.y,de=20-(337-wc),ye=window.innerWidth-20-337;D=Math.max(de,Math.min(ye,D)),R=Math.max(20,Math.min(window.innerHeight-44-20,R)),(D!==Xt.x||R!==Xt.y)&&Jd({x:D,y:R})};return m(),window.addEventListener("resize",m),()=>window.removeEventListener("resize",m)},[Xt,wc]),(0,C.useEffect)(()=>{if(!a)return;let m=S=>{if(S.defaultPrevented||S.isComposing||S.altKey)return;let E=S.composedPath()[0]||S.target,D=E.tagName==="INPUT"||E.tagName==="TEXTAREA"||E.tagName==="SELECT"||E.isContentEditable;if(S.key==="Escape"){if(d&&!q&&!ae&&(Y||kn||Je||dl||Yn.length)&&(S.preventDefault(),S.stopPropagation()),kn){S.preventDefault(),Ca(!1),Sa.current?.focus();return}if(Je){fi?Ea(null):Yr();return}if(dl){Vd(!1);return}if(Yn.length>0){Uo([]);return}q||ae||Y&&(Mn(),yc())}if((S.metaKey||S.ctrlKey)&&S.shiftKey&&(S.key==="f"||S.key==="F")){S.preventDefault(),Mn(),Y?yc():(El.current?.blur(),sl.current=!0,Z(!0));return}!Y||D||S.metaKey||S.ctrlKey||S.repeat||((S.key==="p"||S.key==="P")&&(S.preventDefault(),Mn(),a_()),(S.key==="l"||S.key==="L")&&(S.preventDefault(),Mn(),dl&&Vd(!1),kn&&Ca(!1),q&&i_(),Je?Yr():o_()),(S.key==="h"||S.key==="H")&&De.length>0&&(S.preventDefault(),Mn(),Ho(R=>!R)),(S.key==="c"||S.key==="C")&&(De.length>0||$e.length>0||me)&&(S.preventDefault(),Mn(),c_()),(S.key==="x"||S.key==="X")&&(De.length>0||$e.length>0||me)&&(S.preventDefault(),Mn(),La(),$e.length>0&&po([]),me&&Il(null)),(S.key==="s"||S.key==="S")&&De.length>0&&Ql&&ee==="idle"&&(S.preventDefault(),Mn(),d_()))},p=!!d;return K.addEventListener("keydown",m,p),()=>K.removeEventListener("keydown",m,p)},[a,d,ae,Y,dl,Je,fi,$e,me,q,De.length,Ql,ee,d_,a_,c_,La,Yn,kn,yc,o_,Yr]);let Ir=De.length>0,Sc=N4(),kc=De.filter(m=>m.kind!=="placement"&&m.kind!=="rearrange"),Cm=kc.flatMap((m,p)=>{let S=Sc(m);return S?[{annotation:S,index:p}]:[]}),Mm=q&&!q.isSubmitted?Sc({...q,comment:"",timestamp:0}):null,Em=[...fe?Cm.map(m=>({...m,pending:!1})):[],...Mm?[{annotation:Mm,index:kc.length,pending:!0}]:[]];(0,C.useEffect)(()=>{let m=new Set(fe&&!$o?Cm.map(({annotation:p})=>p.id):[]);Al.current&&!m.has(Al.current)&&(Al.current=null);for(let p of Yo)m.has(p)||n_(p)}),(0,C.useEffect)(()=>{ae&&Yo.has(ae.id)&&(yo(!1),bi(!0))},[ae,Yo]);let Tm=(0,C.useCallback)(m=>{!Ce&&m.id!==Al.current&&vc(m)},[Ce,vc]),Nm=(0,C.useCallback)(m=>{qe===m&&vc(null)},[qe,vc]),Rm=(0,C.useCallback)((m,p)=>{if(ae&&!za){hc.current?.shake();return}_l&&r_(),at.markerClickBehavior==="delete"?s_(m.id):bc(m,p)},[at.markerClickBehavior,s_,bc,_l,r_,ae,za]),hl=ae??(mc&&!q&&!ce?De.find(m=>m.id===qe&&!Yo.has(m.id)):null),Am=ul?"Resume animations":"Pause animations",Dm=Je?"Exit layout mode":"Layout mode",zm=_o?"Hide markers":"Show markers",Om=r!=="markdown"&&!A2(De,"",r),Lm=typeof r=="object"?`Copy ${r.attribute}`:r==="source"?"Copy source paths":r==="classes"?"Copy classes":Je&&Dt?"Copy layout":"Copy feedback",xi=Y?0:-1;return!dt||$o?null:(0,Q.jsxs)(V4,{host:"agentation-toolbar",className:F,children:[(0,Q.jsxs)("style",{"data-agentation-styles":"toolbar",children:[V8,F8]}),(0,Q.jsxs)("div",{ref:Vt,className:U.positionContext,style:{display:"contents"},"data-agentation-theme":Xl?"dark":"light","data-agentation-accent":at.annotationColorId,"data-agentation-root":"",children:[(0,Q.jsx)("div",{className:U.toolbar,"data-feedback-toolbar":!0,"data-agentation-toolbar":!0,"data-dragging":uc||void 0,style:Xt?{left:Xt.x,top:Xt.y,right:"auto",bottom:"auto"}:void 0,children:(0,Q.jsxs)("div",{className:`${U.toolbarContainer} ${Y?U.expanded:U.collapsed} ${hm?U.entrance:""} ${ho?U.hiding:""} ${Ql?U.serverConnected:""}`,onMouseDown:Yb,children:[(0,Q.jsxs)("div",{className:`${U.controlsContent} ${Y?U.visible:U.hidden} ${Xt&&Xt.y<100?U.tooltipBelow:""} ${Ph||kn?U.tooltipsHidden:""} ${Zd?U.tooltipsInSession:""}`,ref:m=>{Yl.current=m,m?.toggleAttribute("inert",!Y)},role:"group","aria-label":"Feedback controls","aria-hidden":!Y,onMouseEnter:dm,onMouseLeave:_m,children:[(0,Q.jsxs)("div",{className:`${U.buttonWrapper} ${Xt&&Xt.x<120?U.buttonWrapperAlignLeft:""}`,children:[(0,Q.jsx)("button",{className:U.controlButton,onClick:m=>{m.stopPropagation(),Mn(),a_()},"data-active":ul,"aria-label":Am,"aria-pressed":ul,tabIndex:xi,children:(0,Q.jsx)(P4,{size:24,isPaused:ul})}),(0,Q.jsxs)("span",{className:U.buttonTooltip,children:[Am,a&&(0,Q.jsx)("span",{className:U.shortcut,children:"P"})]})]}),(0,Q.jsxs)("div",{className:U.buttonWrapper,children:[(0,Q.jsx)("button",{className:`${U.controlButton} ${Xl?"":U.light}`,onClick:m=>{m.stopPropagation(),Mn(),dl&&Vd(!1),kn&&Ca(!1),q&&i_(),Je?Yr():o_()},"data-active":Je,"aria-label":Dm,"aria-pressed":Je,tabIndex:xi,style:Je&&Dt?{color:"#f97316",background:"rgba(249, 115, 22, 0.25)"}:void 0,children:(0,Q.jsx)(r3,{size:21})}),(0,Q.jsxs)("span",{className:U.buttonTooltip,children:[Dm,a&&(0,Q.jsx)("span",{className:U.shortcut,children:"L"})]})]}),(0,Q.jsxs)("div",{className:U.buttonWrapper,children:[(0,Q.jsx)("button",{className:U.controlButton,onClick:m=>{m.stopPropagation(),Mn(),Ho(!_o)},disabled:!Ir||Je,"aria-label":zm,tabIndex:xi,children:(0,Q.jsx)(J4,{size:24,isOpen:_o})}),(0,Q.jsxs)("span",{className:U.buttonTooltip,children:[zm,a&&(0,Q.jsx)("span",{className:U.shortcut,children:"H"})]})]}),(0,Q.jsxs)("div",{className:U.buttonWrapper,children:[(0,Q.jsx)("button",{className:`${U.controlButton} ${A?U.statusShowing:""}`,onClick:m=>{m.stopPropagation(),Mn(),c_()},disabled:Om||(Je&&Dt?$e.length===0&&!me?.sections?.length:!Ir&&Rl.length===0&&$e.length===0&&!me?.sections?.length),"data-active":A,"aria-label":Lm,tabIndex:xi,children:(0,Q.jsx)(Z4,{size:24,copied:A,tint:Je&&Dt&&($e.length>0||me?.sections?.length)?"#f97316":void 0})}),(0,Q.jsxs)("span",{className:U.buttonTooltip,children:[Om?"No matching metadata":Lm,a&&(0,Q.jsx)("span",{className:U.shortcut,children:"C"})]})]}),(0,Q.jsxs)("div",{className:`${U.buttonWrapper} ${U.sendButtonWrapper} ${Y&&Ql?U.sendButtonVisible:""}`,children:[(0,Q.jsxs)("button",{className:`${U.controlButton} ${ee==="sent"||ee==="failed"?U.statusShowing:""}`,onClick:m=>{m.stopPropagation(),Mn(),d_()},disabled:!Ir||!Ql||ee==="sending","data-no-hover":ee==="sent"||ee==="failed",tabIndex:Y&&Ql?0:-1,"aria-label":"Send Annotations","aria-hidden":!Ql,children:[(0,Q.jsx)(K4,{size:24,state:ee}),Ir&&ee==="idle"&&(0,Q.jsx)("span",{className:U.buttonBadge,children:De.length})]}),(0,Q.jsxs)("span",{className:U.buttonTooltip,children:["Send Annotations",a&&(0,Q.jsx)("span",{className:U.shortcut,children:"S"})]})]}),(0,Q.jsxs)("div",{className:U.buttonWrapper,children:[(0,Q.jsx)("button",{className:U.controlButton,onClick:m=>{m.stopPropagation(),Mn(),La()},disabled:!Ir&&Rl.length===0&&$e.length===0&&!me?.sections?.length,"data-danger":!0,"aria-label":"Clear all",tabIndex:xi,children:(0,Q.jsx)(t3,{size:24})}),(0,Q.jsxs)("span",{className:U.buttonTooltip,children:["Clear all",a&&(0,Q.jsx)("span",{className:U.shortcut,children:"X"})]})]}),(0,Q.jsxs)("div",{className:U.buttonWrapper,children:[(0,Q.jsx)("button",{ref:Sa,"aria-label":"Settings","aria-expanded":kn,tabIndex:xi,className:U.controlButton,onClick:m=>{m.stopPropagation(),Mn(),Je&&Yr(),W.current=!kn&&m.detail===0,Ca(!kn)},children:(0,Q.jsx)(e3,{size:24})}),k&&Ra!=="disconnected"&&(0,Q.jsx)("span",{className:`${U.mcpIndicator} ${U[Ra]} ${kn?U.hidden:""}`,title:Ra==="connected"?"MCP Connected":"MCP Connecting..."}),(0,Q.jsx)("span",{className:U.buttonTooltip,children:"Settings"})]}),(0,Q.jsx)("div",{className:U.divider}),(0,Q.jsx)("div",{className:U.togglePlaceholder,"aria-hidden":"true"})]}),(0,Q.jsxs)("div",{className:`${U.buttonWrapper} ${U.toggleWrapper} ${Xt&&Xt.y<100?U.tooltipBelow:""} ${!Y||Ph||kn?U.tooltipsHidden:""} ${Zd?U.tooltipsInSession:""} ${Xt&&typeof window<"u"&&Xt.x>window.innerWidth-120?U.buttonWrapperAlignRight:""}`,onMouseEnter:dm,onMouseLeave:_m,children:[(0,Q.jsx)("button",{ref:El,type:"button",className:`${U.toggleContent} ${Y?U.expandedToggle:""}`,"aria-label":Y?"Exit":"Start feedback mode","aria-expanded":Y,"aria-keyshortcuts":a?"Meta+Shift+F Control+Shift+F":void 0,title:Y?void 0:a?"Start feedback mode (\u2318\u21E7F / Ctrl+Shift+F)":"Start feedback mode",onClick:m=>{if(dc.current){dc.current=!1,m.preventDefault();return}m.stopPropagation(),Y?(Mn(),yc()):(m.currentTarget.blur(),sl.current=m.detail===0,Z(!0))},children:(0,Q.jsxs)("span",{className:U.toggleIcon,children:[(0,Q.jsx)(d3,{active:Y}),kc.length>0&&(0,Q.jsx)("span",{className:`${U.badge} ${Y?U.fadeOut:""} ${hm?U.entrance:""}`,children:kc.length})]})}),(0,Q.jsxs)("span",{className:U.buttonTooltip,"aria-hidden":!Y,children:["Exit",a&&(0,Q.jsx)("span",{className:U.shortcut,children:"Esc"})]})]}),(0,Q.jsx)(D6,{visible:Je&&Y,activeType:fi,onSelect:m=>{Ea(fi===m?null:m)},isDarkMode:Xl,sectionCount:me?.sections.length??0,onDetectSections:()=>{let m=B6(),p=me?.sections??[],S=new Set(p.map(z=>z.selector)),E=m.filter(z=>!S.has(z.selector)),D=[...p,...E],R=[...me?.originalOrder??[],...E.map(z=>z.id)];Il({sections:D,originalOrder:R,detectedAt:Date.now()})},placementCount:$e.length,onClearPlacements:()=>{xc($e,me)},blankCanvas:Dt,onBlankCanvasChange:m=>{let p={sections:[],originalOrder:[],detectedAt:Date.now()};m?(Xd.current={rearrange:me,placements:$e},Il(Ta.current.rearrange||p),po(Ta.current.placements),Ea(null)):(Ta.current={rearrange:me,placements:$e},Il(Xd.current.rearrange||p),po(Xd.current.placements)),em(m)},wireframePurpose:Cn,onWireframePurposeChange:sc,Tooltip:ci,onDragStart:(m,p)=>{p.preventDefault();let S=ne[m],E=null,D=!1,R=p.clientX,z=p.clientY,de=p.target.closest("[data-feedback-toolbar]")?.getBoundingClientRect().top??window.innerHeight,ye=pe=>{let ze=pe.clientX-R,Ie=pe.clientY-z;if(!D&&(Math.abs(ze)>4||Math.abs(Ie)>4)&&(D=!0,E=document.createElement("div"),E.className=`${B.dragPreview}${Dt?` ${B.dragPreviewWireframe}`:""}`,Vt.current?.appendChild(E)),!E)return;let ue=Math.max(0,de-pe.clientY),be=Math.min(1,ue/180),Me=1-Math.pow(1-be,2),Pe=28,$t=20,An=Math.min(140,S.width*.18),Ee=Math.min(90,S.height*.18),Se=Pe+(An-Pe)*Me,it=$t+(Ee-$t)*Me;E.style.width=`${Se}px`,E.style.height=`${it}px`,E.style.left=`${pe.clientX-Se/2}px`,E.style.top=`${pe.clientY-it/2}px`,E.style.opacity=`${.5+.5*Me}`,E.textContent=Me>.25?m:""},ge=pe=>{if(window.removeEventListener("mousemove",ye),window.removeEventListener("mouseup",ge),E&&E.remove(),D){let ze=S.width,Ie=S.height,ue=window.scrollY,be=Math.max(0,pe.clientX-ze/2),Me=Math.max(0,pe.clientY+ue-Ie/2),Pe={id:`dp-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type:m,x:be,y:Me,width:ze,height:Ie,scrollY:ue,timestamp:Date.now()};po($t=>[...$t,Pe]),Ea(null),zr.current=new Set,om($t=>$t+1)}};window.addEventListener("mousemove",ye),window.addEventListener("mouseup",ge)}}),(0,Q.jsx)(q8,{settings:at,onSettingsChange:Ab,isDarkMode:Xl,onToggleTheme:Db,isDevMode:gm,connectionStatus:Ra,endpoint:k,onExited:Ob,isOpen:Y&&kn,toolbarNearBottom:!!Xt&&Xt.y<230,settingsPage:xb,onSettingsPageChange:Jh,onHideToolbar:Lb})]})}),(Je||Ma)&&(0,Q.jsx)("div",{className:`${B.blankCanvas} ${tm?B.visible:""} ${Sb?B.gridActive:""}`,style:{"--canvas-opacity":nm},"data-feedback-toolbar":!0}),Je&&Dt&&tm&&(0,Q.jsxs)("div",{className:B.wireframeNotice,"data-feedback-toolbar":!0,children:[(0,Q.jsxs)("div",{className:B.wireframeOpacityRow,children:[(0,Q.jsx)("span",{className:B.wireframeOpacityLabel,children:"Toggle Opacity"}),(0,Q.jsx)("input",{type:"range",className:B.wireframeOpacitySlider,min:0,max:1,step:.01,value:nm,onChange:m=>wb(Number(m.target.value))})]}),(0,Q.jsxs)("div",{className:B.wireframeNoticeTitleRow,children:[(0,Q.jsx)("span",{className:B.wireframeNoticeTitle,children:"Wireframe Mode"}),(0,Q.jsx)("span",{className:B.wireframeNoticeDivider}),(0,Q.jsx)("button",{className:B.wireframeStartOver,onClick:()=>{xc($e,me),Ta.current={rearrange:null,placements:[]},sc(""),Sd(e)},children:"Start Over"})]}),"Drag components onto the canvas.",(0,Q.jsx)("br",{}),"Copied output will only include the wireframed layout."]}),(Je||Ma)&&(0,Q.jsx)(E6,{placements:$e,onChange:po,activeComponent:Ma?null:fi,onActiveComponentChange:Ea,isDarkMode:Xl,exiting:Ma,onInteractionChange:kb,passthrough:!fi,extraSnapRects:me?.sections.map(m=>m.currentRect),deselectSignal:Cb,clearingPlacements:hi,wireframe:Dt,onSelectionChange:(m,p)=>{zr.current=m,p||(cc.current=new Set,Eb(S=>S+1))},onDragMove:(m,p)=>{let S=cc.current;if(!(!S.size||!me)){if(!Nl.current){Nl.current=new Map;for(let E of me.sections)S.has(E.id)&&Nl.current.set(E.id,{x:E.currentRect.x,y:E.currentRect.y})}for(let E of me.sections){if(!S.has(E.id)||!Nl.current.get(E.id))continue;let R=Vt.current?.querySelector(`[data-rearrange-section="${E.id}"]`);R&&(R.style.transform=`translate(${m}px, ${p}px)`)}}},onDragEnd:(m,p,S)=>{let E=cc.current,D=Nl.current;if(Nl.current=null,!(!E.size||!me||!D)){for(let R of E){let z=Vt.current?.querySelector(`[data-rearrange-section="${R}"]`);z&&(z.style.transform="")}S&&Il(R=>R&&{...R,sections:R.sections.map(z=>{let V=D.get(z.id);return V?{...z,currentRect:{...z.currentRect,x:Math.max(0,V.x+m),y:Math.max(0,V.y+p)}}:z})})}}}),(Je||Ma)&&me&&(0,Q.jsx)(U6,{rearrangeState:me,onChange:Il,isDarkMode:Xl,exiting:Ma,blankCanvas:Dt,extraSnapRects:$e.map(m=>({x:m.x,y:m.y,width:m.width,height:m.height})),clearing:me===mi,deselectSignal:Mb,onSelectionChange:(m,p)=>{cc.current=m,p||(zr.current=new Set,om(S=>S+1))},onDragMove:(m,p)=>{let S=zr.current;if(S.size){if(!Nl.current){Nl.current=new Map;for(let E of $e)S.has(E.id)&&Nl.current.set(E.id,{x:E.x,y:E.y})}for(let E of S){let D=Vt.current?.querySelector(`[data-design-placement="${E}"]`);D&&(D.style.transform=`translate(${m}px, ${p}px)`)}}},onDragEnd:(m,p,S)=>{let E=zr.current,D=Nl.current;if(Nl.current=null,!(!E.size||!D)){for(let R of E){let z=Vt.current?.querySelector(`[data-design-placement="${R}"]`);z&&(z.style.transform="")}S&&po(R=>R.map(z=>{let V=D.get(z.id);return V?{...z,x:Math.max(0,V.x+m),y:Math.max(0,V.y+p)}:z}))}}}),(0,Q.jsx)("canvas",{ref:Fd,className:`${U.drawCanvas} ${dl?U.active:""}`,"aria-hidden":"true",style:{opacity:mc?1:0,transition:"opacity 0.15s ease"},"data-feedback-toolbar":!0}),(0,Q.jsx)("div",{className:U.markersLayer,"data-feedback-toolbar":!0,children:Em.filter(({annotation:m})=>!m.isFixed).map(({annotation:m,index:p,pending:S},E,D)=>(0,Q.jsx)(O2,{annotation:m,pending:S,globalIndex:p,layerIndex:E,layerSize:D.length,isExiting:S?_l:Ce,isClearing:Oe.current.has(m.id),isAnimated:Da.current.has(m.id),isNew:Al.current===m.id,onEnterComplete:bm,isHovered:!Ce&&qe===m.id,isRemoving:Yo.has(m.id),onRemoveComplete:n_,isEditingAny:!!ae,renumberFrom:ot,markerClickBehavior:at.markerClickBehavior,onHoverEnter:Tm,onHoverLeave:Nm,onClick:Rm,onContextMenu:bc},_c.current.get(m.id)??m.id))}),(0,Q.jsx)("div",{className:U.fixedMarkersLayer,"data-feedback-toolbar":!0,children:Em.filter(({annotation:m})=>m.isFixed).map(({annotation:m,index:p,pending:S},E,D)=>(0,Q.jsx)(O2,{annotation:m,pending:S,globalIndex:p,layerIndex:E,layerSize:D.length,isExiting:S?_l:Ce,isClearing:Oe.current.has(m.id),isAnimated:Da.current.has(m.id),isNew:Al.current===m.id,onEnterComplete:bm,isHovered:!Ce&&qe===m.id,isRemoving:Yo.has(m.id),onRemoveComplete:n_,isEditingAny:!!ae,renumberFrom:ot,markerClickBehavior:at.markerClickBehavior,onHoverEnter:Tm,onHoverLeave:Nm,onClick:Rm,onContextMenu:bc},_c.current.get(m.id)??m.id))}),Y&&nt&&!q&&!ae&&!Fh&&!vo&&(0,Q.jsx)(Q8,{x:Ke.x,y:Ke.y,elementName:nt.elementName,reactComponents:nt.reactComponents}),Y&&(0,Q.jsxs)("div",{className:U.overlay,"data-feedback-toolbar":!0,style:q||ae?{zIndex:"inherit"}:void 0,children:[nt?.rect&&!q&&!Fh&&!vo&&(0,Q.jsx)("div",{className:`${U.hoverHighlight} ${U.enter}`,style:{left:nt.rect.left,top:nt.rect.top,width:nt.rect.width,height:nt.rect.height,borderColor:"color-mix(in srgb, var(--agentation-color-accent) 50%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 4%, transparent)",...nt.isPiercing?{borderStyle:"dashed"}:{}}}),Yn.filter(m=>m.element.isConnected).map((m,p)=>{let S=en(m.element),E=Yn.length>1;return(0,Q.jsx)("div",{className:E?U.multiSelectOutline:U.singleSelectOutline,style:{position:"fixed",left:S.left,top:S.top,width:S.width,height:S.height,...E?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}},p)}),qe&&!q&&(()=>{let m=De.find(D=>D.id===qe);if(!m?.boundingBox)return null;if(m.elementBoundingBoxes?.length)return gt.length>0?gt.filter(D=>D.isConnected).map((D,R)=>{let z=en(D);return(0,Q.jsx)("div",{className:`${U.multiSelectOutline} ${U.enter}`,style:{left:z.left,top:z.top,width:z.width,height:z.height}},`hover-outline-live-${R}`)}):m.elementBoundingBoxes.map((D,R)=>(0,Q.jsx)("div",{className:`${U.multiSelectOutline} ${U.enter}`,style:{left:D.x,top:D.y-ka,width:D.width,height:D.height}},`hover-outline-${R}`));let p=At&&At.isConnected?en(At):null,S=p?{x:p.left,y:p.top,width:p.width,height:p.height}:{x:m.boundingBox.x,y:m.isFixed?m.boundingBox.y:m.boundingBox.y-ka,width:m.boundingBox.width,height:m.boundingBox.height},E=m.isMultiSelect;return(0,Q.jsx)("div",{className:`${E?U.multiSelectOutline:U.singleSelectOutline} ${U.enter}`,style:{left:S.x,top:S.y,width:S.width,height:S.height,...E?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}})})(),q&&(0,Q.jsxs)(Q.Fragment,{children:[q.multiSelectElements?.length?q.multiSelectElements.filter(m=>m.isConnected).map((m,p)=>{let S=en(m);return(0,Q.jsx)("div",{className:`${U.multiSelectOutline} ${_l?U.exit:U.enter}`,style:{left:S.left,top:S.top,width:S.width,height:S.height}},`pending-multi-${p}`)}):q.targetElement&&q.targetElement.isConnected?(()=>{let m=en(q.targetElement);return(0,Q.jsx)("div",{className:`${U.singleSelectOutline} ${_l?U.exit:U.enter}`,style:{left:m.left,top:m.top,width:m.width,height:m.height,borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}})})():q.boundingBox&&(0,Q.jsx)("div",{className:`${q.isMultiSelect?U.multiSelectOutline:U.singleSelectOutline} ${_l?U.exit:U.enter}`,style:{left:q.boundingBox.x,top:q.boundingBox.y-ka,width:q.boundingBox.width,height:q.boundingBox.height,...q.isMultiSelect?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}}),(()=>{let m=Sc(q)??q,p=m.x,S=m.isFixed?m.y:m.y-ka;return(0,Q.jsx)(Q.Fragment,{children:(0,Q.jsx)(Ih,{ref:t_,element:q.element,selectedText:q.selectedText,allowEmpty:typeof r=="object"&&!!q.attributes?.[r.attribute],onOpenSource:s&&q.sourceFile?()=>s(q.sourceFile):void 0,computedStyles:q.computedStylesObj,placeholder:typeof r=="object"&&q.attributes?.[r.attribute]?"Add a note (optional)":q.element==="Area selection"?"What should change in this area?":q.isMultiSelect?"Feedback for this group of elements...":"What should change?",onSubmit:Bb,onExitComplete:r_,onCancel:i_,isExiting:_l,lightMode:!Xl,accentColor:q.isMultiSelect?"var(--agentation-color-green)":"var(--agentation-color-accent)",style:{left:Math.max(160,Math.min(window.innerWidth-160,p/100*window.innerWidth)),...S>window.innerHeight-290?{bottom:window.innerHeight-S+20}:{top:S+20}}},q.id)})})()]}),ae&&(0,Q.jsx)(Q.Fragment,{children:ae.elementBoundingBoxes?.length?Rr.length>0?Rr.filter(m=>m.isConnected).map((m,p)=>{let S=en(m);return(0,Q.jsx)("div",{className:`${U.multiSelectOutline} ${U.enter}`,style:{left:S.left,top:S.top,width:S.width,height:S.height}},`edit-multi-live-${p}`)}):ae.elementBoundingBoxes.map((m,p)=>(0,Q.jsx)("div",{className:`${U.multiSelectOutline} ${U.enter}`,style:{left:m.x,top:m.y-ka,width:m.width,height:m.height}},`edit-multi-${p}`)):(()=>{let m=Tl&&Tl.isConnected?en(Tl):null,p=m?{x:m.left,y:m.top,width:m.width,height:m.height}:ae.boundingBox?{x:ae.boundingBox.x,y:ae.isFixed?ae.boundingBox.y:ae.boundingBox.y-ka,width:ae.boundingBox.width,height:ae.boundingBox.height}:null;return p?(0,Q.jsx)("div",{className:`${ae.isMultiSelect?U.multiSelectOutline:U.singleSelectOutline} ${U.enter}`,style:{left:p.x,top:p.y,width:p.width,height:p.height,...ae.isMultiSelect?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}}):null})()}),vo&&(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)("div",{ref:Hr,className:U.dragSelection}),(0,Q.jsx)("div",{ref:vi,className:U.highlightsContainer})]})]}),(0,Q.jsx)(H8,{ref:hc,annotation:hl?Sc(hl)??ae:null,editing:!!ae,exiting:za,restorePreview:jl,scrollY:ka,lightMode:!Xl,onExited:Ub,editorProps:hl?{element:hl.element,selectedText:hl.selectedText,allowEmpty:typeof r=="object"&&!!hl.attributes?.[r.attribute],onOpenSource:s&&hl.sourceFile?()=>s(hl.sourceFile):void 0,computedStyles:Y4(hl.computedStyles),placeholder:"Edit your feedback...",initialValue:hl.comment,submitLabel:"Save",onSubmit:Hb,onCancel:$b,onDelete:()=>s_(hl.id),accentColor:hl.isMultiSelect?"var(--agentation-color-green)":"var(--agentation-color-accent)"}:void 0})]})]})}function yb(){if(document.getElementById("agentation-root"))return;let e=document.createElement("div");e.id="agentation-root",e.style.position="relative",e.style.zIndex="999999",document.body.appendChild(e);try{(0,bb.createRoot)(e).render(pb.default.createElement(gb,{copyToClipboard:!0,useHashLocation:!1,appName:"SciPortal Chemical Laboratory",onSubmit:(n,l)=>{console.log("[Agentation] Feedback recorded:",l),navigator.clipboard&&navigator.clipboard.writeText&&navigator.clipboard.writeText(n).then(()=>console.log("[Agentation] Copied feedback to clipboard!")).catch(o=>console.warn("[Agentation] Clipboard copy error:",o))}})),console.log("\u2705 Agentation visual feedback toolbar mounted successfully.")}catch(t){console.error("\u274C Failed to mount Agentation:",t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",yb):yb();})();
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
