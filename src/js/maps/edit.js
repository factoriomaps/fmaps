"use strict";
window.Cedar = (function (document, window, leaflet) {
    var Cedar = window.Cedar;
    if (!Cedar) {
        Cedar = {
            EditMap: function (map) {
                var localStore = {
                    editingElement: "textarea",
                    counter: 0,
                    markerObjects: [],
                    pellOptions: {
                        defaultParagraphSeparator: "p",
                        actions: [
                            "bold",
                            "italic",
                            "underline",
                            "olist",
                            "ulist",
                            "line",
                            "link",
                            {
                                icon: "&#x238C;",
                                title: "Undo",
                                result: function () {
                                    localStore.wysiwygEditor.exec('undo');
                                }
                            },
                            {
                                icon: "&#x200f;&#x238C;",
                                title: "Redo",
                                result: function () {
                                    localStore.wysiwygEditor.exec('redo');
                                }
                            }
                        ]
                    },
                    fn: {
                        purgeCurrentMarkers: function () {
                            for (var e in localStore.markerObjects) {
                                if (localStore.markerObjects.hasOwnProperty(e) && localStore.markerObjects[e].hasOwnProperty("Cedar")) {
                                    localStore.fn.removeMarker(localStore.markerObjects[e]);
                                }
                            }
                        },
                        removeMarker: function (marker, ev) {
                            marker.closePopup().removeFrom(map);
                            for (var e in localStore.markerObjects) {
                                if (localStore.markerObjects.hasOwnProperty(e) && localStore.markerObjects[e].hasOwnProperty("Cedar")) {
                                    if (localStore.markerObjects[e].Cedar.id === marker.Cedar.id) {
                                        delete localStore.markerObjects[e];
                                    }
                                }
                            }
                            if (ev) {
                                ev.stopPropagation();
                                ev.preventDefault();
                            }
                        },
                        exportData: function () {
                            var ret = [], data;
                            for (var e in localStore.markerObjects) {
                                data = null;
                                if (localStore.markerObjects.hasOwnProperty(e) && localStore.markerObjects[e].hasOwnProperty("Cedar")) {
                                    try {
                                        data = localStore.fn.fetchMarkerData(localStore.markerObjects[e])
                                    } catch (e) {
                                        window.console.log("Error fetching marker data", e, localStore.markerObjects[e]);
                                    }
                                    if (data) {
                                        ret.push(data);
                                    }
                                }
                            }
                            return ret;
                        },
                        fetchMarkerData: function (marker) {
                            if (!marker.Cedar.text) {
                                var popupContent = marker.getPopup().getContent().parentElement.parentElement.classList.add("error");
                                marker.openPopup();
                                return;
                            }
                            return {
                                text: marker.Cedar.text,
                                title: marker.Cedar.title,
                                coords: marker.Cedar.coords
                            }
                        },
                        setTitle: function (marker, ev) {
                            marker.Cedar.title = ev.target.value;
                        },
                        setBodyCommon: function (marker, textContent) {
                            marker.getPopup().getContent().parentElement.parentElement.classList.remove("error");
                            marker.Cedar.text = textContent;
                        },
                        setBody: function (marker, ev) {
                            localStore.fn.setBodyCommon(marker, ev.target.value);
                        },
                        setBodyPell: function (marker, html) {
                            localStore.fn.setBodyCommon(marker, html);
                        },
                        postPopup: function (textarea, popup, marker) {
                            bodyTextarea.addEventListener("keyup", localStore.fn.setBody.bind(null, marker));
                        },
                        postPopupPell: function (textarea, popup, marker) {
                            var options = Object.assign({}, localStore.pellOptions, {
                                element: textarea,
                                onChange: localStore.fn.setBodyPell.bind(null, marker)
                            });
                            localStore.wysiwygEditor.init(options);
                        },
                        makePopup: function (marker, initData) {
                            initData.id = (++localStore.counter);
                            marker.Cedar = initData;
                            var popup = document.createElement("div"), form = document.createElement("div"), title = document.createElement("div"), body = document.createElement("div"), button = document.createElement("div"), titleInput = document.createElement("input"), bodyTextarea = document.createElement(localStore.editingElement), buttonOk = document.createElement("button"), buttonCancel = document.createElement("button");
                            popup.classList.add("cedar-popup-container");
                            title.classList.add("cedar-popup-title");
                            body.classList.add("cedar-popup-body");
                            button.classList.add("cedar-btn-container")
                            buttonOk.classList.add("cedar-btn-ok");
                            buttonCancel.classList.add("cedar-btn-cancel");

                            titleInput.addEventListener("keyup", localStore.fn.setTitle.bind(null, marker));
                            titleInput.placeholder = "Marker title";
                            titleInput.value = initData.title;
                            title.appendChild(titleInput);

                            form.appendChild(title);

                            bodyTextarea.placeholder = "Edit this text";
                            bodyTextarea.value = initData.text;
                            body.appendChild(bodyTextarea);

                            form.appendChild(body);

                            buttonCancel.addEventListener("click", localStore.fn.removeMarker.bind(null, marker));
                            buttonCancel.textContent = "Remove";
                            button.appendChild(buttonCancel);

                            form.appendChild(button);

                            popup.appendChild(form);
                            localStore.fn.postPopup(bodyTextarea, popup, marker);
                            return popup;

                        },
                        importMarkers: function (data) {
                            localStore.fn.purgeCurrentMarkers();
                            for (i in data) {
                                if (data.hasOwnProperty(i)) {
                                    localStore.fn.loadMarker(data[i]);
                                }
                            }
                        },
                        loadMarker: function (data) {
                            data.id = (++localStore.counter);
                            var marker = L.marker(data.coords);
                            marker.addTo(map);
                            marker.bindPopup(localStore.fn.makePopup(marker, data));
                            marker.Cedar = data;
                            localStore.markerObjects.push(marker);
                        },
                        newMarker: function (coords) {
                            var marker = L.marker([coords.lat, coords.lng]);
                            marker.addTo(map);
                            marker.bindPopup(localStore.fn.makePopup(marker, { text: "", title: "", coords: [coords.lat, coords.lng] }));
                            marker.openPopup();
                            localStore.markerObjects.push(marker);
                        }
                    }
                };
                map.on("click", function (ev) {
                    localStore.fn.newMarker(ev.latlng);
                    L.DomEvent.stopPropagation(ev);
                });
                if (window.pell) {
                    localStore.wysiwygEditor = window.pell;
                    localStore.editingElement = "div";
                    localStore.fn.postPopup = localStore.fn.postPopupPell;
                }
                map.loadedEditor = true;
                window.console.log("Done loading");
                return {
                    ExportData: function () {
                        return localStore.fn.exportData();
                    },
                    ImportData: function (data) {
                        localStore.fn.importMarkers(data);
                    }
                };
            }
        };
    } else {
        window.console.log("Getting new instance");
    }

    return Cedar;
})(document, window, window.L);
