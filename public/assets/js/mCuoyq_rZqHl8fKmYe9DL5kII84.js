;window.CloudflareApps=window.Eager=window.CloudflareApps||window.Eager||{};window.CloudflareApps=window.CloudflareApps||{};CloudflareApps.siteId="29720ed627f2778f648ea9fa0cc1ab42";CloudflareApps.installs=CloudflareApps.installs||{};;(function(){'use strict'
CloudflareApps.internal=CloudflareApps.internal||{}
var errors=[]
CloudflareApps.internal.placementErrors=errors
var errorHashes={}
function noteError(options){var hash=options.selector+'::'+options.type+'::'+(options.installId||'')
if(errorHashes[hash]){return}
errorHashes[hash]=true
errors.push(options)}
var initializedSelectors={}
var currentInit=false
CloudflareApps.internal.markSelectors=function markSelectors(){if(!currentInit){check()
currentInit=true
setTimeout(function(){currentInit=false})}}
function check(){var installs=window.CloudflareApps.installs
for(var installId in installs){if(!installs.hasOwnProperty(installId)){continue}
var selectors=installs[installId].selectors
if(!selectors){continue}
for(var key in selectors){if(!selectors.hasOwnProperty(key)){continue}
var hash=installId+'::'+key
if(initializedSelectors[hash]){continue}
var els=document.querySelectorAll(selectors[key])
if(els&&els.length>1){noteError({type:'init:too-many',option:key,selector:selectors[key],installId:installId})
initializedSelectors[hash]=true
continue}else if(!els||!els.length){continue}
initializedSelectors[hash]=true
els[0].setAttribute('cfapps-selector',selectors[key])}}}
CloudflareApps.querySelector=function querySelector(selector){if(selector==='body'||selector==='head'){return document[selector]}
CloudflareApps.internal.markSelectors()
var els=document.querySelectorAll('[cfapps-selector="'+selector+'"]')
if(!els||!els.length){noteError({type:'select:not-found:by-attribute',selector:selector})
els=document.querySelectorAll(selector)
if(!els||!els.length){noteError({type:'select:not-found:by-query',selector:selector})
return null}else if(els.length>1){noteError({type:'select:too-many:by-query',selector:selector})}
return els[0]}
if(els.length>1){noteError({type:'select:too-many:by-attribute',selector:selector})}
return els[0]}}());(function(){'use strict'
var prevEls={}
CloudflareApps.createElement=function createElement(options,prevEl){options=options||{}
CloudflareApps.internal.markSelectors()
try{if(prevEl&&prevEl.parentNode){var replacedEl
if(prevEl.cfAppsElementId){replacedEl=prevEls[prevEl.cfAppsElementId]}
if(replacedEl){prevEl.parentNode.replaceChild(replacedEl,prevEl)
delete prevEls[prevEl.cfAppsElementId]}else{prevEl.parentNode.removeChild(prevEl)}}
var element=document.createElement('cloudflare-app')
var container
if(options.pages&&options.pages.URLPatterns&&!CloudflareApps.matchPage(options.pages.URLPatterns)){return element}
try{container=CloudflareApps.querySelector(options.selector)}catch(e){}
if(!container){return element}
if(!container.parentNode&&(options.method==='after'||options.method==='before'||options.method==='replace')){return element}
if(container===document.body){if(options.method==='after'){options.method='append'}else if(options.method==='before'){options.method='prepend'}}
switch(options.method){case'prepend':if(container.firstChild){container.insertBefore(element,container.firstChild)
break}
case'append':container.appendChild(element)
break
case'after':if(container.nextSibling){container.parentNode.insertBefore(element,container.nextSibling)}else{container.parentNode.appendChild(element)}
break
case'before':container.parentNode.insertBefore(element,container)
break
case'replace':try{var id=element.cfAppsElementId=Math.random().toString(36)
prevEls[id]=container}catch(e){}
container.parentNode.replaceChild(element,container)}
return element}catch(e){if(typeof console!=='undefined'&&typeof console.error!=='undefined'){console.error('Error creating Cloudflare Apps element',e)}}}}());(function(){'use strict'
CloudflareApps.matchPage=function matchPage(patterns){if(!patterns||!patterns.length){return true}
var loc=document.location.host+document.location.pathname
if(window.CloudflareApps&&CloudflareApps.proxy&&CloudflareApps.proxy.originalURL){var url=CloudflareApps.proxy.originalURL.parsed
loc=url.host+url.path}
for(var i=0;i<patterns.length;i++){var re=new RegExp(patterns[i],'i')
if(re.test(loc)){return true}}
return false}}());CloudflareApps.installs["RbiY4jKtc0JI"]={appId:"nt4L5NPJq1za",scope:{}};;CloudflareApps.installs["RbiY4jKtc0JI"].options={"blocks":[{"code":"\u003clink href=\"https://factoriomaps.com/assets/css/nav/BurgerKing.css\" rel=\"stylesheet\"/\u003e\n\u003cstyle\u003e\n    nav ul {\n        list-style-type: none;\n        margin: 0;\n        padding: 0;\n        overflow: hidden;\n        background-color: #333;\n        position: fixed;\n        z-index: 100;\n    }\n\n    nav li {\n        float: left;\n        border-right: 1px solid #bbb;\n    }\n\n    nav li:last-child {\n        border-right: none;\n    }\n\n    nav li a {\n        display: block;\n        color: white;\n        text-align: center;\n        padding: 4px 12px;\n        text-decoration: none;\n        font-family: sans-serif;\n        text-rendering: optimizespeed;\n    }\n\n    nav li a:hover {\n        background-color: #111;\n    }\nimg.patreon {\n    position: absolute;\n    margin-top: 0px;\n    right: 0px;\n    width: 200px;\n    z-index: 10;\n}\n\nnav.burger img.patreon {\n    width: 100px;\n}\nnav.burger {\n    position: absolute;\n    width: 100%;\n    z-index: 1000;\n}\n\u003c/style\u003e\n\u003cscript type=\"text/javascript\"\u003e\n\"use strict\";\n(function (window, document) {\n    window.BurgerKing = window.BurgerKing || function (element) {\n        var menu = document.createElement(\"span\"), state = false;\n        menu.classList.add(\"menu-new\");\n        menu.appendChild(document.createTextNode(\"Menu\"));\n        element.insertBefore(menu, element.firstChild);\n        menu.addEventListener(\"click\", function () {\n            if (!state) {\n                element.classList.remove(\"closed\");\n                element.classList.add(\"opened\");\n            } else {\n                element.classList.remove(\"opened\");\n                element.classList.add(\"closed\");\n            }\n            state = !state;\n        });\n\n        var addFries = function () {\n            if (window.matchMedia(\"(max-width: 700px)\").matches) {\n                element.classList.add(\"burger\");\n                element.classList.add(state?\"opened\":\"closed\");\n            } else {\n                element.classList.remove(\"burger\");\n                element.classList.remove(\"opened\");\n                element.classList.remove(\"closed\");\n            }\n        };\n\n        window.addEventListener(\"resize\", function () {\n            addFries();\n        });\n        addFries();\n    };\n})(window, document);\n\u003c/script\u003e","location":{"method":"append","pages":{"URLPatterns":["^factoriomaps.com/?.*$"]},"selector":"head"}},{"code":"\u003cnav id=\"head-nav\"\u003e\n\u003ca href=\"https://patreon.com/Geostyx\"\u003e\u003cimg src=\"https://i.factoriomaps.com/lnhqj/become_a_patron.png\" class=\"patreon\"\u003e\u003c/a\u003e\n\u003cul\u003e\n    \u003cli\u003e\n        \u003ca style=\"background-color: chocolate;\" href=\"https://factoriomaps.com/submit\"\u003eSubmit Save\u003c/a\u003e\n    \u003c/li\u003e\n\n    \u003cli\u003e\n        \u003ca href=\"https://factoriomaps.com/browse.html\"\u003eBrowse Maps\u003c/a\u003e\n    \u003c/li\u003e\n    \u003cli\u003e\n        \u003ca href=\"https://blog.factoriomaps.com/about/\"\u003eAbout\u003c/a\u003e\n    \u003c/li\u003e\n\n        \u003cli\u003e\n        \u003ca href=\"https://twitter.com/FactorioMaps\"\u003eTwitter\u003c/a\u003e\n    \u003c/li\u003e\n\u003cli\u003e\u003ca href=\"https://www.twitch.tv/Geostyx\"\u003eTwitch\u003c/a\u003e\u003c/li\u003e\n    \u003cli\u003e\n        \u003ca href=\"https://factoriomaps.com/gm8\"\u003eBuild on GM8 \u003cimg src=\"https://i.factoriomaps.com/9yfnh/gm8-logo.svg\" style=\"height:14px\"/\u003e\u003c/a\u003e\n    \u003c/li\u003e\n\u003c/ul\u003e\n\u003c/nav\u003e\n\u003cscript type=\"text/javascript\"\u003eBurgerKing(document.getElementById('head-nav'));\u003c/script\u003e","location":{"method":"before","pages":{"URLPatterns":["^browse.factoriomaps.com/?.*$","^factoriomaps.com/?.*$"]},"selector":"body"}},{"code":"\u003ch2\u003e\u003ca href=\"https://factoriomaps.com/browse.html\"\u003eView Latest Maps (with pictures) (beta)\u003c/h2\u003e\u003c/h2\u003e","location":{"method":"append","pages":{"URLPatterns":["^browse.factoriomaps.com/?.*$"]},"selector":"body \u003e header:nth-child(3)"}},{"code":"Graphic design by /u/NoodleThe3rd","location":{"method":"append","pages":{"URLPatterns":["^blog.factoriomaps.com/?.*$"]},"selector":"body \u003e .site-wrapper \u003e .site-footer.outer \u003e .site-footer-content.inner"}},{"code":"\u003c!-- Global site tag (gtag.js) - Google Analytics --\u003e\n\u003cscript async src=\"https://www.googletagmanager.com/gtag/js?id=UA-69504274-4\"\u003e\u003c/script\u003e\n\u003cscript\u003e\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'UA-69504274-4');\n\u003c/script\u003e","location":{"method":"prepend","selector":"head"}}]};;CloudflareApps.installs["RbiY4jKtc0JI"].selectors={"blocks[0].location.selector":"head","blocks[1].location.selector":"body","blocks[2].location.selector":"body \u003e header:nth-child(3)","blocks[3].location.selector":"body \u003e .site-wrapper \u003e .site-footer.outer \u003e .site-footer-content.inner","blocks[4].location.selector":"head"};;if(CloudflareApps.matchPage(CloudflareApps.installs['RbiY4jKtc0JI'].URLPatterns)){(function(){'use strict'
if(!document.addEventListener)return
var options=CloudflareApps.installs['RbiY4jKtc0JI'].options
var elements={}
var prevElements={}
function updateElements(){options.blocks.forEach(function(block,index){var locationHash=[block.location.selector,block.location.method,index].join('!')
var element
if(elements[locationHash]){element=elements[locationHash]}else{if(block.location.method==='replace'){prevElements[locationHash]=document.querySelector(block.location.selector)}
element=CloudflareApps.createElement(block.location)
elements[locationHash]=element}
element.foundInBlocks=true
element.innerHTML=block.code
var scripts=Array.prototype.slice.call(element.querySelectorAll('script'))
if(scripts){scripts.forEach(function(script){var newScript=document.createElement('script')
for(var key=script.attributes.length;key--;){var attr=script.attributes[key]
if(attr.specified){newScript.setAttribute(attr.name,attr.value)}}
newScript.innerHTML=script.innerHTML
element.replaceChild(newScript,script)})}})
for(var hash in elements){if(!elements[hash].foundInBlocks){if(prevElements[hash]){elements[hash].parentNode.replaceChild(prevElements[hash],elements[hash])
delete prevElements[hash]}else{elements[hash].parentNode.removeChild(elements[hash])}
delete elements[hash]}else{delete elements[hash].foundInBlocks}}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',updateElements)}else{updateElements()}
window.CloudflareApps.installs['RbiY4jKtc0JI'].scope={setOptions:function(nextOptions){options=nextOptions
updateElements()}}}())}