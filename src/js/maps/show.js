"use strict";
(function(window){
    window.Oak = function (metadata, edit) {
    var globalStore = {
        fn: {
        /* Create the info box */
        buildInfoBox: function(container, meta) {
            var infoBox = document.createElement("div");
            infoBox.classList.add("infoBox");
            globalStore.fn.buildInfoBoxLine(infoBox, "Submitter: ", meta.source.user.username, false);
            globalStore.fn.buildInfoBoxLine(infoBox, "Map: ", meta.map.title, false);
            globalStore.fn.buildInfoBoxLine(infoBox, "Submitted: ", new Date(meta.source.submission.date).toString(), false);
            globalStore.fn.buildInfoBoxLine(infoBox, "Play time: ", meta.map.details.playTime.ticks ? (meta.map.details.playTime.hours + "h " + meta.map.details.playTime.minutes + "m " + meta.map.details.playTime.seconds + "s" ) : null, true);
            globalStore.fn.buildInfoBoxLine(infoBox, "Seed: ", meta.map.details.gen.seed, true);
            globalStore.fn.buildInfoBoxLine(infoBox, "Map exch.: ", globalStore.fn.buildInfoMapExchangeString(meta.map.details.gen.exchangeString), true);
            globalStore.fn.buildInfoBoxLine(infoBox, "Mods: ", globalStore.fn.buildInfoModList(meta.map.details.mods), true);
            globalStore.fn.buildInfoBoxLine(infoBox, "Contributors: ", globalStore.fn.buildInfoContribList(meta.map.contributors), true);
            infoBox.addEventListener("click", function(){
            if(infoBox.classList.contains("opened")) {
                infoBox.classList.remove("opened");
            } else {
                infoBox.classList.add("opened");
            }
            });
            globalStore.fn.injectInto(infoBox, [
            globalStore.fn.injectInto(document.createElement("div"), [
                globalStore.fn.injectInto(document.createElement("span"), [
                "Click for more info"
                ]),
                globalStore.fn.injectInto(document.createElement("label"), [
                "Click for less info"
                ])
            ])
            ]);
            container.appendChild(infoBox);
        },
        /* Create an info box prop line */
        buildInfoBoxLine: function(container, label, value, extendedProp) {
            if(null===value) {
            return null;
            }
            var line = document.createElement("div");
            if(extendedProp) {
            line.classList.add("extended");
            }
            return globalStore.fn.injectInto(container, [
            globalStore.fn.injectInto(line, [
                globalStore.fn.injectInto(document.createElement("label"), [label]),
                globalStore.fn.injectInto(document.createElement("span"), [value])
            ])
            ]);
        },
        /* Create the info contributor list */
        buildInfoContribList: function(contribs) {
            if(contribs.length===0) {
            return null;
            }
            var ul = document.createElement("ul");
            for(var e in contribs) {
            if(contribs.hasOwnProperty(e)) {
                globalStore.fn.injectInto(ul, [
                globalStore.fn.injectInto(document.createElement("li"), [contribs[e].username])
                ]);
            }
            }
            return ul;
        },
        /* Create the info map exchange hidden toggle */
        buildInfoMapExchangeString: function(mapEx) {
            if(!mapEx) {
            return null;
            }
            var input = document.createElement("textarea");
            input.value = mapEx;
            input.addEventListener("click", function(ev){
            ev.preventDefault();
            ev.stopPropagation();
            return false;
            });
            var a = document.createElement("a");
            a.classList.add("mapex-display");
            a.addEventListener("click", function(ev){
            a.parentElement.parentElement.classList.add("mapex");
            ev.preventDefault();
            ev.stopPropagation();
            return false;
            });
            return globalStore.fn.injectInto(document.createElement("div"), [
            globalStore.fn.injectInto(a, ["Display"]),
            globalStore.fn.injectInto(document.createElement("span"), ["Map exchange string, copy before creating a game", document.createElement("br"), " to have the same map settings as this map:", document.createElement("br"), input])
            ]);
        },
        /* Create the info mods list */
        buildInfoModList: function(mods) {
            if(!mods||mods.length===0) {
            return null;
            }
            var ul = document.createElement("ul");
            for(var e in mods) {
            if(mods.hasOwnProperty(e)) {
                globalStore.fn.injectInto(ul, [
                globalStore.fn.injectInto(document.createElement("li"), [
                    globalStore.fn.injectInto(document.createElement("label"), [mods[e].name]),
                    globalStore.fn.injectInto(document.createElement("span"), [mods[e].version])
                ])
                ]);
            }
            }
            return ul;
        },
        /* Create the map object */
        buildMap: function(instance) {
            var map = L.map('map', {
            layers: instance.firstLayer,
            fadeAnimation: true,
            zoomAnimation: true
            }).setView([0, 0], instance.startZoom);
            if(instance.countLayers===2&&false) {
            globalStore.fn.prepareLayerSlider();
            } else {
            if (instance.countLayers > 1) {
                L.control.layers(instance.layers, {}, { collapsed: instance.meta.meta.map.options.collapseLayerList }).addTo(map).setPosition('bottomright');
            }
            }
            new L.Hash(map, instance.layers);
            map.addControl(new L.Control.Fullscreen().setPosition('bottomright'));
            map.zoomControl.setPosition('bottomleft');
            for(var e in instance.markers) {
            instance.markers.hasOwnProperty(e) && instance.markers[e].addTo(map);
            }
        },
        /* Create the Marker object */
        buildMarker: function(marker) {
            return L.marker(marker.coords, { title: marker.title }).bindPopup(globalStore.fn.buildMarkerPopup(marker));
        },
        /* Create the marker popup */
        buildMarkerPopup: function(marker) {
            var content = document.createElement("div");
            content.innerHTML = marker.text;
            return globalStore.fn.injectInto(document.createElement("div"), [globalStore.fn.injectInto(document.createElement("h3"), [marker.title]), content]);
        },
        /* Create the Marker list */
        buildMarkers: function(instance, markers) {
            if(markers&&Array.isArray(markers)) {
            for(var i=0; i<markers.length; ++i) {
                instance.markers.push(globalStore.fn.buildMarker(markers[i]));
            }
            }
        },
        /* Create the save button */
        buildSaveButton: function(container, saves, available) {
            if (available > 0) {
            var btn = document.createElement("a"), modal = document.getElementById("modal"), ulContainer = document.getElementById("save-download-container"), modalClose = modal.getElementsByClassName("close")[0], opened = false, built = false;
            btn.id = 'downBtn';
            btn.appendChild(document.createTextNode("Download Save"))
            if (saves.length === 1) {
                //Act like a download link
                btn.href = saves[0].url;
                btn.target = '_blank';
            } else {
                btn.addEventListener('click', function () {
                if (!opened) {
                    if (!built) {
                    //Empty the modal, re-create modal content and display it
                    while (ulContainer.lastChild) {
                        ulContainer.removeChild(ulContainer.lastChild);
                    }
                    for (var i in saves) {
                        if (saves.hasOwnProperty(i)) {
                        var saveObj = saves[i];
                        var li = document.createElement("li"), a = document.createElement("a"), span = document.createElement("span"), hr = document.createElement("hr");
                        hr.classList.add("clear");
                        a.classList.add("mapLayerLink");
                        li.classList.add("mapLayer");
                        globalStore.fn.injectInto(a, ["Download"])

                        a.target = "_blank";
                        if (!saveObj.url) {
                            a.setAttribute("disabled", "disabled");
                            a.classList.add("disabled");
                        } else {
                            a.href = saveObj.url;
                        }
                        span.classList.add("mapLayerName")
                        globalStore.fn.injectInto(ulContainer, [globalStore.fn.injectInto(li, [globalStore.fn.injectInto(span, [saveObj.layer]), a, hr])]);
                        }
                    }
                    modal.classList.add("open");
                    opened = true;
                    }
                }
                });
                modalClose.addEventListener("click", function () {
                if (opened) {
                    modal.classList.remove("open");
                    opened = false;
                }
                });
            }
            container.appendChild(btn);
            }
        },
        /* Fetches layers from the metadata */
        findLayers: function(instance, layers) {
            var layer;
            for(var i = 0; i<layers.length; ++i ) {
            layer = layers[i];
            var layerZoom = instance.startZoom = Math.max(layer.zoom.min - 2, 1);
            if(layer.tiles.size === 512) {
                ++instance.startZoom;
            }
            var tileUrl = layer.tiles.url;
            if (location.host !== "") {
                tileUrl = "https://factoriomaps.com/" + m.meta.map.path + "/" + tileUrl;
            }
            ++instance.countLayers;
            instance.layers[layer.name] = L.tileLayer(tileUrl, {
                id: layer.name,
                attribution: '<a href="https://mods.factorio.com/mods/credomane/FactorioMaps">FactorioMaps</a>',
                minNativeZoom: layer.zoom.min,
                maxNativeZoom: layer.zoom.max,
                minZoom: layerZoom,
                maxZoom: layer.zoom.max,
                noWrap: true,
                tileSize: layer.tiles.size,
                keepBuffer: 3
            });
            if(!instance.firstLayer) {
                instance.firstLayer = instance.layers[layer.name];
            }
            if (layer.save.download !== null && layer.save.download !== "") {
                instance.saves.push({
                layer: layer.save.name || layer.name,
                url: layer.save.url
                });
                if (layer.save.url) {
                instance.availableSaves++;
                }
            }
            }
        },
        /* Get an array first element */
        getFirstElement: function(array) {
            return array && Array.isArray(array) && array.length ? array.slice(0,1)[0] : null;
        },
        /* Object initialisation */
        init: function(instance, edit) {
            globalStore.fn.findLayers(instance, instance.meta.meta.map.layers);
            if(!instance.availableSaves && instance.meta.links.save) {
            instance.saves.push({
                title: "Map download",
                url: instance.meta.links.save
            });
            ++instance.availableSaves;
            }
            globalStore.fn.buildSaveButton(document.getElementById("buttonAnchor"), instance.saves, instance.availableSaves);
            if(!edit) {
            globalStore.fn.buildMarkers(instance, instance.meta.meta.map.markers);
            } else {
            if(window.Cedar) {
                instance.cedar = window.Cedar.EditMap(map);
                if(m.meta.map.markers) {
                instance.cedar.ImportData(m.meta.map.markers);
                }
                document.getElementById("Cedar").addEventListener("click", function () {
                var name = document.location.href.split("#")[0].replace(/[^A-Z0-9a-z]/g, "-") + ".json";
                window.saveAs(new Blob(["//#-# Source URL: " + document.location.href + "\n", JSON.stringify(instance.cedar.ExportData()).replace('\\', '\\\\')], {
                    type: "application/octet-stream;charset=utf8",
                    endings: "native"
                }), name, false);
                });
            } else {
                window.console.error("Map edit : Cedar module is not loaded.");
            }
            }
            globalStore.fn.buildMap(instance);
            globalStore.fn.buildInfoBox(document.getElementById("buttonAnchor"), instance.meta.meta);
        },
        /* HTML injection helper */
        injectInto: function(parent, child) {
            for(var e in child){
            if(child.hasOwnProperty(e)) {
                if(child[e] instanceof Element) {
                parent.appendChild(child[e]);
                } else {
                parent.appendChild(document.createTextNode(child[e]));
                }
            }
            }
            return parent;
        }
        }
    };
    globalStore.fn.init({
        /* Maps layers */
        layers: {},
        /* Layers count */
        countLayers: 0,
        /* Link to the first layer loaded */
        firstLayer: null,
        /* Markers list */
        markers: [],
        /* Link to the map object */
        map: null,
        /* Link to the map edit object if loaded */
        cedar: null,
        /* Zoom level */
        startZoom: 1,
        /* Saves links */
        saves: [],
        /* Saves links count */
        availableSaves: 0,
        /* Map full metadata */
        meta: metadata
    }, ((undefined === edit) ? false : edit));
    };
})(window);
