"use strict";
(function (window, document) {
    window.BurgerKing = window.BurgerKing || function (element) {
        var menu = document.createElement("span"), state = false;
        menu.classList.add("menu-new");
        menu.appendChild(document.createTextNode("Menu"));
        element.insertBefore(menu, element.firstChild);
        menu.addEventListener("click", function () {
            if (!state) {
                element.classList.remove("closed");
                element.classList.add("opened");
            } else {
                element.classList.remove("opened");
                element.classList.add("closed");
            }
            state = !state;
        });

        var addFries = function () {
            if (window.matchMedia("(max-width: 700px)").matches) {
                element.classList.add("burger");
                element.classList.add(state?"opened":"closed");
            } else {
                element.classList.remove("burger");
                element.classList.remove("opened");
                element.classList.remove("closed");
            }
        };

        window.addEventListener("resize", function () {
            addFries();
        });
        addFries();
    };
})(window, document);
