/*
    Plugin Name: Cookie Bar
    Plugin URL: http://cookiebar.com/
    @author: Emanuele "ToX" Toscano
    @description: Cookie Bar is a free & simple solution to the EU cookie law.
    @version: 2.0
*/

/*
 * Available languages array
 */
var CookieLanguages = [
    'en',
    'it',
    'fr'
];

/**
 * Main function
 */
function setupCookieBar() {

    /**
     * Load plugin only if needed (do nothing if cookiebar cookie is set)
     * @param null
     * @return null
     */
    if (document.cookie.length > 0 || window.localStorage.length > 0) {
        var accepted = getCookie("cookiebar");
        if (accepted === undefined) {
            scriptPath = getScriptPath();

            startup();
        }
    }

    /**
     * Get this javascript's path
     * @param null
     * @return {String} this javascript's path
     */
    function getScriptPath() {
        var scripts = document.getElementsByTagName("script");

        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].hasAttribute("src")) {
                var path = scripts[i].src;
                if (path.indexOf("cookiebar") >-1) {
                    return path;
                }
            }
        }
    }

    /**
     * Load external files (css, language files etc.)
     * @param null
     * @return null
     */
    function startup() {
        var userLang = detectLang();

        // Load CSS file
        path = scriptPath.replace(/[^\/]*$/, "");
        var stylesheet = document.createElement("link");
        stylesheet.setAttribute("rel", "stylesheet");
        stylesheet.setAttribute("href", path + "cookiebar.css");
        document.head.appendChild(stylesheet);

        // Load the correct language messages file and set some variables
        var request = new XMLHttpRequest();
        request.open('GET', path + "/lang/" + userLang + ".html", true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var element = document.createElement('div');
                element.innerHTML = request.responseText;
                document.getElementsByTagName('body')[0].appendChild(element);

                cookieBar = document.getElementById('cookie-bar');
                button = document.getElementById('cookie-bar-button');
                buttonNo = document.getElementById('cookie-bar-button-no');
                prompt = document.getElementById('cookie-bar-prompt');

                promptBtn = document.getElementById('cookie-bar-prompt-button');
                promptClose = document.getElementById('cookie-bar-prompt-close');
                promptContent = document.getElementById('cookie-bar-prompt-content');   
                promptNoConsent = document.getElementById('cookie-bar-no-consent');
                cookiesListDiv = document.getElementById('cookies-list');

                if (!getURLParameter("showNoConsent")) {
                    promptNoConsent.style.display = "none";
                    buttonNo.style.display = "none";
                }

                if (getURLParameter("blocking")) {
                    fadeIn(prompt, 500);
                    promptClose.style.display = "none";
                }

                if (getURLParameter("top")) {
                    cookieBar.style.top = 0;
                    setBodyMargin("top");
                } else {
                    cookieBar.style.bottom = 0;
                    setBodyMargin("bottom");
                }

                prepareActions();
                fadeIn(cookieBar, 250);
                setBodyMargin();
                listCookies(cookiesListDiv);
            }
        };
        request.send();
    }


    /**
     * Get browser's language or, if available, the specified one
     * @param null
     * @return {String} userLang - short language name
     */
    function detectLang() {
        var userLang = getURLParameter("forceLang");
        if (userLang === false) {
            userLang = navigator.language || navigator.userLanguage;
        }
        userLang = userLang.substr(0,2);
        if (CookieLanguages.indexOf(userLang) < 0) {
            userLang = "en";
        }
        return userLang;
    }

    /**
     * Get Cookie Bar's cookie if available
     * @param {string} c_name - cookie name
     * @return {string} cookie value
     */
    function getCookie(c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                return unescape(y);
            }
        }
    }

    /**
     * Get a list of all cookies
     * @param NULL
     * @return {array} cookies list
     */
    function listCookies(cookiesListDiv) {
        var cookies = [];
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            cookies.push(x);
        }
        cookiesListDiv.innerHTML = cookies.join(", ");
    }

    /**
     * Get Cookie Bar's cookie if available
     * @param {string} c_name - cookie name
     * @param {string} value - cookie value
     * @param {string} exdays - expiration days
     * @return null
     */
    function setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    /**
     * Remove all the cookies and empty localStorage
     * @param null
     * @return null
     */
    function removeCookie() {
        // Clear cookies
        document.cookie.split(";")
            .forEach(function (c) {
                document.cookie = c.replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date()
                        .toUTCString() + ";path=/");
            });
        // Clear localStorage
        localStorage.clear();
    }


    /**
     * FadeIn effect
     * @param {string} el - element name
     * @param {string} speed - effect duration
     * @return null
     */
    function fadeIn(el, speed) {
        var s = el.style;
        s.opacity = 0;
        s.display = "block";
        (function fade() {
            (s.opacity -= -0.1) > 0.9 ? null : setTimeout(fade, (speed/10));
        })();
    }


    /**
     * FadeOut effect
     * @param {string} el - element name
     * @param {string} speed - effect duration
     * @return null
     */
    function fadeOut(el, speed) {
        var s = el.style;
        s.opacity = 1;
        (function fade() {
            (s.opacity -= 0.1) < 0.1 ? s.display = "none" : setTimeout(fade, (speed/10));
        })();
    }

    /**
     * Add a body tailored bottom margin so that CookieBar doesn't hide anything
     * @param null
     * @return null
     */
    function setBodyMargin(where) {    
        setTimeout(function () {
            var height;
            switch (where) {
                case "top": 
                    height = document.getElementById("cookie-bar").clientHeight;
                    document.getElementsByTagName('body')[0].style.marginTop = height + "px";
                    break;
                case "bottom":
                    height = document.getElementById("cookie-bar").clientHeight;
                    document.getElementsByTagName('body')[0].style.marginBottom = height + "px";
                    break;
            }
        }, 260);
    }

    /**
     * GET parameter to look for
     * @param {string} name - param name
     * @return {string} param value (false if parameter is not found)
     */
    function getURLParameter(name) {
        var set = unescape(scriptPath).split(name + "=");
        if (set[1]) {
            return set[1].split(/[&?]+/)[0];
        } else {
            return false;
        }
    }

    /**
     * Button actions
     * @param null
     * @return null
     */
    function prepareActions() {
        button.addEventListener('click', function () {
            setCookie("cookiebar", "CookieAllowed", 30);
            fadeOut(prompt, 250);
            fadeOut(cookieBar, 250);
        });

        buttonNo.addEventListener('click', function () {
            var txt = promptNoConsent.innerText;
            var confirm = window.confirm(txt);
            if (confirm === true) {
                removeCookie();
                fadeOut(prompt, 250);
                fadeOut(cookieBar, 250);
            }
        });

        promptBtn.addEventListener('click', function () {
            fadeIn(prompt, 250);
        });

        promptClose.addEventListener('click', function () {
            fadeOut(prompt, 250);
        });
    }
}


// Load the script only if there is at least a cookie or a localStorage item
document.addEventListener("DOMContentLoaded", function () {
    setupCookieBar();
});