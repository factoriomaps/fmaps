"use strict";
(function (window, document, Isotope, noUiSlider, history) {
    if (window.Browse) { return; }

    var globalStore = {
        monthMap: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Nov.", "Dec."],
        counter: 0,
        fn: {
            applyFilter: function (instance) {
                globalStore.fn.setHistory(instance);
                instance.isotope.arrange({
                    filter: globalStore.fn.buildFilterFunction(instance),
                    sortBy: 'initial',
                    sortAscending: {
                        'initial': false
                    }
                });
            },
            buildBrowse: function (instance, data, urlSearch) {
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
                globalStore.fn.buildFilter(instance);
                globalStore.fn.applyFilter(instance);

            },
            buildBrowseBox: function (instance, data) {
                var box = document.createElement("div"), header = document.createElement("div"), footer = document.createElement("div"), imgLink = document.createElement("a"), img = document.createElement("img"), headUser = document.createElement("span"), headDate = document.createElement("span"), dateSup = document.createElement("sup"), footTitle = document.createElement("span"), sep = document.createElement("hr"), date = new Date(data.date), sup = "", isotopeData = data.options;
                box.classList.add("Container-item");
                header.classList.add("header");
                footer.classList.add("footer");
                headUser.classList.add("user");
                headDate.classList.add("date")
                footTitle.classList.add("title");
                sep.classList.add("clear");

                globalStore.fn.injectInto(headUser, [data.username || "Anonymous"]);

                if (data.options.isPublicServer) {
                    box.classList.add("public-server");
                }
                if (data.options.isAnonymous) {
                    box.classList.add("anonymous");
                    isotopeData.username = "anonymous";
                } else {
                    isotopeData.username = data.username;
                    if (instance.authorList.filter(function (value) { return value === isotopeData.username; }).length === 0) {
                        instance.authorList.push(isotopeData.username);
                    }
                }
                if (data.playTime) {
                    isotopeData.playTime = data.playTime.hours * 60 * 60 + data.playTime.minutes * 60 + data.playTime.seconds;
                    if (isotopeData.playTime > instance.maxPlayTime) {
                        instance.maxPlayTime = isotopeData.playTime;
                    }
                } else {
                    isotopeData.playTime = 0;
                }
                isotopeData.date = date;
                sup = globalStore.fn.getDateSuffix(date);
                globalStore.fn.injectInto(dateSup, [sup]);
                globalStore.fn.injectInto(headDate, [globalStore.monthMap[date.getMonth()], " ", date.getDate(), dateSup, " ", date.getFullYear()]);
                globalStore.fn.injectInto(footTitle, [isotopeData.title = (data.worldName || "No world title")]);
                img.src = instance.mapPreviewPrefix + data.mapPreviewUrl;
                imgLink.href = data.url;

                globalStore.fn.injectInto(header, [headUser, headDate, sep]);
                globalStore.fn.injectInto(footer, [footTitle]);
                globalStore.fn.injectInto(imgLink, [img]);
                globalStore.fn.injectInto(box, [header, footer, imgLink]);

                isotopeData.topMap = (data.search.tags || []).filter(function (value) {
                    return value === "featured";
                }).length > 0;
                if (isotopeData.topMap) {
                    box.classList.add("featured");
                }
                isotopeData.tags = data.search.tags || [];
                isotopeData.tags.push(isotopeData.title);
                isotopeData.tags.push(isotopeData.username);
                instance.isotopeData[++globalStore.counter] = isotopeData;
                box.setAttribute("data-id", globalStore.counter);
                box.setAttribute("data-date", data.date);
                box.setAttribute("data-order", (isotopeData.topMap ? "1_" : "0_") + data.date)
                return box;
            },
            buildFilter: function (instance) {
                var selectBox = document.createElement("select"), selectBoxLabel = document.createElement("label"), selectBoxContainer = document.createElement("div"), nullOption = document.createElement("option"), publicCheckbox = document.createElement("input"), labelPublicCheckbox = document.createElement("label"), publicCheckboxContainer = document.createElement("div"), playTime = document.createElement("div"), playTimeLabel = document.createElement("label"), playTimeContainer = document.createElement("div"), searchInput = document.createElement("input"), searchLabel = document.createElement("label"), searchContainer = document.createElement("div"), hr = document.createElement("hr");
                instance.authorList.sort(function (item1, item2) {
                    return item1.toLocaleLowerCase() > item2.toLocaleLowerCase() ? 1 : -1;
                });
                nullOption.value = "";
                globalStore.fn.injectInto(nullOption, [" - Select an author to filter - "]);
                globalStore.fn.injectInto(selectBox, [nullOption]);

                for (var e in instance.authorList) {
                    if (instance.authorList.hasOwnProperty(e)) {
                        var option = document.createElement("option");
                        globalStore.fn.injectInto(option, [instance.authorList[e]]);
                        if (instance.filters.author && instance.filters.author.value === instance.authorList[e]) {
                            option.selected = true;
                        }
                        globalStore.fn.injectInto(selectBox, [option]);
                    }
                }
                selectBox.addEventListener("change", function (ev) {
                    instance.filters.author = null;
                    var author = this.options[this.options.selectedIndex] ? this.options[this.options.selectedIndex].value : null;
                    if (author) {
                        instance.filters.author = { type: "equal", value: author, prop: "username" };
                    }
                    globalStore.fn.applyFilter(instance);
                });
                selectBox.id = selectBoxLabel.htmlFor = "iso-filter-author";
                globalStore.fn.injectInto(selectBoxLabel, ["Author : "]);
                selectBoxContainer.classList.add("iso-filter-select-container");
                globalStore.fn.injectInto(selectBoxContainer, [selectBoxLabel, selectBox]);

                publicCheckbox.type = "checkbox";
                publicCheckbox.id = labelPublicCheckbox.htmlFor = "iso-filter-cb-public";
                globalStore.fn.injectInto(labelPublicCheckbox, ["Public servers : "]);
                if (instance.filters.isPublicServer) {
                    publicCheckbox.indeterminate = false;
                    publicCheckbox.checked = instance.filters.isPublicServer.value;
                    publicCheckbox.setAttribute("state", publicCheckbox.checked ? "checked" : "unchecked");
                } else {
                    publicCheckbox.indeterminate = true;
                    publicCheckbox.checked = false;
                    publicCheckbox.setAttribute("state", "none");
                }
                publicCheckbox.addEventListener("click", globalStore.fn.triStateCheckboxClick.bind(publicCheckbox, instance, "isPublicServer"));
                publicCheckboxContainer.classList.add("iso-filter-public-container");
                globalStore.fn.injectInto(publicCheckboxContainer, [labelPublicCheckbox, publicCheckbox]);

                playTime.id = playTimeLabel.htmlFor = "iso-filter-playtime";
                noUiSlider.create(playTime, {
                    start: [instance.filters.playTimemin ? instance.filters.playTimemin.value : 0, instance.filters.playTimemax ? instance.filters.playTimemax.value : instance.maxPlayTime + 1],
                    tooltips: [true, true],
                    step: 1,
                    margin: 1,
                    range: {
                        "min": 0,
                        "max": instance.maxPlayTime + 1
                    },
                    format: {
                        to: function (value) {
                            var hours = Math.floor(value / (60 * 60)), minutes = Math.floor((value - hours * 60 * 60) / 60), seconds = Math.floor(value - (hours * 60 * 60 + minutes * 60));
                            return '' + hours + 'h ' + minutes + 'm ' + seconds + 's';
                        },
                        from: function (value) {
                            return value;
                        }
                    }
                });
                playTime.noUiSlider.on("change", globalStore.fn.noUiSliderChange.bind(playTime.noUiSlider, instance, "playTime"));
                globalStore.fn.injectInto(playTimeLabel, ["Play time : "]);
                playTimeContainer.classList.add("iso-filter-playtime-container");
                globalStore.fn.injectInto(playTimeContainer, [playTimeLabel, playTime]);

                if (instance.filters.tags) {
                    searchInput.value = instance.filters.tags.value;
                }
                searchLabel.htmlFor = searchInput.id = "iso-filter-searchbox";
                searchInput.addEventListener("keyup", globalStore.fn.inputSearchChange.bind(searchInput, instance, "tags"));
                globalStore.fn.injectInto(searchLabel, ["Search : "]);
                searchContainer.classList.add("iso-filter-search-container");
                globalStore.fn.injectInto(searchContainer, [searchLabel, searchInput]);

                hr.classList.add("clear");
                hr.classList.add("invisible");
                globalStore.fn.injectInto(instance.buttons, [selectBoxContainer, publicCheckboxContainer, searchContainer, playTimeContainer, hr]);
            },
            buildFilterFunction: function (instance) {
                return function (item) {
                    var itemData = instance.isotopeData[parseInt(item.getAttribute("data-id"))];
                    for (var e in instance.filters) {
                        if (instance.filters.hasOwnProperty(e)) {
                            var filter = instance.filters[e];
                            if (filter.type && filter.value !== undefined) {
                                var propValue = itemData[filter.prop];
                                if (!(propValue !== undefined)) {
                                    return false;
                                }
                                if (!Array.isArray(propValue)) {
                                    propValue = [propValue];
                                }
                                if (propValue.filter(function (propValue) {
                                    switch (filter.type) {
                                        case "equal":
                                            if (propValue !== filter.value) {
                                                return false;
                                            }
                                            break;
                                        case "search":
                                            if (propValue.toLocaleLowerCase().indexOf(filter.value.toLocaleLowerCase()) === -1) {
                                                return false;
                                            }
                                            break;
                                        case ">":
                                            if (propValue <= filter.value) {
                                                return false;
                                            }
                                            break;
                                        case ">=":
                                            if (propValue < filter.value) {
                                                return false;
                                            }
                                            break;
                                        case "<":
                                            if (propValue >= filter.value) {
                                                return false;
                                            }
                                            break;
                                        case "<=":
                                            if (propValue > filter.value) {
                                                return false;
                                            }
                                            break;
                                    }
                                    return true;
                                }).length < 1) {
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                }
            },
            generateUrl: function (instance) {
                var url = "";
                if (instance.filters.author) {
                    url += "&user=" + window.encodeURIComponent(instance.filters.author.value);
                }
                if (instance.filters.tags) {
                    url += "&search=" + window.encodeURIComponent(instance.filters.tags.value);
                }
                if (instance.filters.isPublicServer) {
                    url += "&public=" + window.encodeURIComponent(instance.filters.isPublicServer.value ? "true" : "false");
                }
                if (instance.filters.playTimemin) {
                    url += "&playStart=" + window.encodeURIComponent(instance.filters.playTimemin.value);
                }
                if (instance.filters.playTimemax) {
                    url += "&playEnd=" + window.encodeURIComponent(instance.filters.playTimemax.value);
                }
                return window.location.pathname + url.replace("&", "?");
            },
            getDateSuffix: function (date) {
                var ret = "";
                switch (date.getDate()) {
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
            initHistory: function (instance) {

            },
            initIsotope: function (instance) {
                instance.isotope = new Isotope(instance.itemContainer, {
                    getSortData: {
                        initial: '[data-order]',
                        date: '[data-date]'
                    }
                });
            },
            injectInto: function (parent, child) {
                for (var e in child) {
                    if (child.hasOwnProperty(e)) {
                        if (child[e] instanceof Element) {
                            parent.appendChild(child[e]);
                        } else {
                            parent.appendChild(document.createTextNode(child[e]));
                        }
                    }
                }
            },
            inputSearchChange: function (instance, prop) {
                if (this.value) {
                    instance.filters[prop] = { type: "search", value: this.value, prop: prop };
                } else {
                    delete instance.filters[prop];
                }
                globalStore.fn.applyFilter(instance);
            },
            noUiSliderChange: function (instance, prop, encodedValues, handle, values) {
                instance.filters[prop + "min"] = { type: ">=", value: parseInt(values[0]), prop: prop };
                instance.filters[prop + "max"] = { type: "<=", value: parseInt(values[1]), prop: prop };
                globalStore.fn.applyFilter(instance);
            },
            parseUrl: function (instance, url) {
                var fragments = url.replace("?", "").split("&");
                if (fragments.length > 0) {
                    instance.filters = {};
                    for (var e in fragments) {
                        if (fragments.hasOwnProperty(e)) {
                            var fragmentValue = fragments[e].split("=");
                            if (!(fragmentValue[1] === undefined)) {
                                var value = window.decodeURIComponent(fragmentValue[1])
                                switch (fragmentValue[0]) {
                                    case "user":
                                        instance.filters.author = { type: "equal", value: value, prop: "username" };
                                        break;
                                    case "search":
                                        instance.filters.tags = { type: "search", value: value, prop: "tags" };
                                        break;
                                    case "public":
                                        instance.filters.isPublicServer = { type: "equal", value: value === "true", prop: "isPublicServer" };
                                        break;
                                    case "playStart":
                                        instance.filters.playTimemin = { type: ">=", value: value, prop: "playTime" };
                                        break;
                                    case "playEnd":
                                        instance.filters.playTimemax = { type: "<=", value: value, prop: "playTime" };
                                        break;
                                }
                            }
                        }
                    }
                }
            },
            purgeElement: function (element) {
                while (element.lastChild) {
                    element.removeChild(element.lastChild);
                }
            },
            setHistory: function (instance) {
                if (history) {
                    history.replaceState(instance.filters, "", globalStore.fn.generateUrl(instance));
                }
            },
            triStateCheckboxClick: function (instance, prop, ev) {
                switch (this.getAttribute("state")) {
                    case "none":
                        this.checked = true;
                        this.indeterminate = false;
                        this.setAttribute("state", "checked");
                        instance.filters[prop] = { type: "equal", value: true, prop: prop };
                        break;
                    case "checked":
                        this.checked = false;
                        this.setAttribute("state", "unchecked");
                        instance.filters[prop] = { type: "equal", value: false, prop: prop };
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
    window.Browse = function (jsonPath, containerId, mapPreviewPrefix, urlSearch) {
        var container = document.getElementById(containerId), localStore = {
            isotopeData: {},
            authorList: [],
            maxPlayTime: 0,
            search: null,
            filters: {},
            isotope: null,
            container: container,
            mapPreviewPrefix: mapPreviewPrefix
        }

        if (localStore.container) {
            localStore.container.innerHTML = "Downloading map data...";
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function (event) {
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
})(window, document, window.Isotope, window.noUiSlider, window.history);
