/******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
        /******/
        /******/ 		// Check if module is in cache
        /******/ 		if(installedModules[moduleId]) {
            /******/ 			return installedModules[moduleId].exports;
            /******/ 		}
        /******/ 		// Create a new module (and put it into the cache)
        /******/ 		var module = installedModules[moduleId] = {
            /******/ 			i: moduleId,
            /******/ 			l: false,
            /******/ 			exports: {}
            /******/ 		};
        /******/
        /******/ 		// Execute the module function
        /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ 		// Flag the module as loaded
        /******/ 		module.l = true;
        /******/
        /******/ 		// Return the exports of the module
        /******/ 		return module.exports;
        /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
        /******/ 		if(!__webpack_require__.o(exports, name)) {
            /******/ 			Object.defineProperty(exports, name, {
                /******/ 				configurable: false,
                /******/ 				enumerable: true,
                /******/ 				get: getter
                /******/ 			});
            /******/ 		}
        /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
        /******/ 		var getter = module && module.__esModule ?
            /******/ 			function getDefault() { return module['default']; } :
            /******/ 			function getModuleExports() { return module; };
        /******/ 		__webpack_require__.d(getter, 'a', getter);
        /******/ 		return getter;
        /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 0);
    /******/ })
/************************************************************************/
/******/ ([
    /* 0 */
    /***/ (function(module, exports, __webpack_require__) {

        __webpack_require__(1);
        module.exports = __webpack_require__(2);


        /***/ }),
    /* 1 */
    /***/ (function(module, exports) {

        window.visualiser = {

            element: undefined,
            $bg: undefined,
            $product: undefined,

            settings: {
                bgimg: undefined,
                product: {
                    img: undefined,
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0
                }
            },

            init: function init(options) {
                var v = this;
                v.element = options.element;

                v.setBackground(options.background);
                v.addProduct(options.product);

                v.$bg = $(v.element).find(".vs_visualiser-bg");
                v.$product = $(v.element).find(".vs_visualiser-product");

                v.$bg.on("load", function () {
                    v.$product.find("img").css("max-height", v.$bg.height());
                    v.$product.find("img").css("max-width", v.$bg.width());
                    v.updateSettings();
                    v.dragAndResize();
                });
            },

            updateSettings: function updateSettings() {
                var v = this;

                var bg_width = v.$bg.width();
                var bg_height = v.$bg.height();

                var bg_img = new Image();
                bg_img.src = v.$bg.attr("src");
                var bg_natural_width = bg_img.naturalWidth;
                var bg_natural_height = bg_img.naturalHeight;

                var product_width = v.$product.width();
                var product_height = v.$product.height();

                var product_render_width = product_width / bg_width * bg_natural_width;
                var product_render_height = product_height / bg_height * bg_natural_height;

                var percentage_top = parseInt(v.$product.css("top")) / bg_height * bg_natural_height;
                var percentage_left = parseInt(v.$product.css("left")) / bg_width * bg_natural_width;

                v.settings.bgimg = v.$bg.attr("src");
                var p = v.settings.product;
                p.img = v.$product.find("img").attr("src");
                p.width = product_render_width;
                p.height = product_render_height;
                p.top = Math.round(percentage_top);
                p.left = Math.round(percentage_left);
            },

            setBackground: function setBackground(url) {
                var v = this;
                var bg_html = "<img class='vs_visualiser-bg' src='" + url + "'>";
                $(v.element).append(bg_html);
            },

            addProduct: function addProduct(url) {
                var v = this;
                var product_html = "<div class='vs_visualiser-product'>" + "<img src='" + url + "'>" + "</div>";
                $(v.element).append(product_html);
            },

            dragAndResize: function dragAndResize() {
                var v = this;
                v.$product.draggable({
                    containment: "parent",
                    stop: function stop() {
                        v.updateSettings();
                    }
                }).find("img").resizable({
                    containment: v.element,
                    handles: "se",
                    stop: function stop() {
                        v.updateSettings();
                    }
                });
            }
        };

        /***/ }),
    /* 2 */
    /***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

        /***/ })
    /******/ ]);