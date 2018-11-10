"use strict";
(function(window, document, Isotope, noUiSlider, history, jQuery){
    if (window.Browse) { return ; }

    var globalStore = {
        monthMap: ["Jan.", "Feb.", "Mar.","Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
        counter: 0,
        regExs: {
            sliderTime: /(\d+)h\s+(\d+)m\s+(\d+)s/,
            number: /^\d+$/
        },
        props: {
            author: {
                prop:   "author",
                url:    "user",
                type:   "string",
                search: "equal",
                model:  "username",
                filter: "select",
                mapProp: function(data, instance) {
                    if (!data.meta.source.user||!data.meta.source.user.username) {
                        return "anonymous";
                    }
                    if (instance.authorList.filter(function(value) { return value === data.meta.source.user.username; }).length===0) {
                        instance.authorList.push(data.meta.source.user.username);
                    }
                    return data.meta.source.user.username;
                }
            },
            mods: {
                prop:   "mods",
                url:    "mods",
                type:   "string",
                search: "equal",
                model:  "mods",
                filter: "select",
                mapProp: function(data, instance) {
                    if (!data.meta.map.details.mods) {
                        return [];
                    }
                    var mods = [];
                    for (var e in data.meta.map.details.mods) {
                        if (data.meta.map.details.mods.hasOwnProperty(e)){
                            if (instance.modList.filter(function(value) { return value === data.meta.map.details.mods[e].name; }).length===0) {
                                instance.modList.push(data.meta.map.details.mods[e].name);
                            }
                            mods.push(data.meta.map.details.mods[e].name);
                        }
                    }
                    return mods;
                }
            },
            tags: {
                prop:   "tags",
                url:    "search",
                type:   "string",
                search: "search",
                model:  "tags",
                filter: "input",
                mapProp: function(data) {
                    var tags = data.meta.tags || [];
                    if (data.meta.map.title) {
                        tags.push(data.meta.map.title);
                    }
                    if (data.meta.source.user&&data.meta.source.user.username) {
                        tags.push(data.meta.source.user.username);
                    }
                    if (data.meta.map.contributors) {
                        for (var e in data.meta.map.contributors) {
                            if (data.meta.map.contributors.hasOwnProperty(e)&&data.meta.map.contributors[e].hasOwnProperty("username")) {
                                tags.push(data.meta.map.contributors[e].username);
                            }
                        }
                    }
                    if (data.meta.map.details.mods) {
                        for (var e in data.meta.map.details.mods) {
                            if (data.meta.map.details.mods.hasOwnProperty(e)){
                                tags.push(data.meta.map.details.mods[e].name);
                            }
                        }
                    }
                    return tags;
                }
            },
            hasSave: {
                prop:   "hasSave",
                url:    "save",
                type:   "boolean",
                search: "equal",
                model:  "hasSave",
                filter: "boolean",
                mapProp: function(data) {
                    return (!!data.links.save)||(data.meta.map.hasOwnProperty("layers")&&Array.isArray(data.meta.map.layers)&&data.meta.map.layers.filter(function(layer){
                        return !!layer.save.download;
                    }).length>0);
                }
            },
            isPublicServer: {
                prop:   "isPublicServer",
                url:    "public",
                type:   "boolean",
                search: "equal",
                model:  "isPublicServer",
                filter: "boolean",
                mapProp: ".meta.map.options.publicServer"
            },
            isLayered: {
                prop:   "isLayered",
                url:    "layer",
                type:   "boolean",
                search: "equal",
                model:  "isLayered",
                filter: "boolean",
                mapProp: function(data){
                    return data.meta.map.options.hasOwnProperty("layers")&&data.meta.map.options.layers > 1;
                }
            },
            isModded: {
                prop:   "isModded",
                url:    "modded",
                type:   "boolean",
                search: "equal",
                model:  "isModded",
                filter: "boolean",
                mapProp: ".meta.map.options.modded"
            },
            playTime: {
                model: "playTime",
                filter: "slider",
                mapProp: function(data, instance){
                    if (data.meta.map.details.playTime.ticks>instance.playTime.max){
                        instance.playTime.max = data.meta.map.details.playTime.ticks;
                    }
                    if (null===instance.playTime.min||data.meta.map.details.playTime.ticks<instance.playTime.min) {
                        instance.playTime.min = data.meta.map.details.playTime.ticks;
                    }
                    return data.meta.map.details.playTime.ticks;
                }
            },
            playTimemin: {
                prop:   "playTimemin",
                url:    "playStart",
                type:   "integer",
                search: ">=",
                model:  "playTime"
            },
            playTimemax: {
                prop:   "playTimemax",
                url:    "playEnd",
                type:   "integer",
                search: "<=",
                model:  "playTime"
            }
        },
        counter: 0,
        fn: {
            applyFilter: function(instance) {
                globalStore.fn.setHistory(instance);
                instance.playTime.currentMin = null;
                instance.playTime.currentMax = 0;
                var order={};
                order[instance.order]=false;
                instance.isotope.arrange({
                    filter: globalStore.fn.buildFilterFunction(instance),
                    sortBy: instance.order,
                    sortAscending: order
                });
                instance.playTime.element.noUiSlider.updateOptions({
                    range: {
                        min: Math.max(0, instance.playTime.currentMin - 60),
                        max: instance.playTime.currentMax + 60
                    }
                });
            },
            buildBrowse: function(instance, data, urlSearch){
                globalStore.fn.purgeElement(instance.container);
                instance.buttons = document.createElement("div");
                instance.buttons.classList.add("isotope-filter-container");
                instance.itemContainer = document.createElement("div");
                instance.itemContainer.classList.add("isotope-item-container");
                instance.itemContainer.classList.add("row");
                globalStore.fn.injectInto(instance.container, [instance.buttons, instance.itemContainer]);
                for (var e in data) {
                    if (data.hasOwnProperty(e)) {
                        globalStore.fn.injectInto(instance.itemContainer, [globalStore.fn.buildBrowseBox(instance, data[e])]);
                    }
                }
                globalStore.fn.parseUrl(instance, urlSearch);
                globalStore.fn.initHistory(instance);
                globalStore.fn.initIsotope(instance);
                globalStore.fn.initLazyLoad(instance);
                globalStore.fn.buildFilter(instance);
                globalStore.fn.applyFilter(instance);
                
            },
            buildBrowseBox: function(instance, data){
                var box = document.createElement("div"), header = document.createElement("div"), footer = document.createElement("div"), imgLink = document.createElement("a"), img = document.createElement("img"), headUser = document.createElement("span"), headDate = document.createElement("span"), dateSup = document.createElement("sup"), footTitle = document.createElement("span"), sep = document.createElement("hr"), date = new Date((!data.meta.source.hasOwnProperty("submission")||!data.meta.source.submission.hasOwnProperty("date")) ? "" : data.meta.source.submission.date), sup = "", isotopeData = [];
                box.classList.add("Container-item");
                header.classList.add("header");
                footer.classList.add("footer");
                headUser.classList.add("user");
                headDate.classList.add("date")
                footTitle.classList.add("title");
                sep.classList.add("clear");

                globalStore.fn.injectInto(headUser, [data.meta.source.user.username||"Anonymous"]);

                if (data.meta.map.options.isPublicServer){
                    box.classList.add("public-server");
                }
                if (data.meta.map.options.isAnonymous){
                    box.classList.add("anonymous");
                }
                isotopeData.date = date;
                sup = globalStore.fn.getDateSuffix(date);
                globalStore.fn.injectInto(dateSup, [sup]);
                globalStore.fn.injectInto(headDate, [globalStore.monthMap[date.getMonth()], " ", date.getDate(), dateSup, " ", date.getFullYear()]);
                globalStore.fn.injectInto(footTitle, [data.meta.map.title||"No world title"]);
                img.setAttribute('data-original', instance.mapPreviewPrefix + data.links.preview);
                img.src = 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=';
                img.classList.add('lazyload');
                imgLink.href = data.links.url;
                
                globalStore.fn.injectInto(header, [headUser, headDate, sep]);
                globalStore.fn.injectInto(footer, [footTitle]);
                globalStore.fn.injectInto(imgLink, [img]);
                globalStore.fn.injectInto(box, [header, footer, imgLink]);

                isotopeData.topMap = (data.meta.tags||[]).filter(function(value){
                    return value === "featured";
                }).length>0;
                if (isotopeData.topMap) {
                    box.classList.add("featured");
                }
                for (var e in globalStore.props) {
                    if (globalStore.props.hasOwnProperty(e)) {
                        var propDef = globalStore.props[e];
                        if (propDef.hasOwnProperty('mapProp')) {
                            var value = null;
                            if (typeof propDef.mapProp === "function") {
                                //func
                                value = propDef.mapProp(data, instance);
                            } else {
                                //prop path
                                var path = propDef.mapProp.replace('.', '').split('.'), next = data;
                                for(var e in path) {
                                    if(path.hasOwnProperty(e)&&next.hasOwnProperty(path[e])) {
                                        next = next[path[e]];
                                    }
                                }
                                value = next;
                            }
                            isotopeData[propDef.model] = value;
                        }
                    }
                }
                
                instance.isotopeData[++globalStore.counter] = isotopeData;
                box.setAttribute("data-id", globalStore.counter);
                box.setAttribute("data-date", data.meta.map.saveDate);
                box.setAttribute("data-order", (isotopeData.topMap ? "1_" : "0_")+data.meta.map.saveDate);
                box.setAttribute("data-subdate", data.meta.source.submission.date);
                box.setAttribute("data-suborder", (isotopeData.topMap ? "1_" : "0_")+data.meta.source.submission.date);
                return box;
            },
            buildFilter: function(instance) {
                var selectBoxModContainer = document.createElement("div"), selectBoxContainer = document.createElement("div"), hasSaveCheckboxContainer = document.createElement("div"), moddedCheckboxContainer = document.createElement("div"), publicCheckboxContainer = document.createElement("div"), layeredCheckboxContainer = document.createElement("div"), playTime = document.createElement("div"), playTimeLabel = document.createElement("label"), playTimeContainer = document.createElement("div"), searchInput = document.createElement("input"), searchLabel = document.createElement("label"), searchContainer = document.createElement("div"), hr = document.createElement("hr"), callbacks = [], sortBoxContainer = document.createElement("div");
                selectBoxContainer.classList.add("iso-filter-select-container");
                callbacks.push(globalStore.fn.filterSelect(instance, selectBoxContainer, "Author :", "author", "authorList", {}));
                selectBoxModContainer.classList.add("iso-filter-select-container");
                callbacks.push(globalStore.fn.filterSelect(instance, selectBoxModContainer, "Mods :", "mods", "modList", {
                    maxItems: 5
                }));
                
                publicCheckboxContainer.classList.add("iso-filter-public-container");
                publicCheckboxContainer.classList.add("iso-filter-checkbox-container");
                callbacks.push(globalStore.fn.triStateCheckbox(instance, publicCheckboxContainer, "Public servers :", "isPublicServer"));
                moddedCheckboxContainer.classList.add("iso-filter-modded-container");
                moddedCheckboxContainer.classList.add("iso-filter-checkbox-container");
                callbacks.push(globalStore.fn.triStateCheckbox(instance, moddedCheckboxContainer, "Modded :", "isModded"));
                hasSaveCheckboxContainer.classList.add("iso-filter-save-container");
                hasSaveCheckboxContainer.classList.add("iso-filter-checkbox-container");
                callbacks.push(globalStore.fn.triStateCheckbox(instance, hasSaveCheckboxContainer, "Map download :", "hasSave"));
                layeredCheckboxContainer.classList.add("iso-filter-layer-container");
                layeredCheckboxContainer.classList.add("iso-filter-checkbox-container");
                callbacks.push(globalStore.fn.triStateCheckbox(instance, layeredCheckboxContainer, "Multiple Layers :", "isLayered"));

                playTime.id = playTimeLabel.htmlFor = "iso-filter-playtime";
                instance.playTime.element = playTime;
                noUiSlider.create(playTime, {
                    start: [instance.filters.playTimemin ? instance.filters.playTimemin : Math.max(0, instance.playTime.min-60), instance.filters.playTimemax ? instance.filters.playTimemax : instance.playTime.max+60],
                    tooltips: [true, true],
                    step: 1,
                    margin: 1,
                    range: {
                        "min": Math.max(0, instance.playTime.min-60),
                        "max": instance.playTime.max+60
                    },
                    format: {
                        to: function(value) {
                            var hours = Math.floor(value / (60*60*60)), minutes = Math.floor((value-hours*60*60*60)/(60*60)), seconds = Math.floor((value-(hours*60*60*60+minutes*60*60))/60);
                            return '' + hours + 'h ' + minutes + 'm ' + seconds + 's';
                        },
                        from: function(value){
                            if (Number.isInteger(value)||globalStore.regExs.number.test(value)){
                                return value;
                            }
                            var timeObj=globalStore.regExs.sliderTime.exec(value);
                            value = 60*(parseInt(timeObj[1])*60*60+parseInt(timeObj[2])*60+parseInt(timeObj[3]));
                            return value;
                        }
                    }
                });
                playTime.noUiSlider.on("change", globalStore.fn.noUiSliderChange.bind(playTime.noUiSlider, instance, "playTime"));
                globalStore.fn.injectInto(playTimeLabel, ["Play time : "]);
                playTimeContainer.classList.add("iso-filter-playtime-container");
                globalStore.fn.injectInto(playTimeContainer, [playTimeLabel, playTime]);

                if(instance.filters.tags) {
                    searchInput.value = instance.filters.tags;
                }
                searchLabel.htmlFor = searchInput.id = "iso-filter-searchbox";
                searchInput.addEventListener("keyup", globalStore.fn.inputSearchChange.bind(searchInput, instance, "tags"));
                globalStore.fn.injectInto(searchLabel, ["Search : "]);
                searchContainer.classList.add("iso-filter-search-container");
                globalStore.fn.injectInto(searchContainer, [searchLabel, searchInput]);
                
                hr.classList.add("clear");
                hr.classList.add("invisible");
                sortBoxContainer.classList.add("iso-filter-select-container");
                globalStore.fn.buildSortSelect(instance, sortBoxContainer, "Order By : ", { suborder: "Magic", subdate: "Submission date", date: "Save date" });
                globalStore.fn.injectInto(instance.buttons, [selectBoxContainer, selectBoxModContainer, moddedCheckboxContainer, publicCheckboxContainer, hasSaveCheckboxContainer, layeredCheckboxContainer, searchContainer, playTimeContainer, sortBoxContainer, hr]);
                for (var e in callbacks) {
                    if (callbacks.hasOwnProperty(e)&&callbacks[e]&&typeof callbacks[e] === "function") {
                        callbacks[e]();
                    }
                }
            },
            buildFilterFunction: function(instance) {
                return function(item){
                    var itemData = instance.isotopeData[parseInt(item.getAttribute("data-id"))];
                    for (var e in instance.filters) {
                        if (instance.filters.hasOwnProperty(e) && globalStore.props.hasOwnProperty(e)) {
                            var value = instance.filters[e], propDef = globalStore.props[e];
                            if (propDef.type&&value !== undefined){
                                var propValue = itemData[propDef.model];
                                if (!(propValue!==undefined)) {
                                    return false ;
                                }
                                if (!Array.isArray(propValue)){
                                    propValue=[propValue];
                                }
                                if (propValue.filter(function(propValue){
                                    switch(propDef.search) {
                                    case "equal":
                                        if (Array.isArray(value)) {
                                            if (value.filter(function(value){
                                                return value===propValue;
                                            }).length !== 1) {
                                                return false;
                                            }
                                        } else {
                                            if (propValue !== value) {
                                                return false;
                                            }
                                        }
                                           break;
                                           case "search":
                                           if (propValue.toLocaleLowerCase().indexOf(value.toLocaleLowerCase())===-1) {
                                               return false;
                                           }
                                           break;
                                           case ">":
                                           if (propValue<=value) {
                                               return false;
                                           }
                                           break;
                                           case ">=":
                                           if (propValue<value) {
                                               return false;
                                           }
                                           break;
                                           case "<":
                                           if (propValue>=value) {
                                               return false;
                                           }
                                           break;
                                           case "<=":
                                           if (propValue>value) {
                                               return false;
                                           }
                                           break;
                                          }
                                        return true;
                                    }).length<(Array.isArray(value)?value.length:1)) {
                                    if (propDef.model === "playTime") {
                                        if (itemData.playTime>instance.playTime.currentMax) {
                                            instance.playTime.currentMax = itemData.playTime;
                                        }
                                        if (null===instance.playTime.currentMin||itemData.playTime<instance.playTime.currentMin) {
                                            instance.playTime.currentMin=itemData.playTime;
                                        }
                                    }
                                    return false;
                                }
                            }
                        }
                    }
                    if (itemData.playTime>instance.playTime.currentMax) {
                        instance.playTime.currentMax = itemData.playTime;
                    }
                    if (null===instance.playTime.currentMin||itemData.playTime<instance.playTime.currentMin) {
                        instance.playTime.currentMin=itemData.playTime;
                    }
                    return true;
                }
            },
            buildSortSelect: function(instance, container, label, options) {
                var sortBox = document.createElement("select"), labelObj = document.createElement("label");
                globalStore.fn.injectInto(labelObj, [label]);
                for (var e in options) {
                    if (options.hasOwnProperty(e)) {
                        var option = document.createElement("option");
                        option.value=e;
                        globalStore.fn.injectInto(option, [options[e]])
                        globalStore.fn.injectInto(sortBox, [option]);
                    }
                }
                labelObj.htmlFor = sortBox.id = "sort-select";
                globalStore.fn.injectInto(container, [labelObj, sortBox]);
                sortBox.addEventListener("change", function(ev){
                    instance.order = ev.target[ev.target.selectedIndex].value;
                    globalStore.fn.applyFilter(instance);
                });
            },
            filterObject: function(data, predicate){
                var data = Object(data), result=[];

                Object.keys(data).forEach(function(key) {
                    var value = data[key];
                    if (predicate(value, key, data)) {
                        result.push(value);
                    }
                });
                
                return result;
            },
            filterSelect: function(instance, container, label, prop, sourceProp, options){
                var selectBox = document.createElement("select"), selectBoxLabel = document.createElement("label"), nullOption = document.createElement("option");
                if (options&&options.hasOwnProperty("maxItems")&&options.maxItems>1) {
                    selectBox.multiple="multiple";
                } else {
                    options.maxItems = 1;
                }
                instance[sourceProp].sort(function(item1, item2){
                    return item1.toLocaleLowerCase()>item2.toLocaleLowerCase() ? 1 : -1;
                });
                nullOption.value = "";
                globalStore.fn.injectInto(nullOption, [" - Select one to filter - "]);
                globalStore.fn.injectInto(selectBox, [nullOption]);
                
                for (var e in instance[sourceProp]) {
                    if (instance[sourceProp].hasOwnProperty(e)) {
                        var option = document.createElement("option");
                        globalStore.fn.injectInto(option, [instance[sourceProp][e]]);
                        if (instance.filters.hasOwnProperty(prop)&&((Array.isArray(instance.filters[prop])&&instance.filters[prop].filter(function(matchValue){ return matchValue===instance[sourceProp][e];}).length===1)||(instance.filters[prop]===instance[sourceProp][e]))) {
                            option.selected = true;
                        }
                        globalStore.fn.injectInto(selectBox, [option]);
                    }
                }
                selectBox.addEventListener("change", function(ev) {
                    instance.filters[prop] = null;
                    var element = this.options[this.options.selectedIndex] ? this.options[this.options.selectedIndex].value : null;
                    if (element) {
                        instance.filters[prop] = element;
                    } else {
                        delete instance.filters[prop];
                    }
                    globalStore.fn.applyFilter(instance);
                });
                selectBox.id = selectBoxLabel.htmlFor = "iso-filter-" + prop;
                globalStore.fn.injectInto(selectBoxLabel, [label]);
                globalStore.fn.injectInto(container, [selectBoxLabel, selectBox]);
                return function(){
                    $(selectBox).selectize(options).on("change", function(ev) {
                        var values = $.makeArray($(this).children().map(function(i, el){
                            return el.value;
                        }));
                        instance.filters[prop] = null;
                        if (values.length>0) {
                            instance.filters[prop] = values.length===1 ? values[0] : values;
                        } else {
                            delete instance.filters[prop];
                        }
                        globalStore.fn.applyFilter(instance);
                    });
                };
            },
            generateUrl: function(instance) {
                var url = "";
                for (var e in globalStore.props) {
                    if (globalStore.props.hasOwnProperty(e)) {
                        var propDef = globalStore.props[e], value = null;
                        if (instance.filters.hasOwnProperty(propDef.prop) && instance.filters[propDef.prop] !== undefined) {
                            switch (propDef.type) {
                            case "boolean":
                                value = instance.filters[propDef.prop] ? "true" : "false";
                                break;
                            case "string":
                            case "integer":
                            default:
                                value = JSON.stringify(instance.filters[propDef.prop]);
                            }
                            url += "&" + propDef.url + "=" + window.encodeURIComponent(value);
                        }
                    }
                }
                return window.location.pathname + url.replace("&", "?");
            },
            getDateSuffix: function(date) {
                var ret = "";
                switch (date.getDate()){
                case 1: case 11: case 21: case 31:
                    ret = "st";
                    break;
                case 2: case 22:
                    ret = "nd";
                    break;
                case 3: case 32:
                    ret = "rd";
                    break;
                default:
                    ret = "th";
                }
                return ret;
            },
            initHistory: function(instance) {
                
            },
            initIsotope: function(instance) {
                instance.isotope = new Isotope(instance.itemContainer, {
                    getSortData: {
                        suborder: '[data-suborder]',
                        order: '[data-order]',
                        subdate: '[data-subdate]',
                        date: '[data-date]'
                    }
                });
            },
            initLazyLoad: function(instance) {
                if (jQuery.fn.lazyload) {
                    instance.lazyImgs = $('img.lazyload');
                    instance.lazyLoad = instance.lazyImgs.lazyload({
                        failure_limit: Math.max(instance.lazyImgs.length-1,0),
                        event: 'lazylazy'
                    });
                    instance.isotope.on('layoutComplete', function(){
                        globalStore.fn.lazyLoadImgs(instance, 'lazylazy');
                    });
                    $(window).on('scroll', function(){
                        globalStore.fn.lazyLoadImgs(instance, 'lazylazy');
                    });
                }
            },
            injectInto: function(parent, child) {
                for (var e in child){
                    if (child.hasOwnProperty(e)) {
                        if (child[e] instanceof Element) {
                            parent.appendChild(child[e]);
                        } else {
                            parent.appendChild(document.createTextNode(child[e]));
                        }
                    }
                }        
            },
            inputSearchChange: function(instance, prop) {
                if (this.value) {
                    instance.filters[prop] = this.value;
                } else {
                    delete instance.filters[prop];
                }
                globalStore.fn.applyFilter(instance);
            },
            lazyLoadImgs: function(instance, evt){
                instance.lazyImgs.filter(function(){
                    var rect = this.getBoundingClientRect();
                    return rect.top >= 0 && rect.top <= window.innerHeight;
                }).trigger(evt);
            },
            noUiSliderChange: function(instance, prop, encodedValues, handle, values){
                instance.filters[prop+"min"] = parseFloat(values[0]);
                instance.filters[prop+"max"] = parseFloat(values[1]);
                globalStore.fn.applyFilter(instance);
            },
            parseUrl: function(instance, url) {
                var fragments = url.replace("?", "").split("&");
                if (fragments.length>0){
                    instance.filters = {};
                    for (var e in fragments) {
                        if (fragments.hasOwnProperty(e)) {
                            var fragmentValue = fragments[e].split("=");
                            if (!(fragmentValue[1] === undefined)){
                                var value = window.decodeURIComponent(fragmentValue[1]), filter = globalStore.fn.filterObject(globalStore.props, function(item) { return (item.url === fragmentValue[0]); });
                                if (filter.length===1&&(filter=filter[0])) {
                                    switch (filter.type) {
                                    case "boolean":
                                        value = (value === "true");
                                        break;
                                    case "integer":
                                        value = parseFloat(value);
                                        break;
                                    }
                                    try {
                                        instance.filters[filter.prop] = JSON.parse(value);
                                    } catch (e) {
                                        window.console.error("Failure parsing JSON");
                                    }
                                }
                            }
                        }
                    }
                }
            },
            purgeElement: function(element) {
                while (element.lastChild){
                    element.removeChild(element.lastChild);
                }
            },
            setHistory: function(instance){
                if (history) {
                    history.replaceState(instance.filters, "", globalStore.fn.generateUrl(instance));
                }
            },
            triStateCheckbox: function(instance, container, display, prop) {
                var checkbox = document.createElement("input"), label = document.createElement("label"), id = "iso-filter-cb-" + prop;
                checkbox.type = "checkbox";
                checkbox.id = label.htmlFor = id;
                globalStore.fn.injectInto(label, [ display ]);
                switch (true) {
                case instance.filters[prop] === true:
                    checkbox.indeterminate = false;
                    checkbox.checked = true;
                    checkbox.setAttribute("state", "checked");
                    break;
                case instance.filters[prop] === false:
                    checkbox.indeterminate = false;
                    checkbox.checked = false;
                    checkbox.setAttribute("state", "unchecked");
                    break;
                default:
                    checkbox.indeterminate = true;
                    checkbox.checked = false;
                    checkbox.setAttribute("state", "none");
                    break;
                }
                checkbox.addEventListener("click", globalStore.fn.triStateCheckboxClick.bind(checkbox, instance, prop));
                globalStore.fn.injectInto(container, [label, checkbox]);
                return null;
            },
            triStateCheckboxClick: function(instance, prop, ev){
                switch (this.getAttribute("state")) {
                case "none":
                    this.checked = true;
                    this.indeterminate = false;
                    this.setAttribute("state", "checked");
                    instance.filters[prop] = true;
                    break;
                case "checked":
                    this.checked = false;
                    this.setAttribute("state", "unchecked");
                    instance.filters[prop] = false;
                    break;
                case "unchecked":
                    this.indeterminate = true;
                    delete instance.filters[prop];
                    this.setAttribute("state", "none");
                    break;
                }
                ev.stopPropagation();
                globalStore.fn.applyFilter(instance);
                return false;
            }
        }
    };
    window.Browse = function(jsonPath, containerId, mapPreviewPrefix, urlSearch){
        var container = document.getElementById(containerId), localStore = {
            isotopeData: {},
            authorList: [],
            modList: [],
            playTime: {
                min: null,
                max: 0,
                currentMin: null,
                currentMax: null
            },
            search: null,
            filters: {},
            isotope: null,
            lazyLoad: null,
            lazyImgs: null,
            container: container,
            mapPreviewPrefix: mapPreviewPrefix,
            order: "suborder"
        }
        
        if (localStore.container){
            localStore.container.innerHTML = "Downloading map data...";
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(event){
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status > 199 && this.status < 300) {
                        try {
                            localStore.container.innerHTML = "Building page...";
                            globalStore.fn.buildBrowse(localStore, JSON.parse(this.responseText), urlSearch);
                        } catch (e) {
                            localStore.container.innerHTML = "An error has occured<br />Please drop by Discord to tell us how badly it affects your Factorio addiction.<br />100% no biters. 0% no bots.";
                            window.console.error("Error parsing map data", e);
                        }
                    } else {
                        localStore.container.innerHTML = "Unable to fetch maps, please retry later.<br />Or stop by the Discord to see if there's an update in progress. 100% no worms. 0% no belts.";
                        window.console.error("Error querying maps data", this);
                    }
                }
            }
            xhr.open("GET", jsonPath, true);
            xhr.send(null);
        } else {
            window.console.error("No container");
        }
    };
})(window, document, window.Isotope, window.noUiSlider, window.history, window.jQuery);
