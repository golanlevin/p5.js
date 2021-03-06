/*! p5.js v0.4.5 May 29, 2015 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5', [], function () { return (root.returnExportsGlobal = factory());});
  else if (typeof exports === 'object')
    module.exports = factory();
  else
    root['p5'] = factory();
}(this, function () {
var amdclean = {};
amdclean['shim'] = function (require) {
  window.requestDraw = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();
  (function () {
    'use strict';
    if (typeof Uint8ClampedArray !== 'undefined') {
      Uint8ClampedArray.prototype.slice = Array.prototype.slice;
    }
  }());
}({});
amdclean['constants'] = function (require) {
  var PI = Math.PI;
  return {
    P2D: 'p2d',
    WEBGL: 'webgl',
    ARROW: 'default',
    CROSS: 'crosshair',
    HAND: 'pointer',
    MOVE: 'move',
    TEXT: 'text',
    WAIT: 'wait',
    HALF_PI: PI / 2,
    PI: PI,
    QUARTER_PI: PI / 4,
    TAU: PI * 2,
    TWO_PI: PI * 2,
    DEGREES: 'degrees',
    RADIANS: 'radians',
    CORNER: 'corner',
    CORNERS: 'corners',
    RADIUS: 'radius',
    RIGHT: 'right',
    LEFT: 'left',
    CENTER: 'center',
    TOP: 'top',
    BOTTOM: 'bottom',
    BASELINE: 'alphabetic',
    POINTS: 'points',
    LINES: 'lines',
    TRIANGLES: 'triangles',
    TRIANGLE_FAN: 'triangles_fan',
    TRIANGLE_STRIP: 'triangles_strip',
    QUADS: 'quads',
    QUAD_STRIP: 'quad_strip',
    CLOSE: 'close',
    OPEN: 'open',
    CHORD: 'chord',
    PIE: 'pie',
    PROJECT: 'square',
    SQUARE: 'butt',
    ROUND: 'round',
    BEVEL: 'bevel',
    MITER: 'miter',
    RGB: 'rgb',
    HSB: 'hsb',
    AUTO: 'auto',
    ALT: 18,
    BACKSPACE: 8,
    CONTROL: 17,
    DELETE: 46,
    DOWN_ARROW: 40,
    ENTER: 13,
    ESCAPE: 27,
    LEFT_ARROW: 37,
    OPTION: 18,
    RETURN: 13,
    RIGHT_ARROW: 39,
    SHIFT: 16,
    TAB: 9,
    UP_ARROW: 38,
    BLEND: 'normal',
    ADD: 'lighter',
    DARKEST: 'darken',
    LIGHTEST: 'lighten',
    DIFFERENCE: 'difference',
    EXCLUSION: 'exclusion',
    MULTIPLY: 'multiply',
    SCREEN: 'screen',
    REPLACE: 'source-over',
    OVERLAY: 'overlay',
    HARD_LIGHT: 'hard-light',
    SOFT_LIGHT: 'soft-light',
    DODGE: 'color-dodge',
    BURN: 'color-burn',
    THRESHOLD: 'threshold',
    GRAY: 'gray',
    OPAQUE: 'opaque',
    INVERT: 'invert',
    POSTERIZE: 'posterize',
    DILATE: 'dilate',
    ERODE: 'erode',
    BLUR: 'blur',
    NORMAL: 'normal',
    ITALIC: 'italic',
    BOLD: 'bold',
    LINEAR: 'linear',
    QUADRATIC: 'quadratic',
    BEZIER: 'bezier',
    CURVE: 'curve'
  };
}({});
amdclean['core'] = function (require, shim, constants) {
  'use strict';
  var constants = constants;
  var p5 = function (sketch, node, sync) {
    if (arguments.length === 2 && typeof node === 'boolean') {
      sync = node;
      node = undefined;
    }
    this._setupDone = false;
    this.pixelDensity = window.devicePixelRatio || 1;
    this._startTime = new Date().getTime();
    this._userNode = node;
    this._curElement = null;
    this._elements = [];
    this._preloadCount = 0;
    this._updateInterval = 0;
    this._isGlobal = false;
    this._loop = true;
    this._styles = [];
    this._defaultCanvasSize = {
      width: 100,
      height: 100
    };
    this._events = {
      'mousemove': null,
      'mousedown': null,
      'mouseup': null,
      'click': null,
      'mouseover': null,
      'mouseout': null,
      'keydown': null,
      'keyup': null,
      'keypress': null,
      'touchstart': null,
      'touchmove': null,
      'touchend': null,
      'resize': null,
      'blur': null
    };
    if (window.DeviceOrientationEvent) {
      this._events.deviceorientation = null;
    } else if (window.DeviceMotionEvent) {
      this._events.devicemotion = null;
    } else {
      this._events.MozOrientation = null;
    }
    if (/Firefox/i.test(navigator.userAgent)) {
      this._events.DOMMouseScroll = null;
    } else {
      this._events.mousewheel = null;
    }
    this._loadingScreenId = 'p5_loading';
    this._start = function () {
      if (this._userNode) {
        if (typeof this._userNode === 'string') {
          this._userNode = document.getElementById(this._userNode);
        }
      }
      this._loadingScreen = document.getElementById(this._loadingScreenId);
      if (!this._loadingScreen) {
        this._loadingScreen = document.createElement('loadingDiv');
        this._loadingScreen.innerHTML = 'loading...';
        this._loadingScreen.style.position = 'absolute';
        var node = this._userNode || document.body;
        node.appendChild(this._loadingScreen);
      }
      this.createCanvas(this._defaultCanvasSize.width, this._defaultCanvasSize.height, 'p2d', true);
      var userPreload = this.preload || window.preload;
      var context = this._isGlobal ? window : this;
      if (userPreload) {
        this._preloadMethods.forEach(function (f) {
          context[f] = function () {
            var argsArray = Array.prototype.slice.call(arguments);
            return context._preload(f, argsArray);
          };
        });
        userPreload();
        if (this._preloadCount === 0) {
          this._setup();
          this._runFrames();
          this._draw();
        }
      } else {
        this._setup();
        this._runFrames();
        this._draw();
      }
    }.bind(this);
    this._preload = function (func, args) {
      var context = this._isGlobal ? window : this;
      context._setProperty('_preloadCount', context._preloadCount + 1);
      var preloadCallback = function (resp) {
        context._setProperty('_preloadCount', context._preloadCount - 1);
        if (context._preloadCount === 0) {
          context._setup();
          context._runFrames();
          context._draw();
        }
      };
      args.push(preloadCallback);
      return p5.prototype[func].apply(context, args);
    }.bind(this);
    this._setup = function () {
      var context = this._isGlobal ? window : this;
      if (typeof context.preload === 'function') {
        this._preloadMethods.forEach(function (f) {
          context[f] = p5.prototype[f];
        });
      }
      if (typeof context.setup === 'function') {
        context.setup();
      }
      var reg = new RegExp(/(^|\s)p5_hidden(?!\S)/g);
      var canvases = document.getElementsByClassName('p5_hidden');
      for (var i = 0; i < canvases.length; i++) {
        var k = canvases[i];
        k.style.visibility = '';
        k.className = k.className.replace(reg, '');
      }
      this._setupDone = true;
      this._loadingScreen.parentNode.removeChild(this._loadingScreen);
    }.bind(this);
    this._draw = function () {
      var now = new Date().getTime();
      this._frameRate = 1000 / (now - this._lastFrameTime);
      this._lastFrameTime = now;
      this._setProperty('frameCount', this.frameCount + 1);
      if (this._loop) {
        if (this._drawInterval) {
          clearInterval(this._drawInterval);
        }
        this._drawInterval = setTimeout(function () {
          window.requestDraw(this._draw.bind(this));
        }.bind(this), 1000 / this._targetFrameRate);
      }
      this.redraw();
      this._updatePAccelerations();
      this._updatePMouseCoords();
      this._updatePTouchCoords();
    }.bind(this);
    this._runFrames = function () {
      if (this._updateInterval) {
        clearInterval(this._updateInterval);
      }
    }.bind(this);
    this._setProperty = function (prop, value) {
      this[prop] = value;
      if (this._isGlobal) {
        window[prop] = value;
      }
    }.bind(this);
    this.remove = function () {
      if (this._curElement) {
        this._loop = false;
        if (this._drawInterval) {
          clearTimeout(this._drawInterval);
        }
        if (this._updateInterval) {
          clearTimeout(this._updateInterval);
        }
        for (var ev in this._events) {
          window.removeEventListener(ev, this._events[ev]);
        }
        for (var i = 0; i < this._elements.length; i++) {
          var e = this._elements[i];
          if (e.elt.parentNode) {
            e.elt.parentNode.removeChild(e.elt);
          }
          for (var elt_ev in e._events) {
            e.elt.removeEventListener(elt_ev, e._events[elt_ev]);
          }
        }
        var self = this;
        this._registeredMethods.remove.forEach(function (f) {
          if (typeof f !== 'undefined') {
            f.call(self);
          }
        });
        if (this._isGlobal) {
          for (var p in p5.prototype) {
            try {
              delete window[p];
            } catch (x) {
              window[p] = undefined;
            }
          }
          for (var p2 in this) {
            if (this.hasOwnProperty(p2)) {
              try {
                delete window[p2];
              } catch (x) {
                window[p2] = undefined;
              }
            }
          }
        }
      }
    }.bind(this);
    for (var k in constants) {
      p5.prototype[k] = constants[k];
    }
    if (!sketch) {
      this._isGlobal = true;
      for (var p in p5.prototype) {
        if (typeof p5.prototype[p] === 'function') {
          var ev = p.substring(2);
          if (!this._events.hasOwnProperty(ev)) {
            window[p] = p5.prototype[p].bind(this);
          }
        } else {
          window[p] = p5.prototype[p];
        }
      }
      for (var p2 in this) {
        if (this.hasOwnProperty(p2)) {
          window[p2] = this[p2];
        }
      }
    } else {
      sketch(this);
    }
    for (var e in this._events) {
      var f = this['_on' + e];
      if (f) {
        var m = f.bind(this);
        window.addEventListener(e, m);
        this._events[e] = m;
      }
    }
    var self = this;
    window.addEventListener('focus', function () {
      self._setProperty('focused', true);
    });
    window.addEventListener('blur', function () {
      self._setProperty('focused', false);
    });
    if (sync) {
      this._start();
    } else {
      if (document.readyState === 'complete') {
        this._start();
      } else {
        window.addEventListener('load', this._start.bind(this), false);
      }
    }
  };
  p5.prototype._preloadMethods = [
    'loadJSON',
    'loadImage',
    'loadStrings',
    'loadXML',
    'loadShape',
    'loadTable'
  ];
  p5.prototype._registeredMethods = {
    pre: [],
    post: [],
    remove: []
  };
  p5.prototype.registerPreloadMethod = function (m) {
    p5.prototype._preloadMethods.push(m);
  }.bind(this);
  p5.prototype.registerMethod = function (name, m) {
    if (!p5.prototype._registeredMethods.hasOwnProperty(name)) {
      p5.prototype._registeredMethods[name] = [];
    }
    p5.prototype._registeredMethods[name].push(m);
  }.bind(this);
  return p5;
}({}, amdclean['shim'], amdclean['constants']);
amdclean['utilscolor_utils'] = function (require, core) {
  var p5 = core;
  p5.ColorUtils = {};
  p5.ColorUtils.hsbaToRGBA = function (hsba) {
    var h = hsba[0];
    var s = hsba[1];
    var v = hsba[2];
    h /= 255;
    s /= 255;
    v /= 255;
    var RGBA = [];
    if (s === 0) {
      RGBA = [
        Math.round(v * 255),
        Math.round(v * 255),
        Math.round(v * 255),
        hsba[3]
      ];
    } else {
      var var_h = h * 6;
      if (var_h === 6) {
        var_h = 0;
      }
      var var_i = Math.floor(var_h);
      var var_1 = v * (1 - s);
      var var_2 = v * (1 - s * (var_h - var_i));
      var var_3 = v * (1 - s * (1 - (var_h - var_i)));
      var var_r;
      var var_g;
      var var_b;
      if (var_i === 0) {
        var_r = v;
        var_g = var_3;
        var_b = var_1;
      } else if (var_i === 1) {
        var_r = var_2;
        var_g = v;
        var_b = var_1;
      } else if (var_i === 2) {
        var_r = var_1;
        var_g = v;
        var_b = var_3;
      } else if (var_i === 3) {
        var_r = var_1;
        var_g = var_2;
        var_b = v;
      } else if (var_i === 4) {
        var_r = var_3;
        var_g = var_1;
        var_b = v;
      } else {
        var_r = v;
        var_g = var_1;
        var_b = var_2;
      }
      RGBA = [
        Math.round(var_r * 255),
        Math.round(var_g * 255),
        Math.round(var_b * 255),
        hsba[3]
      ];
    }
    return RGBA;
  };
  p5.ColorUtils.rgbaToHSBA = function (rgba) {
    var var_R = rgba[0] / 255;
    var var_G = rgba[1] / 255;
    var var_B = rgba[2] / 255;
    var var_Min = Math.min(var_R, var_G, var_B);
    var var_Max = Math.max(var_R, var_G, var_B);
    var del_Max = var_Max - var_Min;
    var H;
    var S;
    var V = var_Max;
    if (del_Max === 0) {
      H = 0;
      S = 0;
    } else {
      S = del_Max / var_Max;
      var del_R = ((var_Max - var_R) / 6 + del_Max / 2) / del_Max;
      var del_G = ((var_Max - var_G) / 6 + del_Max / 2) / del_Max;
      var del_B = ((var_Max - var_B) / 6 + del_Max / 2) / del_Max;
      if (var_R === var_Max) {
        H = del_B - del_G;
      } else if (var_G === var_Max) {
        H = 1 / 3 + del_R - del_B;
      } else if (var_B === var_Max) {
        H = 2 / 3 + del_G - del_R;
      }
      if (H < 0) {
        H += 1;
      }
      if (H > 1) {
        H -= 1;
      }
    }
    return [
      Math.round(H * 255),
      Math.round(S * 255),
      Math.round(V * 255),
      rgba[3]
    ];
  };
  return p5.ColorUtils;
}({}, amdclean['core']);
amdclean['p5Color'] = function (require, core, utilscolor_utils, constants) {
  var p5 = core;
  var color_utils = utilscolor_utils;
  var constants = constants;
  p5.Color = function (pInst, vals) {
    this.color_array = p5.Color._getFormattedColor.apply(pInst, vals);
    this._converted_color = this._convertTo255(pInst);
    var isHSB = pInst._colorMode === constants.HSB;
    if (isHSB) {
      this.hsba = this.color_array;
      this.rgba = color_utils.hsbaToRGBA(this._converted_color);
    } else {
      this.rgba = this.color_array;
      this.hsba = color_utils.rgbaToHSBA(this._converted_color);
    }
    return this;
  };
  p5.Color.prototype._convertTo255 = function (pInst) {
    var isRGB = pInst._colorMode === constants.RGB;
    var maxArr = isRGB ? pInst._maxRGB : pInst._maxHSB;
    var arr = [];
    arr[0] = this.color_array[0] * 255 / maxArr[0];
    arr[1] = this.color_array[1] * 255 / maxArr[1];
    arr[2] = this.color_array[2] * 255 / maxArr[2];
    arr[3] = this.color_array[3] * 255 / maxArr[3];
    return arr;
  };
  p5.Color.prototype.getHue = function () {
    return this.hsba[0];
  };
  p5.Color.prototype.getSaturation = function () {
    return this.hsba[1];
  };
  p5.Color.prototype.getBrightness = function () {
    return this.hsba[2];
  };
  p5.Color.prototype.getRed = function () {
    return this.rgba[0];
  };
  p5.Color.prototype.getGreen = function () {
    return this.rgba[1];
  };
  p5.Color.prototype.getBlue = function () {
    return this.rgba[2];
  };
  p5.Color.prototype.getAlpha = function () {
    return this.rgba[3];
  };
  p5.Color.prototype.toString = function () {
    var a = this.rgba;
    for (var i = 0; i < 3; i++) {
      a[i] = Math.floor(a[i]);
    }
    var alpha = typeof a[3] !== 'undefined' ? a[3] / 255 : 1;
    return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + alpha + ')';
  };
  var WHITESPACE = /\s*/;
  var INTEGER = /(\d{1,3})/;
  var DECIMAL = /((?:\d+(?:\.\d+)?)|(?:\.\d+))/;
  var PERCENT = new RegExp(DECIMAL.source + '%');
  var namedColors = {
      aliceblue: '#f0f8ff',
      antiquewhite: '#faebd7',
      aqua: '#00ffff',
      aquamarine: '#7fffd4',
      azure: '#f0ffff',
      beige: '#f5f5dc',
      bisque: '#ffe4c4',
      black: '#000000',
      blanchedalmond: '#ffebcd',
      blue: '#0000ff',
      blueviolet: '#8a2be2',
      brown: '#a52a2a',
      burlywood: '#deb887',
      cadetblue: '#5f9ea0',
      chartreuse: '#7fff00',
      chocolate: '#d2691e',
      coral: '#ff7f50',
      cornflowerblue: '#6495ed',
      cornsilk: '#fff8dc',
      crimson: '#dc143c',
      cyan: '#00ffff',
      darkblue: '#00008b',
      darkcyan: '#008b8b',
      darkgoldenrod: '#b8860b',
      darkgray: '#a9a9a9',
      darkgreen: '#006400',
      darkgrey: '#a9a9a9',
      darkkhaki: '#bdb76b',
      darkmagenta: '#8b008b',
      darkolivegreen: '#556b2f',
      darkorange: '#ff8c00',
      darkorchid: '#9932cc',
      darkred: '#8b0000',
      darksalmon: '#e9967a',
      darkseagreen: '#8fbc8f',
      darkslateblue: '#483d8b',
      darkslategray: '#2f4f4f',
      darkslategrey: '#2f4f4f',
      darkturquoise: '#00ced1',
      darkviolet: '#9400d3',
      deeppink: '#ff1493',
      deepskyblue: '#00bfff',
      dimgray: '#696969',
      dimgrey: '#696969',
      dodgerblue: '#1e90ff',
      firebrick: '#b22222',
      floralwhite: '#fffaf0',
      forestgreen: '#228b22',
      fuchsia: '#ff00ff',
      gainsboro: '#dcdcdc',
      ghostwhite: '#f8f8ff',
      gold: '#ffd700',
      goldenrod: '#daa520',
      gray: '#808080',
      green: '#008000',
      greenyellow: '#adff2f',
      grey: '#808080',
      honeydew: '#f0fff0',
      hotpink: '#ff69b4',
      indianred: '#cd5c5c',
      indigo: '#4b0082',
      ivory: '#fffff0',
      khaki: '#f0e68c',
      lavender: '#e6e6fa',
      lavenderblush: '#fff0f5',
      lawngreen: '#7cfc00',
      lemonchiffon: '#fffacd',
      lightblue: '#add8e6',
      lightcoral: '#f08080',
      lightcyan: '#e0ffff',
      lightgoldenrodyellow: '#fafad2',
      lightgray: '#d3d3d3',
      lightgreen: '#90ee90',
      lightgrey: '#d3d3d3',
      lightpink: '#ffb6c1',
      lightsalmon: '#ffa07a',
      lightseagreen: '#20b2aa',
      lightskyblue: '#87cefa',
      lightslategray: '#778899',
      lightslategrey: '#778899',
      lightsteelblue: '#b0c4de',
      lightyellow: '#ffffe0',
      lime: '#00ff00',
      limegreen: '#32cd32',
      linen: '#faf0e6',
      magenta: '#ff00ff',
      maroon: '#800000',
      mediumaquamarine: '#66cdaa',
      mediumblue: '#0000cd',
      mediumorchid: '#ba55d3',
      mediumpurple: '#9370db',
      mediumseagreen: '#3cb371',
      mediumslateblue: '#7b68ee',
      mediumspringgreen: '#00fa9a',
      mediumturquoise: '#48d1cc',
      mediumvioletred: '#c71585',
      midnightblue: '#191970',
      mintcream: '#f5fffa',
      mistyrose: '#ffe4e1',
      moccasin: '#ffe4b5',
      navajowhite: '#ffdead',
      navy: '#000080',
      oldlace: '#fdf5e6',
      olive: '#808000',
      olivedrab: '#6b8e23',
      orange: '#ffa500',
      orangered: '#ff4500',
      orchid: '#da70d6',
      palegoldenrod: '#eee8aa',
      palegreen: '#98fb98',
      paleturquoise: '#afeeee',
      palevioletred: '#db7093',
      papayawhip: '#ffefd5',
      peachpuff: '#ffdab9',
      peru: '#cd853f',
      pink: '#ffc0cb',
      plum: '#dda0dd',
      powderblue: '#b0e0e6',
      purple: '#800080',
      red: '#ff0000',
      rosybrown: '#bc8f8f',
      royalblue: '#4169e1',
      saddlebrown: '#8b4513',
      salmon: '#fa8072',
      sandybrown: '#f4a460',
      seagreen: '#2e8b57',
      seashell: '#fff5ee',
      sienna: '#a0522d',
      silver: '#c0c0c0',
      skyblue: '#87ceeb',
      slateblue: '#6a5acd',
      slategray: '#708090',
      slategrey: '#708090',
      snow: '#fffafa',
      springgreen: '#00ff7f',
      steelblue: '#4682b4',
      tan: '#d2b48c',
      teal: '#008080',
      thistle: '#d8bfd8',
      tomato: '#ff6347',
      turquoise: '#40e0d0',
      violet: '#ee82ee',
      wheat: '#f5deb3',
      white: '#ffffff',
      whitesmoke: '#f5f5f5',
      yellow: '#ffff00',
      yellowgreen: '#9acd32'
    };
  var colorPatterns = {
      HEX3: /^#([a-f0-9])([a-f0-9])([a-f0-9])$/i,
      HEX6: /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i,
      RGB: new RegExp([
        '^rgb\\(',
        INTEGER.source,
        ',',
        INTEGER.source,
        ',',
        INTEGER.source,
        '\\)$'
      ].join(WHITESPACE.source), 'i'),
      RGB_PERCENT: new RegExp([
        '^rgb\\(',
        PERCENT.source,
        ',',
        PERCENT.source,
        ',',
        PERCENT.source,
        '\\)$'
      ].join(WHITESPACE.source), 'i'),
      RGBA: new RegExp([
        '^rgba\\(',
        INTEGER.source,
        ',',
        INTEGER.source,
        ',',
        INTEGER.source,
        ',',
        DECIMAL.source,
        '\\)$'
      ].join(WHITESPACE.source), 'i'),
      RGBA_PERCENT: new RegExp([
        '^rgba\\(',
        PERCENT.source,
        ',',
        PERCENT.source,
        ',',
        PERCENT.source,
        ',',
        DECIMAL.source,
        '\\)$'
      ].join(WHITESPACE.source), 'i')
    };
  p5.Color._getFormattedColor = function () {
    var r, g, b, a, str, vals;
    if (arguments.length >= 3) {
      r = arguments[0];
      g = arguments[1];
      b = arguments[2];
      a = typeof arguments[3] === 'number' ? arguments[3] : 255;
    } else if (typeof arguments[0] === 'string') {
      str = arguments[0].trim().toLowerCase();
      if (namedColors[str]) {
        return p5.Color._getFormattedColor.apply(this, [namedColors[str]]);
      }
      if (colorPatterns.HEX3.test(str)) {
        vals = colorPatterns.HEX3.exec(str).slice(1).map(function (color) {
          return parseInt(color + color, 16);
        });
      } else if (colorPatterns.HEX6.test(str)) {
        vals = colorPatterns.HEX6.exec(str).slice(1).map(function (color) {
          return parseInt(color, 16);
        });
      } else if (colorPatterns.RGB.test(str)) {
        vals = colorPatterns.RGB.exec(str).slice(1).map(function (color) {
          return parseInt(color, 10);
        });
      } else if (colorPatterns.RGB_PERCENT.test(str)) {
        vals = colorPatterns.RGB_PERCENT.exec(str).slice(1).map(function (color) {
          return parseInt(parseFloat(color) / 100 * 255, 10);
        });
      } else if (colorPatterns.RGBA.test(str)) {
        vals = colorPatterns.RGBA.exec(str).slice(1).map(function (color, idx) {
          if (idx === 3) {
            return parseInt(parseFloat(color) * 255, 10);
          }
          return parseInt(color, 10);
        });
      } else if (colorPatterns.RGBA_PERCENT.test(str)) {
        vals = colorPatterns.RGBA_PERCENT.exec(str).slice(1).map(function (color, idx) {
          if (idx === 3) {
            return parseInt(parseFloat(color) * 255, 10);
          }
          return parseInt(parseFloat(color) / 100 * 255, 10);
        });
      } else {
        vals = [255];
      }
      return p5.Color._getFormattedColor.apply(this, vals);
    } else {
      if (this._colorMode === constants.RGB) {
        r = g = b = arguments[0];
      } else {
        r = b = arguments[0];
        g = 0;
      }
      a = typeof arguments[1] === 'number' ? arguments[1] : 255;
    }
    return [
      r,
      g,
      b,
      a
    ];
  };
  return p5.Color;
}({}, amdclean['core'], amdclean['utilscolor_utils'], amdclean['constants']);
amdclean['p5Element'] = function (require, core) {
  var p5 = core;
  p5.Element = function (elt, pInst) {
    this.elt = elt;
    this._pInst = pInst;
    this._events = {};
    this.width = this.elt.offsetWidth;
    this.height = this.elt.offsetHeight;
  };
  p5.Element.prototype.parent = function (p) {
    if (typeof p === 'string') {
      p = document.getElementById(p);
    } else if (p instanceof p5.Element) {
      p = p.elt;
    }
    p.appendChild(this.elt);
    return this;
  };
  p5.Element.prototype.id = function (id) {
    this.elt.id = id;
    return this;
  };
  p5.Element.prototype.class = function (c) {
    this.elt.className += ' ' + c;
    return this;
  };
  p5.Element.prototype.mousePressed = function (fxn) {
    attachListener('mousedown', fxn, this);
    attachListener('touchstart', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseWheel = function (fxn) {
    attachListener('mousewheel', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseReleased = function (fxn) {
    attachListener('mouseup', fxn, this);
    attachListener('touchend', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseClicked = function (fxn) {
    attachListener('click', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseMoved = function (fxn) {
    attachListener('mousemove', fxn, this);
    attachListener('touchmove', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseOver = function (fxn) {
    attachListener('mouseover', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseOut = function (fxn) {
    attachListener('mouseout', fxn, this);
    return this;
  };
  p5.Element.prototype.touchStarted = function (fxn) {
    attachListener('touchstart', fxn, this);
    attachListener('mousedown', fxn, this);
    return this;
  };
  p5.Element.prototype.touchMoved = function (fxn) {
    attachListener('touchmove', fxn, this);
    attachListener('mousemove', fxn, this);
    return this;
  };
  p5.Element.prototype.touchEnded = function (fxn) {
    attachListener('touchend', fxn, this);
    attachListener('mouseup', fxn, this);
    return this;
  };
  p5.Element.prototype.dragOver = function (fxn) {
    attachListener('dragover', fxn, this);
    return this;
  };
  p5.Element.prototype.dragLeave = function (fxn) {
    attachListener('dragleave', fxn, this);
    return this;
  };
  p5.Element.prototype.drop = function (callback, fxn) {
    function makeLoader(theFile) {
      var p5file = new p5.File(theFile);
      return function (e) {
        p5file.data = e.target.result;
        callback(p5file);
      };
    }
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      attachListener('dragover', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }, this);
      attachListener('dragleave', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }, this);
      if (arguments.length > 1) {
        attachListener('drop', fxn, this);
      }
      attachListener('drop', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
          var f = files[i];
          var reader = new FileReader();
          reader.onload = makeLoader(f);
          if (f.type === 'text') {
            reader.readAsText(f);
          } else {
            reader.readAsDataURL(f);
          }
        }
      }, this);
    } else {
      console.log('The File APIs are not fully supported in this browser.');
    }
    return this;
  };
  function attachListener(ev, fxn, ctx) {
    var f = fxn.bind(ctx);
    ctx.elt.addEventListener(ev, f, false);
    ctx._events[ev] = f;
  }
  p5.Element.prototype._setProperty = function (prop, value) {
    this[prop] = value;
  };
  return p5.Element;
}({}, amdclean['core']);
amdclean['canvas'] = function (require, constants) {
  var constants = constants;
  return {
    modeAdjust: function (a, b, c, d, mode) {
      if (mode === constants.CORNER) {
        return {
          x: a,
          y: b,
          w: c,
          h: d
        };
      } else if (mode === constants.CORNERS) {
        return {
          x: a,
          y: b,
          w: c - a,
          h: d - b
        };
      } else if (mode === constants.RADIUS) {
        return {
          x: a - c,
          y: b - d,
          w: 2 * c,
          h: 2 * d
        };
      } else if (mode === constants.CENTER) {
        return {
          x: a - c * 0.5,
          y: b - d * 0.5,
          w: c,
          h: d
        };
      }
    },
    arcModeAdjust: function (a, b, c, d, mode) {
      if (mode === constants.CORNER) {
        return {
          x: a + c * 0.5,
          y: b + d * 0.5,
          w: c,
          h: d
        };
      } else if (mode === constants.CORNERS) {
        return {
          x: a,
          y: b,
          w: c + a,
          h: d + b
        };
      } else if (mode === constants.RADIUS) {
        return {
          x: a,
          y: b,
          w: 2 * c,
          h: 2 * d
        };
      } else if (mode === constants.CENTER) {
        return {
          x: a,
          y: b,
          w: c,
          h: d
        };
      }
    }
  };
}({}, amdclean['constants']);
amdclean['filters'] = function (require) {
  'use strict';
  var Filters = {};
  Filters._toPixels = function (canvas) {
    if (canvas instanceof ImageData) {
      return canvas.data;
    } else {
      return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    }
  };
  Filters._getARGB = function (data, i) {
    var offset = i * 4;
    return data[offset + 3] << 24 & 4278190080 | data[offset] << 16 & 16711680 | data[offset + 1] << 8 & 65280 | data[offset + 2] & 255;
  };
  Filters._setPixels = function (pixels, data) {
    var offset = 0;
    for (var i = 0, al = pixels.length; i < al; i++) {
      offset = i * 4;
      pixels[offset + 0] = (data[i] & 16711680) >>> 16;
      pixels[offset + 1] = (data[i] & 65280) >>> 8;
      pixels[offset + 2] = data[i] & 255;
      pixels[offset + 3] = (data[i] & 4278190080) >>> 24;
    }
  };
  Filters._toImageData = function (canvas) {
    if (canvas instanceof ImageData) {
      return canvas;
    } else {
      return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    }
  };
  Filters._createImageData = function (width, height) {
    Filters._tmpCanvas = document.createElement('canvas');
    Filters._tmpCtx = Filters._tmpCanvas.getContext('2d');
    return this._tmpCtx.createImageData(width, height);
  };
  Filters.apply = function (canvas, func, filterParam) {
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var newImageData = func(imageData, filterParam);
    if (newImageData instanceof ImageData) {
      ctx.putImageData(newImageData, 0, 0, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    }
  };
  Filters.threshold = function (canvas, level) {
    var pixels = Filters._toPixels(canvas);
    if (level === undefined) {
      level = 0.5;
    }
    var thresh = Math.floor(level * 255);
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var grey = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      var val;
      if (grey >= thresh) {
        val = 255;
      } else {
        val = 0;
      }
      pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
    }
  };
  Filters.gray = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
    }
  };
  Filters.opaque = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    for (var i = 0; i < pixels.length; i += 4) {
      pixels[i + 3] = 255;
    }
    return pixels;
  };
  Filters.invert = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    for (var i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i];
      pixels[i + 1] = 255 - pixels[i + 1];
      pixels[i + 2] = 255 - pixels[i + 2];
    }
  };
  Filters.posterize = function (canvas, level) {
    var pixels = Filters._toPixels(canvas);
    if (level < 2 || level > 255) {
      throw new Error('Level must be greater than 2 and less than 255 for posterize');
    }
    var levels1 = level - 1;
    for (var i = 0; i < pixels.length; i += 4) {
      var rlevel = pixels[i];
      var glevel = pixels[i + 1];
      var blevel = pixels[i + 2];
      pixels[i] = (rlevel * level >> 8) * 255 / levels1;
      pixels[i + 1] = (glevel * level >> 8) * 255 / levels1;
      pixels[i + 2] = (blevel * level >> 8) * 255 / levels1;
    }
  };
  Filters.dilate = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    var currIdx = 0;
    var maxIdx = pixels.length ? pixels.length / 4 : 0;
    var out = new Int32Array(maxIdx);
    var currRowIdx, maxRowIdx, colOrig, colOut, currLum;
    var idxRight, idxLeft, idxUp, idxDown, colRight, colLeft, colUp, colDown, lumRight, lumLeft, lumUp, lumDown;
    while (currIdx < maxIdx) {
      currRowIdx = currIdx;
      maxRowIdx = currIdx + canvas.width;
      while (currIdx < maxRowIdx) {
        colOrig = colOut = Filters._getARGB(pixels, currIdx);
        idxLeft = currIdx - 1;
        idxRight = currIdx + 1;
        idxUp = currIdx - canvas.width;
        idxDown = currIdx + canvas.width;
        if (idxLeft < currRowIdx) {
          idxLeft = currIdx;
        }
        if (idxRight >= maxRowIdx) {
          idxRight = currIdx;
        }
        if (idxUp < 0) {
          idxUp = 0;
        }
        if (idxDown >= maxIdx) {
          idxDown = currIdx;
        }
        colUp = Filters._getARGB(pixels, idxUp);
        colLeft = Filters._getARGB(pixels, idxLeft);
        colDown = Filters._getARGB(pixels, idxDown);
        colRight = Filters._getARGB(pixels, idxRight);
        currLum = 77 * (colOrig >> 16 & 255) + 151 * (colOrig >> 8 & 255) + 28 * (colOrig & 255);
        lumLeft = 77 * (colLeft >> 16 & 255) + 151 * (colLeft >> 8 & 255) + 28 * (colLeft & 255);
        lumRight = 77 * (colRight >> 16 & 255) + 151 * (colRight >> 8 & 255) + 28 * (colRight & 255);
        lumUp = 77 * (colUp >> 16 & 255) + 151 * (colUp >> 8 & 255) + 28 * (colUp & 255);
        lumDown = 77 * (colDown >> 16 & 255) + 151 * (colDown >> 8 & 255) + 28 * (colDown & 255);
        if (lumLeft > currLum) {
          colOut = colLeft;
          currLum = lumLeft;
        }
        if (lumRight > currLum) {
          colOut = colRight;
          currLum = lumRight;
        }
        if (lumUp > currLum) {
          colOut = colUp;
          currLum = lumUp;
        }
        if (lumDown > currLum) {
          colOut = colDown;
          currLum = lumDown;
        }
        out[currIdx++] = colOut;
      }
    }
    Filters._setPixels(pixels, out);
  };
  Filters.erode = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    var currIdx = 0;
    var maxIdx = pixels.length ? pixels.length / 4 : 0;
    var out = new Int32Array(maxIdx);
    var currRowIdx, maxRowIdx, colOrig, colOut, currLum;
    var idxRight, idxLeft, idxUp, idxDown, colRight, colLeft, colUp, colDown, lumRight, lumLeft, lumUp, lumDown;
    while (currIdx < maxIdx) {
      currRowIdx = currIdx;
      maxRowIdx = currIdx + canvas.width;
      while (currIdx < maxRowIdx) {
        colOrig = colOut = Filters._getARGB(pixels, currIdx);
        idxLeft = currIdx - 1;
        idxRight = currIdx + 1;
        idxUp = currIdx - canvas.width;
        idxDown = currIdx + canvas.width;
        if (idxLeft < currRowIdx) {
          idxLeft = currIdx;
        }
        if (idxRight >= maxRowIdx) {
          idxRight = currIdx;
        }
        if (idxUp < 0) {
          idxUp = 0;
        }
        if (idxDown >= maxIdx) {
          idxDown = currIdx;
        }
        colUp = Filters._getARGB(pixels, idxUp);
        colLeft = Filters._getARGB(pixels, idxLeft);
        colDown = Filters._getARGB(pixels, idxDown);
        colRight = Filters._getARGB(pixels, idxRight);
        currLum = 77 * (colOrig >> 16 & 255) + 151 * (colOrig >> 8 & 255) + 28 * (colOrig & 255);
        lumLeft = 77 * (colLeft >> 16 & 255) + 151 * (colLeft >> 8 & 255) + 28 * (colLeft & 255);
        lumRight = 77 * (colRight >> 16 & 255) + 151 * (colRight >> 8 & 255) + 28 * (colRight & 255);
        lumUp = 77 * (colUp >> 16 & 255) + 151 * (colUp >> 8 & 255) + 28 * (colUp & 255);
        lumDown = 77 * (colDown >> 16 & 255) + 151 * (colDown >> 8 & 255) + 28 * (colDown & 255);
        if (lumLeft < currLum) {
          colOut = colLeft;
          currLum = lumLeft;
        }
        if (lumRight < currLum) {
          colOut = colRight;
          currLum = lumRight;
        }
        if (lumUp < currLum) {
          colOut = colUp;
          currLum = lumUp;
        }
        if (lumDown < currLum) {
          colOut = colDown;
          currLum = lumDown;
        }
        out[currIdx++] = colOut;
      }
    }
    Filters._setPixels(pixels, out);
  };
  var blurRadius;
  var blurKernelSize;
  var blurKernel;
  var blurMult;
  function buildBlurKernel(r) {
    var radius = r * 3.5 | 0;
    radius = radius < 1 ? 1 : radius < 248 ? radius : 248;
    if (blurRadius !== radius) {
      blurRadius = radius;
      blurKernelSize = 1 + blurRadius << 1;
      blurKernel = new Int32Array(blurKernelSize);
      blurMult = new Array(blurKernelSize);
      for (var l = 0; l < blurKernelSize; l++) {
        blurMult[l] = new Int32Array(256);
      }
      var bk, bki;
      var bm, bmi;
      for (var i = 1, radiusi = radius - 1; i < radius; i++) {
        blurKernel[radius + i] = blurKernel[radiusi] = bki = radiusi * radiusi;
        bm = blurMult[radius + i];
        bmi = blurMult[radiusi--];
        for (var j = 0; j < 256; j++) {
          bm[j] = bmi[j] = bki * j;
        }
      }
      bk = blurKernel[radius] = radius * radius;
      bm = blurMult[radius];
      for (var k = 0; k < 256; k++) {
        bm[k] = bk * k;
      }
    }
  }
  function blurARGB(canvas, radius) {
    var pixels = Filters._toPixels(canvas);
    var width = canvas.width;
    var height = canvas.height;
    var numPackedPixels = width * height;
    var argb = new Int32Array(numPackedPixels);
    for (var j = 0; j < numPackedPixels; j++) {
      argb[j] = Filters._getARGB(pixels, j);
    }
    var sum, cr, cg, cb, ca;
    var read, ri, ym, ymi, bk0;
    var a2 = new Int32Array(numPackedPixels);
    var r2 = new Int32Array(numPackedPixels);
    var g2 = new Int32Array(numPackedPixels);
    var b2 = new Int32Array(numPackedPixels);
    var yi = 0;
    buildBlurKernel(radius);
    var x, y, i;
    var bm;
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        cb = cg = cr = ca = sum = 0;
        read = x - blurRadius;
        if (read < 0) {
          bk0 = -read;
          read = 0;
        } else {
          if (read >= width) {
            break;
          }
          bk0 = 0;
        }
        for (i = bk0; i < blurKernelSize; i++) {
          if (read >= width) {
            break;
          }
          var c = argb[read + yi];
          bm = blurMult[i];
          ca += bm[(c & -16777216) >>> 24];
          cr += bm[(c & 16711680) >> 16];
          cg += bm[(c & 65280) >> 8];
          cb += bm[c & 255];
          sum += blurKernel[i];
          read++;
        }
        ri = yi + x;
        a2[ri] = ca / sum;
        r2[ri] = cr / sum;
        g2[ri] = cg / sum;
        b2[ri] = cb / sum;
      }
      yi += width;
    }
    yi = 0;
    ym = -blurRadius;
    ymi = ym * width;
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        cb = cg = cr = ca = sum = 0;
        if (ym < 0) {
          bk0 = ri = -ym;
          read = x;
        } else {
          if (ym >= height) {
            break;
          }
          bk0 = 0;
          ri = ym;
          read = x + ymi;
        }
        for (i = bk0; i < blurKernelSize; i++) {
          if (ri >= height) {
            break;
          }
          bm = blurMult[i];
          ca += bm[a2[read]];
          cr += bm[r2[read]];
          cg += bm[g2[read]];
          cb += bm[b2[read]];
          sum += blurKernel[i];
          ri++;
          read += width;
        }
        argb[x + yi] = ca / sum << 24 | cr / sum << 16 | cg / sum << 8 | cb / sum;
      }
      yi += width;
      ymi += width;
      ym++;
    }
    Filters._setPixels(pixels, argb);
  }
  Filters.blur = function (canvas, radius) {
    blurARGB(canvas, radius);
  };
  return Filters;
}({});
amdclean['p5Graphics'] = function (require, core) {
  var p5 = core;
  p5.Graphics = function (elt, pInst, isMainCanvas) {
    p5.Element.call(this, elt, pInst);
    this.canvas = elt;
    this._pInst = pInst;
    if (isMainCanvas) {
      this._isMainCanvas = true;
      this._pInst._setProperty('_curElement', this);
      this._pInst._setProperty('canvas', this.canvas);
      this._pInst._setProperty('width', this.width);
      this._pInst._setProperty('height', this.height);
    } else {
      this.canvas.style.display = 'none';
      this._styles = [];
    }
  };
  p5.Graphics.prototype = Object.create(p5.Element.prototype);
  p5.Graphics.prototype.resize = function (w, h) {
    this.width = w;
    this.height = h;
    this.elt.width = w * this._pInst.pixelDensity;
    this.elt.height = h * this._pInst.pixelDensity;
    this.elt.style.width = w + 'px';
    this.elt.style.height = h + 'px';
    if (this._isMainCanvas) {
      this._pInst._setProperty('width', this.width);
      this._pInst._setProperty('height', this.height);
    }
    this.drawingContext.scale(this._pInst.pixelDensity, this._pInst.pixelDensity);
  };
  return p5.Graphics;
}({}, amdclean['core']);
amdclean['p5Graphics2D'] = function (require, core, canvas, constants, filters, p5Graphics) {
  var p5 = core;
  var canvas = canvas;
  var constants = constants;
  var filters = filters;
  var styleEmpty = 'rgba(0,0,0,0)';
  p5.Graphics2D = function (elt, pInst, isMainCanvas) {
    p5.Graphics.call(this, elt, pInst, isMainCanvas);
    this.drawingContext = this.canvas.getContext('2d');
    this._pInst._setProperty('drawingContext', this.drawingContext);
    return this;
  };
  p5.Graphics2D.prototype = Object.create(p5.Graphics.prototype);
  p5.Graphics2D.prototype._applyDefaults = function () {
    this.drawingContext.fillStyle = '#FFFFFF';
    this.drawingContext.strokeStyle = '#000000';
    this.drawingContext.lineCap = constants.ROUND;
    this.drawingContext.font = 'normal 12px sans-serif';
  };
  p5.Graphics2D.prototype.background = function () {
    this.drawingContext.save();
    this.drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    this.drawingContext.scale(this._pInst.pixelDensity, this._pInst.pixelDensity);
    if (arguments[0] instanceof p5.Image) {
      this._pInst.image(arguments[0], 0, 0, this.width, this.height);
    } else {
      var curFill = this.drawingContext.fillStyle;
      var color = this._pInst.color.apply(this._pInst, arguments);
      var newFill = color.toString();
      this.drawingContext.fillStyle = newFill;
      this.drawingContext.fillRect(0, 0, this.width, this.height);
      this.drawingContext.fillStyle = curFill;
    }
    this.drawingContext.restore();
  };
  p5.Graphics2D.prototype.clear = function () {
    this.drawingContext.clearRect(0, 0, this.width, this.height);
  };
  p5.Graphics2D.prototype.fill = function () {
    var ctx = this.drawingContext;
    var color = this._pInst.color.apply(this._pInst, arguments);
    ctx.fillStyle = color.toString();
  };
  p5.Graphics2D.prototype.stroke = function () {
    var ctx = this.drawingContext;
    var color = this._pInst.color.apply(this._pInst, arguments);
    ctx.strokeStyle = color.toString();
  };
  p5.Graphics2D.prototype.image = function (img, x, y, w, h) {
    var frame = img.canvas || img.elt;
    try {
      if (this._pInst._tint && img.canvas) {
        this.drawingContext.drawImage(this._getTintedImageCanvas(img), x, y, w, h);
      } else {
        this.drawingContext.drawImage(frame, x, y, w, h);
      }
    } catch (e) {
      if (e.name !== 'NS_ERROR_NOT_AVAILABLE') {
        throw e;
      }
    }
  };
  p5.Graphics2D.prototype._getTintedImageCanvas = function (img) {
    if (!img.canvas) {
      return img;
    }
    var pixels = filters._toPixels(img.canvas);
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = img.canvas.width;
    tmpCanvas.height = img.canvas.height;
    var tmpCtx = tmpCanvas.getContext('2d');
    var id = tmpCtx.createImageData(img.canvas.width, img.canvas.height);
    var newPixels = id.data;
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var a = pixels[i + 3];
      newPixels[i] = r * this._pInst._tint[0] / 255;
      newPixels[i + 1] = g * this._pInst._tint[1] / 255;
      newPixels[i + 2] = b * this._pInst._tint[2] / 255;
      newPixels[i + 3] = a * this._pInst._tint[3] / 255;
    }
    tmpCtx.putImageData(id, 0, 0);
    return tmpCanvas;
  };
  p5.Graphics2D.prototype.blend = function () {
    var currBlend = this.drawingContext.globalCompositeOperation;
    var blendMode = arguments[arguments.length - 1];
    var copyArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    this.drawingContext.globalCompositeOperation = blendMode;
    this._pInst.copy.apply(this._pInst, copyArgs);
    this.drawingContext.globalCompositeOperation = currBlend;
  };
  p5.Graphics2D.prototype.copy = function () {
    var srcImage, sx, sy, sw, sh, dx, dy, dw, dh;
    if (arguments.length === 9) {
      srcImage = arguments[0];
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else if (arguments.length === 8) {
      srcImage = this._pInst;
      sx = arguments[0];
      sy = arguments[1];
      sw = arguments[2];
      sh = arguments[3];
      dx = arguments[4];
      dy = arguments[5];
      dw = arguments[6];
      dh = arguments[7];
    } else {
      throw new Error('Signature not supported');
    }
    p5.Graphics2D._copyHelper(srcImage, sx, sy, sw, sh, dx, dy, dw, dh);
  };
  p5.Graphics2D._copyHelper = function (srcImage, sx, sy, sw, sh, dx, dy, dw, dh) {
    var s = srcImage.canvas.width / srcImage.width;
    this.drawingContext.drawImage(srcImage.canvas, s * sx, s * sy, s * sw, s * sh, dx, dy, dw, dh);
  };
  p5.Graphics2D.prototype.get = function (x, y, w, h) {
    if (x === undefined && y === undefined && w === undefined && h === undefined) {
      x = 0;
      y = 0;
      w = this.width;
      h = this.height;
    } else if (w === undefined && h === undefined) {
      w = 1;
      h = 1;
    }
    if (x > this.width || y > this.height || x < 0 || y < 0) {
      return [
        0,
        0,
        0,
        255
      ];
    }
    var pd = this.pixelDensity || this._pInst.pixelDensity;
    if (w === 1 && h === 1) {
      var imageData = this.drawingContext.getImageData(x * pd, y * pd, w, h);
      var data = imageData.data;
      var pixels = [];
      for (var i = 0; i < data.length; i += 4) {
        pixels.push(data[i], data[i + 1], data[i + 2], data[i + 3]);
      }
      return pixels;
    } else {
      var sx = x * pd;
      var sy = y * pd;
      var dw = Math.min(w, this.width);
      var dh = Math.min(h, this.height);
      var sw = dw * pd;
      var sh = dh * pd;
      var region = new p5.Image(dw, dh);
      region.canvas.getContext('2d').drawImage(this.canvas, sx, sy, sw, sh, 0, 0, dw, dh);
      return region;
    }
  };
  p5.Graphics2D.prototype.loadPixels = function () {
    var pd = this.pixelDensity || this._pInst.pixelDensity;
    var w = this.width * pd;
    var h = this.height * pd;
    var imageData = this.drawingContext.getImageData(0, 0, w, h);
    if (this._pInst) {
      this._pInst._setProperty('imageData', imageData);
      this._pInst._setProperty('pixels', imageData.data);
    } else {
      this._setProperty('imageData', imageData);
      this._setProperty('pixels', imageData.data);
    }
  };
  p5.Graphics2D.prototype.set = function (x, y, imgOrCol) {
    if (imgOrCol instanceof p5.Image) {
      this.drawingContext.save();
      this.drawingContext.setTransform(1, 0, 0, 1, 0, 0);
      this.drawingContext.scale(this._pInst.pixelDensity, this._pInst.pixelDensity);
      this.drawingContext.drawImage(imgOrCol.canvas, x, y);
      this.loadPixels.call(this._pInst);
      this.drawingContext.restore();
    } else {
      var ctx = this._pInst || this;
      var r = 0, g = 0, b = 0, a = 0;
      var idx = 4 * (y * ctx.pixelDensity * (this.width * ctx.pixelDensity) + x * ctx.pixelDensity);
      if (!ctx.imageData) {
        ctx.loadPixels.call(ctx);
      }
      if (typeof imgOrCol === 'number') {
        if (idx < ctx.pixels.length) {
          r = imgOrCol;
          g = imgOrCol;
          b = imgOrCol;
          a = 255;
        }
      } else if (imgOrCol instanceof Array) {
        if (imgOrCol.length < 4) {
          throw new Error('pixel array must be of the form [R, G, B, A]');
        }
        if (idx < ctx.pixels.length) {
          r = imgOrCol[0];
          g = imgOrCol[1];
          b = imgOrCol[2];
          a = imgOrCol[3];
        }
      } else if (imgOrCol instanceof p5.Color) {
        if (idx < ctx.pixels.length) {
          r = imgOrCol.rgba[0];
          g = imgOrCol.rgba[1];
          b = imgOrCol.rgba[2];
          a = imgOrCol.rgba[3];
        }
      }
      for (var i = 0; i < ctx.pixelDensity; i++) {
        for (var j = 0; j < ctx.pixelDensity; j++) {
          idx = 4 * ((y * ctx.pixelDensity + j) * this.width * ctx.pixelDensity + (x * ctx.pixelDensity + i));
          ctx.pixels[idx] = r;
          ctx.pixels[idx + 1] = g;
          ctx.pixels[idx + 2] = b;
          ctx.pixels[idx + 3] = a;
        }
      }
    }
  };
  p5.Graphics2D.prototype.updatePixels = function (x, y, w, h) {
    var pd = this.pixelDensity || this._pInst.pixelDensity;
    if (x === undefined && y === undefined && w === undefined && h === undefined) {
      x = 0;
      y = 0;
      w = this.width;
      h = this.height;
    }
    w *= pd;
    h *= pd;
    if (this._pInst) {
      this.drawingContext.putImageData(this._pInst.imageData, x, y, 0, 0, w, h);
    } else {
      this.drawingContext.putImageData(this.imageData, x, y, 0, 0, w, h);
    }
  };
  p5.Graphics2D.prototype.arc = function (x, y, w, h, start, stop, mode, curves) {
    if (!this._pInst._doStroke && !this._pInst._doFill) {
      return;
    }
    var ctx = this.drawingContext;
    var vals = canvas.arcModeAdjust(x, y, w, h, this._pInst._ellipseMode);
    var rx = vals.w / 2;
    var ry = vals.h / 2;
    ctx.beginPath();
    curves.forEach(function (curve, index) {
      if (index === 0) {
        ctx.moveTo(vals.x + curve.x1 * rx, vals.y + curve.y1 * ry);
      }
      ctx.bezierCurveTo(vals.x + curve.x2 * rx, vals.y + curve.y2 * ry, vals.x + curve.x3 * rx, vals.y + curve.y3 * ry, vals.x + curve.x4 * rx, vals.y + curve.y4 * ry);
    });
    if (this._pInst._doFill) {
      if (mode === constants.PIE || mode == null) {
        ctx.lineTo(vals.x, vals.y);
      }
      ctx.closePath();
      ctx.fill();
      if (this._pInst._doStroke) {
        if (mode === constants.CHORD || mode === constants.PIE) {
          ctx.stroke();
          return this;
        }
      }
    }
    if (this._pInst._doStroke) {
      if (mode === constants.OPEN || mode == null) {
        ctx.beginPath();
        curves.forEach(function (curve, index) {
          if (index === 0) {
            ctx.moveTo(vals.x + curve.x1 * rx, vals.y + curve.y1 * ry);
          }
          ctx.bezierCurveTo(vals.x + curve.x2 * rx, vals.y + curve.y2 * ry, vals.x + curve.x3 * rx, vals.y + curve.y3 * ry, vals.x + curve.x4 * rx, vals.y + curve.y4 * ry);
        });
        ctx.stroke();
      }
    }
    return this;
  };
  p5.Graphics2D.prototype.ellipse = function (x, y, w, h) {
    var ctx = this.drawingContext;
    var doFill = this._pInst._doFill, doStroke = this._pInst._doStroke;
    if (doFill && !doStroke) {
      if (ctx.fillStyle === styleEmpty) {
        return this;
      }
    } else if (!doFill && doStroke) {
      if (ctx.strokeStyle === styleEmpty) {
        return this;
      }
    }
    var vals = canvas.modeAdjust(x, y, w, h, this._pInst._ellipseMode);
    var kappa = 0.5522848, ox = vals.w / 2 * kappa, oy = vals.h / 2 * kappa, xe = vals.x + vals.w, ye = vals.y + vals.h, xm = vals.x + vals.w / 2, ym = vals.y + vals.h / 2;
    ctx.beginPath();
    ctx.moveTo(vals.x, ym);
    ctx.bezierCurveTo(vals.x, ym - oy, xm - ox, vals.y, xm, vals.y);
    ctx.bezierCurveTo(xm + ox, vals.y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, vals.x, ym + oy, vals.x, ym);
    ctx.closePath();
    if (doFill) {
      ctx.fill();
    }
    if (doStroke) {
      ctx.stroke();
    }
  };
  p5.Graphics2D.prototype.line = function (x1, y1, x2, y2) {
    var ctx = this.drawingContext;
    if (!this._pInst._doStroke) {
      return this;
    } else if (ctx.strokeStyle === styleEmpty) {
      return this;
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return this;
  };
  p5.Graphics2D.prototype.point = function (x, y) {
    var ctx = this.drawingContext;
    var s = ctx.strokeStyle;
    var f = ctx.fillStyle;
    if (!this._pInst._doStroke) {
      return this;
    } else if (ctx.strokeStyle === styleEmpty) {
      return this;
    }
    x = Math.round(x);
    y = Math.round(y);
    ctx.fillStyle = s;
    if (ctx.lineWidth > 1) {
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, constants.TWO_PI, false);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.fillStyle = f;
  };
  p5.Graphics2D.prototype.quad = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    var ctx = this.drawingContext;
    var doFill = this._pInst._doFill, doStroke = this._pInst._doStroke;
    if (doFill && !doStroke) {
      if (ctx.fillStyle === styleEmpty) {
        return this;
      }
    } else if (!doFill && doStroke) {
      if (ctx.strokeStyle === styleEmpty) {
        return this;
      }
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    if (doFill) {
      ctx.fill();
    }
    if (doStroke) {
      ctx.stroke();
    }
    return this;
  };
  p5.Graphics2D.prototype.rect = function (x, y, w, h, tl, tr, br, bl) {
    var ctx = this.drawingContext;
    var doFill = this._pInst._doFill, doStroke = this._pInst._doStroke;
    if (doFill && !doStroke) {
      if (ctx.fillStyle === styleEmpty) {
        return this;
      }
    } else if (!doFill && doStroke) {
      if (ctx.strokeStyle === styleEmpty) {
        return this;
      }
    }
    var vals = canvas.modeAdjust(x, y, w, h, this._pInst._rectMode);
    if (this._pInst._doStroke && ctx.lineWidth % 2 === 1) {
      ctx.translate(0.5, 0.5);
    }
    ctx.beginPath();
    if (typeof tl === 'undefined') {
      ctx.rect(vals.x, vals.y, vals.w, vals.h);
    } else {
      if (typeof tr === 'undefined') {
        tr = tl;
      }
      if (typeof br === 'undefined') {
        br = tr;
      }
      if (typeof bl === 'undefined') {
        bl = br;
      }
      var _x = vals.x;
      var _y = vals.y;
      var _w = vals.w;
      var _h = vals.h;
      var hw = _w / 2;
      var hh = _h / 2;
      if (_w < 2 * tl) {
        tl = hw;
      }
      if (_h < 2 * tl) {
        tl = hh;
      }
      if (_w < 2 * tr) {
        tr = hw;
      }
      if (_h < 2 * tr) {
        tr = hh;
      }
      if (_w < 2 * br) {
        br = hw;
      }
      if (_h < 2 * br) {
        br = hh;
      }
      if (_w < 2 * bl) {
        bl = hw;
      }
      if (_h < 2 * bl) {
        bl = hh;
      }
      ctx.beginPath();
      ctx.moveTo(_x + tl, _y);
      ctx.arcTo(_x + _w, _y, _x + _w, _y + _h, tr);
      ctx.arcTo(_x + _w, _y + _h, _x, _y + _h, br);
      ctx.arcTo(_x, _y + _h, _x, _y, bl);
      ctx.arcTo(_x, _y, _x + _w, _y, tl);
      ctx.closePath();
    }
    if (this._pInst._doFill) {
      ctx.fill();
    }
    if (this._pInst._doStroke) {
      ctx.stroke();
    }
    if (this._pInst._doStroke && ctx.lineWidth % 2 === 1) {
      ctx.translate(-0.5, -0.5);
    }
    return this;
  };
  p5.Graphics2D.prototype.triangle = function (x1, y1, x2, y2, x3, y3) {
    var ctx = this.drawingContext;
    var doFill = this._pInst._doFill, doStroke = this._pInst._doStroke;
    if (doFill && !doStroke) {
      if (ctx.fillStyle === styleEmpty) {
        return this;
      }
    } else if (!doFill && doStroke) {
      if (ctx.strokeStyle === styleEmpty) {
        return this;
      }
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    if (doFill) {
      ctx.fill();
    }
    if (doStroke) {
      ctx.stroke();
    }
  };
  p5.Graphics2D.prototype.endShape = function (mode, vertices, isCurve, isBezier, isQuadratic, isContour, shapeKind) {
    if (vertices.length === 0) {
      return this;
    }
    if (!this._pInst._doStroke && !this._pInst._doFill) {
      return this;
    }
    var closeShape = mode === constants.CLOSE;
    var v;
    if (closeShape && !isContour) {
      vertices.push(vertices[0]);
    }
    var i, j;
    var numVerts = vertices.length;
    if (isCurve && (shapeKind === constants.POLYGON || shapeKind === null)) {
      if (numVerts > 3) {
        var b = [], s = 1 - this._pInst._curveTightness;
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(vertices[1][0], vertices[1][1]);
        for (i = 1; i + 2 < numVerts; i++) {
          v = vertices[i];
          b[0] = [
            v[0],
            v[1]
          ];
          b[1] = [
            v[0] + (s * vertices[i + 1][0] - s * vertices[i - 1][0]) / 6,
            v[1] + (s * vertices[i + 1][1] - s * vertices[i - 1][1]) / 6
          ];
          b[2] = [
            vertices[i + 1][0] + (s * vertices[i][0] - s * vertices[i + 2][0]) / 6,
            vertices[i + 1][1] + (s * vertices[i][1] - s * vertices[i + 2][1]) / 6
          ];
          b[3] = [
            vertices[i + 1][0],
            vertices[i + 1][1]
          ];
          this.drawingContext.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
        }
        if (closeShape) {
          this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
        }
        this._doFillStrokeClose();
      }
    } else if (isBezier && (shapeKind === constants.POLYGON || shapeKind === null)) {
      this.drawingContext.beginPath();
      for (i = 0; i < numVerts; i++) {
        if (vertices[i].isVert) {
          if (vertices[i].moveTo) {
            this.drawingContext.moveTo(vertices[i][0], vertices[i][1]);
          } else {
            this.drawingContext.lineTo(vertices[i][0], vertices[i][1]);
          }
        } else {
          this.drawingContext.bezierCurveTo(vertices[i][0], vertices[i][1], vertices[i][2], vertices[i][3], vertices[i][4], vertices[i][5]);
        }
      }
      this._doFillStrokeClose();
    } else if (isQuadratic && (shapeKind === constants.POLYGON || shapeKind === null)) {
      this.drawingContext.beginPath();
      for (i = 0; i < numVerts; i++) {
        if (vertices[i].isVert) {
          if (vertices[i].moveTo) {
            this.drawingContext.moveTo([0], vertices[i][1]);
          } else {
            this.drawingContext.lineTo(vertices[i][0], vertices[i][1]);
          }
        } else {
          this.drawingContext.quadraticCurveTo(vertices[i][0], vertices[i][1], vertices[i][2], vertices[i][3]);
        }
      }
      this._doFillStrokeClose();
    } else {
      if (shapeKind === constants.POINTS) {
        for (i = 0; i < numVerts; i++) {
          v = vertices[i];
          if (this._pInst._doStroke) {
            this._pInst.stroke(v[6]);
          }
          this._pInst.point(v[0], v[1]);
        }
      } else if (shapeKind === constants.LINES) {
        for (i = 0; i + 1 < numVerts; i += 2) {
          v = vertices[i];
          if (this._pInst._doStroke) {
            this._pInst.stroke(vertices[i + 1][6]);
          }
          this._pInst.line(v[0], v[1], vertices[i + 1][0], vertices[i + 1][1]);
        }
      } else if (shapeKind === constants.TRIANGLES) {
        for (i = 0; i + 2 < numVerts; i += 3) {
          v = vertices[i];
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(v[0], v[1]);
          this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
          this.drawingContext.lineTo(vertices[i + 2][0], vertices[i + 2][1]);
          this.drawingContext.lineTo(v[0], v[1]);
          if (this._pInst._doFill) {
            this._pInst.fill(vertices[i + 2][5]);
            this.drawingContext.fill();
          }
          if (this._pInst._doStroke) {
            this._pInst.stroke(vertices[i + 2][6]);
            this.drawingContext.stroke();
          }
          this.drawingContext.closePath();
        }
      } else if (shapeKind === constants.TRIANGLE_STRIP) {
        for (i = 0; i + 1 < numVerts; i++) {
          v = vertices[i];
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(vertices[i + 1][0], vertices[i + 1][1]);
          this.drawingContext.lineTo(v[0], v[1]);
          if (this._pInst._doStroke) {
            this._pInst.stroke(vertices[i + 1][6]);
          }
          if (this._pInst._doFill) {
            this._pInst.fill(vertices[i + 1][5]);
          }
          if (i + 2 < numVerts) {
            this.drawingContext.lineTo(vertices[i + 2][0], vertices[i + 2][1]);
            if (this._pInst._doStroke) {
              this._pInst.stroke(vertices[i + 2][6]);
            }
            if (this._pInst._doFill) {
              this._pInst.fill(vertices[i + 2][5]);
            }
          }
          this._doFillStrokeClose();
        }
      } else if (shapeKind === constants.TRIANGLE_FAN) {
        if (numVerts > 2) {
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(vertices[0][0], vertices[0][1]);
          this.drawingContext.lineTo(vertices[1][0], vertices[1][1]);
          this.drawingContext.lineTo(vertices[2][0], vertices[2][1]);
          if (this._pInst._doFill) {
            this._pInst.fill(vertices[2][5]);
          }
          if (this._pInst._doStroke) {
            this._pInst.stroke(vertices[2][6]);
          }
          this._doFillStrokeClose();
          for (i = 3; i < numVerts; i++) {
            v = vertices[i];
            this.drawingContext.beginPath();
            this.drawingContext.moveTo(vertices[0][0], vertices[0][1]);
            this.drawingContext.lineTo(vertices[i - 1][0], vertices[i - 1][1]);
            this.drawingContext.lineTo(v[0], v[1]);
            if (this._pInst._doFill) {
              this._pInst.fill(v[5]);
            }
            if (this._pInst._doStroke) {
              this._pInst.stroke(v[6]);
            }
            this._doFillStrokeClose();
          }
        }
      } else if (shapeKind === constants.QUADS) {
        for (i = 0; i + 3 < numVerts; i += 4) {
          v = vertices[i];
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(v[0], v[1]);
          for (j = 1; j < 4; j++) {
            this.drawingContext.lineTo(vertices[i + j][0], vertices[i + j][1]);
          }
          this.drawingContext.lineTo(v[0], v[1]);
          if (this._pInst._doFill) {
            this._pInst.fill(vertices[i + 3][5]);
          }
          if (this._pInst._doStroke) {
            this._pInst.stroke(vertices[i + 3][6]);
          }
          this._doFillStrokeClose();
        }
      } else if (shapeKind === constants.QUAD_STRIP) {
        if (numVerts > 3) {
          for (i = 0; i + 1 < numVerts; i += 2) {
            v = vertices[i];
            this.drawingContext.beginPath();
            if (i + 3 < numVerts) {
              this.drawingContext.moveTo(vertices[i + 2][0], vertices[i + 2][1]);
              this.drawingContext.lineTo(v[0], v[1]);
              this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
              this.drawingContext.lineTo(vertices[i + 3][0], vertices[i + 3][1]);
              if (this._pInst._doFill) {
                this._pInst.fill(vertices[i + 3][5]);
              }
              if (this._pInst._doStroke) {
                this._pInst.stroke(vertices[i + 3][6]);
              }
            } else {
              this.drawingContext.moveTo(v[0], v[1]);
              this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
            }
            this._doFillStrokeClose();
          }
        }
      } else {
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(vertices[0][0], vertices[0][1]);
        for (i = 1; i < numVerts; i++) {
          v = vertices[i];
          if (v.isVert) {
            if (v.moveTo) {
              this.drawingContext.moveTo(v[0], v[1]);
            } else {
              this.drawingContext.lineTo(v[0], v[1]);
            }
          }
        }
        this._doFillStrokeClose();
      }
    }
    isCurve = false;
    isBezier = false;
    isQuadratic = false;
    isContour = false;
    if (closeShape) {
      vertices.pop();
    }
    return this;
  };
  p5.Graphics2D.prototype.noSmooth = function () {
    this.drawingContext.mozImageSmoothingEnabled = false;
    this.drawingContext.webkitImageSmoothingEnabled = false;
    return this;
  };
  p5.Graphics2D.prototype.smooth = function () {
    this.drawingContext.mozImageSmoothingEnabled = true;
    this.drawingContext.webkitImageSmoothingEnabled = true;
    return this;
  };
  p5.Graphics2D.prototype.strokeCap = function (cap) {
    if (cap === constants.ROUND || cap === constants.SQUARE || cap === constants.PROJECT) {
      this.drawingContext.lineCap = cap;
    }
    return this;
  };
  p5.Graphics2D.prototype.strokeJoin = function (join) {
    if (join === constants.ROUND || join === constants.BEVEL || join === constants.MITER) {
      this.drawingContext.lineJoin = join;
    }
    return this;
  };
  p5.Graphics2D.prototype.strokeWeight = function (w) {
    if (typeof w === 'undefined' || w === 0) {
      this.drawingContext.lineWidth = 0.0001;
    } else {
      this.drawingContext.lineWidth = w;
    }
    return this;
  };
  p5.Graphics2D.prototype._getFill = function () {
    return this.drawingContext.fillStyle;
  };
  p5.Graphics2D.prototype._getStroke = function () {
    return this.drawingContext.strokeStyle;
  };
  p5.Graphics2D.prototype.bezier = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    this._pInst.beginShape();
    this._pInst.vertex(x1, y1);
    this._pInst.bezierVertex(x2, y2, x3, y3, x4, y4);
    this._pInst.endShape();
    return this;
  };
  p5.Graphics2D.prototype.curve = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    this._pInst.beginShape();
    this._pInst.curveVertex(x1, y1);
    this._pInst.curveVertex(x2, y2);
    this._pInst.curveVertex(x3, y3);
    this._pInst.curveVertex(x4, y4);
    this._pInst.endShape();
    return this;
  };
  p5.Graphics2D.prototype._doFillStrokeClose = function () {
    if (this._pInst._doFill) {
      this.drawingContext.fill();
    }
    if (this._pInst._doStroke) {
      this.drawingContext.stroke();
    }
    this.drawingContext.closePath();
  };
  p5.Graphics2D.prototype.applyMatrix = function (n00, n01, n02, n10, n11, n12) {
    this.drawingContext.transform(n00, n01, n02, n10, n11, n12);
  };
  p5.Graphics2D.prototype.resetMatrix = function () {
    this.drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    return this;
  };
  p5.Graphics2D.prototype.rotate = function (r) {
    this.drawingContext.rotate(r);
  };
  p5.Graphics2D.prototype.scale = function () {
    var x = 1, y = 1;
    if (arguments.length === 1) {
      x = y = arguments[0];
    } else {
      x = arguments[0];
      y = arguments[1];
    }
    this.drawingContext.scale(x, y);
    return this;
  };
  p5.Graphics2D.prototype.shearX = function (angle) {
    if (this._pInst._angleMode === constants.DEGREES) {
      angle = this._pInst.radians(angle);
    }
    this.drawingContext.transform(1, 0, this._pInst.tan(angle), 1, 0, 0);
    return this;
  };
  p5.Graphics2D.prototype.shearY = function (angle) {
    if (this._pInst._angleMode === constants.DEGREES) {
      angle = this._pInst.radians(angle);
    }
    this.drawingContext.transform(1, this._pInst.tan(angle), 0, 1, 0, 0);
    return this;
  };
  p5.Graphics2D.prototype.translate = function (x, y) {
    this.drawingContext.translate(x, y);
    return this;
  };
  p5.Graphics2D.prototype.text = function (str, x, y, maxWidth, maxHeight) {
    if (typeof str !== 'string') {
      str = str.toString();
    }
    if (typeof maxWidth !== 'undefined') {
      y += this._pInst._textLeading;
      maxHeight += y;
    }
    str = str.replace(/(\t)/g, '  ');
    var cars = str.split('\n');
    for (var ii = 0; ii < cars.length; ii++) {
      var line = '';
      var words = cars[ii].split(' ');
      for (var n = 0; n < words.length; n++) {
        if (y + this._pInst._textLeading <= maxHeight || typeof maxHeight === 'undefined') {
          var testLine = line + words[n] + ' ';
          var metrics = this.drawingContext.measureText(testLine);
          var testWidth = metrics.width;
          if (typeof maxWidth !== 'undefined' && testWidth > maxWidth) {
            if (this._pInst._doFill) {
              this.drawingContext.fillText(line, x, y);
            }
            if (this._pInst._doStroke) {
              this._pInst.drawingContext.strokeText(line, x, y);
            }
            line = words[n] + ' ';
            y += this._pInst._textLeading;
          } else {
            line = testLine;
          }
        }
      }
      if (this._pInst._doFill) {
        this.drawingContext.fillText(line, x, y);
      }
      if (this._pInst._doStroke) {
        this.drawingContext.strokeText(line, x, y);
      }
      y += this._pInst._textLeading;
    }
  };
  p5.Graphics2D.prototype.textWidth = function (s) {
    return this.drawingContext.measureText(s).width;
  };
  p5.Graphics2D.prototype.textAlign = function (h, v) {
    if (h === constants.LEFT || h === constants.RIGHT || h === constants.CENTER) {
      this.drawingContext.textAlign = h;
    }
    if (v === constants.TOP || v === constants.BOTTOM || v === constants.CENTER || v === constants.BASELINE) {
      this.drawingContext.textBaseline = v;
    }
  };
  p5.Graphics2D.prototype._applyTextProperties = function (textStyle, textSize, textFont) {
    var str = textStyle + ' ' + textSize + 'px ' + textFont;
    this.drawingContext.font = str;
  };
  p5.Graphics2D.prototype.push = function () {
    this.drawingContext.save();
  };
  p5.Graphics2D.prototype.pop = function () {
    this.drawingContext.restore();
  };
  return p5.Graphics2D;
}({}, amdclean['core'], amdclean['canvas'], amdclean['constants'], amdclean['filters'], amdclean['p5Graphics']);
amdclean['shaders'] = function (require) {
  return {
    defaultVertShader: [
      'attribute vec3 a_VertexPosition;',
      'uniform mat4 uMVMatrix;',
      'uniform mat4 uPMatrix;',
      'void main(void) {',
      'vec3 zeroToOne = a_VertexPosition / 1000.0;',
      'vec3 zeroToTwo = zeroToOne * 2.0;',
      'vec3 clipSpace = zeroToTwo - 1.0;',
      'gl_Position = uPMatrix*uMVMatrix*vec4(clipSpace*vec3(1, -1, 1), 1.0);',
      '}'
    ].join('\n'),
    defaultMatFragShader: [
      'precision mediump float;',
      'uniform vec4 u_MaterialColor;',
      'void main(void) {',
      'gl_FragColor = u_MaterialColor;',
      '}'
    ].join('\n')
  };
}({});
amdclean['mat4'] = function (require) {
  var GLMAT_EPSILON = 0.000001;
  var GLMAT_ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
  var mat4 = {};
  mat4.create = function () {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  };
  mat4.clone = function (a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  };
  mat4.copy = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  };
  mat4.identity = function (out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  };
  mat4.transpose = function (out, a) {
    if (out === a) {
      var a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }
    return out;
  };
  mat4.invert = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  };
  mat4.adjoint = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
    out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
    out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
    out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
    out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
    out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
    return out;
  };
  mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  };
  mat4.mul = mat4.multiply;
  mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return out;
  };
  mat4.scale = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2];
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  };
  mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z), s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
    if (Math.abs(len) < GLMAT_EPSILON) {
      return null;
    }
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
    if (a !== out) {
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  };
  mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad), c = Math.cos(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    if (a !== out) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
  };
  mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    if (a !== out) {
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
  };
  mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    if (a !== out) {
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
  };
  mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left), tb = 1 / (top - bottom), nf = 1 / (near - far);
    out[0] = near * 2 * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = near * 2 * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near * 2 * nf;
    out[15] = 0;
    return out;
  };
  mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
  };
  mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  };
  return mat4;
}({});
amdclean['p5Graphics3D'] = function (require, core, shaders, p5Graphics, mat4) {
  var p5 = core;
  var shaders = shaders;
  var mat4 = mat4;
  var gl, shaderProgram;
  var mvMatrix;
  var pMatrix;
  var mvMatrixStack = [];
  var attributes = {
      alpha: false,
      depth: true,
      stencil: true,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    };
  p5.Graphics3D = function (elt, pInst, isMainCanvas) {
    p5.Graphics.call(this, elt, pInst, isMainCanvas);
    try {
      this.drawingContext = this.canvas.getContext('webgl', attributes) || this.canvas.getContext('experimental-webgl', attributes);
      if (this.drawingContext === null) {
        throw 'Error creating webgl context';
      } else {
        console.log('p5.Graphics3d: enabled webgl context');
      }
    } catch (er) {
      console.error(er);
    }
    this._pInst._setProperty('_graphics', this);
    this.isP3D = true;
    gl = this.drawingContext;
    gl.clearColor(1, 1, 1, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, this.width * this._pInst.pixelDensity, this.height * this._pInst.pixelDensity);
    this.initShaders();
    this.initMatrix();
    return this;
  };
  p5.Graphics3D.prototype = Object.create(p5.Graphics.prototype);
  p5.Graphics3D.prototype.initShaders = function () {
    var _vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(_vertShader, shaders.defaultVertShader);
    gl.compileShader(_vertShader);
    if (!gl.getShaderParameter(_vertShader, gl.COMPILE_STATUS)) {
      alert('Yikes! An error occurred compiling the shaders:' + gl.getShaderInfoLog(_vertShader));
      return null;
    }
    var _fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(_fragShader, shaders.defaultMatFragShader);
    gl.compileShader(_fragShader);
    if (!gl.getShaderParameter(_fragShader, gl.COMPILE_STATUS)) {
      alert('Darn! An error occurred compiling the shaders:' + gl.getShaderInfoLog(_fragShader));
      return null;
    }
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, _vertShader);
    gl.attachShader(shaderProgram, _fragShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Snap! Error linking shader program');
    }
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'a_VertexPosition');
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
    shaderProgram.uMaterialColorLoc = gl.getUniformLocation(shaderProgram, 'u_MaterialColor');
    gl.uniform4f(shaderProgram.uMaterialColorLoc, 1, 1, 1, 1);
  };
  p5.Graphics3D.prototype.initMatrix = function () {
    mvMatrix = mat4.create();
    pMatrix = mat4.create();
    mat4.perspective(pMatrix, 60 / 180 * Math.PI, this.width / this.height, 0.1, 100);
  };
  p5.Graphics3D.prototype.resetMatrix = function () {
    mat4.identity(mvMatrix);
  };
  p5.Graphics3D.prototype.background = function () {
    var _col = this._pInst.color.apply(this._pInst, arguments);
    var _r = _col.color_array[0] / 255;
    var _g = _col.color_array[1] / 255;
    var _b = _col.color_array[2] / 255;
    var _a = _col.color_array[3] / 255;
    gl.clearColor(_r, _g, _b, _a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };
  p5.Graphics3D.prototype.stroke = function () {
    this._stroke = this._pInst.color.apply(this._pInst, arguments);
  };
  p5.Graphics3D.prototype.drawGeometry = function (vertices) {
    var geomVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geomVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    _setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    return this;
  };
  p5.Graphics3D.prototype.translate = function (x, y, z) {
    mat4.translate(mvMatrix, mvMatrix, [
      x,
      y,
      z
    ]);
    return this;
  };
  p5.Graphics3D.prototype.scale = function (x, y, z) {
    mat4.scale(mvMatrix, mvMatrix, [
      x,
      y,
      z
    ]);
    return this;
  };
  p5.Graphics3D.prototype.rotateX = function (rad) {
    mat4.rotateX(mvMatrix, mvMatrix, rad);
    return this;
  };
  p5.Graphics3D.prototype.rotateY = function (rad) {
    mat4.rotateY(mvMatrix, mvMatrix, rad);
    return this;
  };
  p5.Graphics3D.prototype.rotateZ = function (rad) {
    mat4.rotateZ(mvMatrix, mvMatrix, rad);
    return this;
  };
  p5.Graphics3D.prototype.push = function () {
    var copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
  };
  p5.Graphics3D.prototype.pop = function () {
    if (mvMatrixStack.length === 0) {
      throw 'Invalid popMatrix!';
    }
    mvMatrix = mvMatrixStack.pop();
  };
  function _setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  }
  return p5.Graphics3D;
}({}, amdclean['core'], amdclean['shaders'], amdclean['p5Graphics'], amdclean['mat4']);
amdclean['p5Image'] = function (require, core, filters) {
  'use strict';
  var p5 = core;
  var Filters = filters;
  p5.Image = function (width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.drawingContext = this.canvas.getContext('2d');
    this.pixelDensity = 1;
    this.pixels = [];
  };
  p5.Image.prototype._setProperty = function (prop, value) {
    this[prop] = value;
  };
  p5.Image.prototype.loadPixels = function () {
    p5.Graphics2D.prototype.loadPixels.call(this);
  };
  p5.Image.prototype.updatePixels = function (x, y, w, h) {
    p5.Graphics2D.prototype.updatePixels.call(this, x, y, w, h);
  };
  p5.Image.prototype.get = function (x, y, w, h) {
    return p5.Graphics2D.prototype.get.call(this, x, y, w, h);
  };
  p5.Image.prototype.set = function (x, y, imgOrCol) {
    p5.Graphics2D.prototype.set.call(this, x, y, imgOrCol);
  };
  p5.Image.prototype.resize = function (width, height) {
    width = width || this.canvas.width;
    height = height || this.canvas.height;
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, tempCanvas.width, tempCanvas.height);
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.drawingContext.drawImage(tempCanvas, 0, 0, width, height, 0, 0, width, height);
    if (this.pixels.length > 0) {
      this.loadPixels();
    }
  };
  p5.Image.prototype.copy = function () {
    p5.prototype.copy.apply(this, arguments);
  };
  p5.Image.prototype.mask = function (p5Image) {
    if (p5Image === undefined) {
      p5Image = this;
    }
    var currBlend = this.drawingContext.globalCompositeOperation;
    var scaleFactor = 1;
    if (p5Image instanceof p5.Graphics) {
      scaleFactor = p5Image._pInst.pixelDensity;
    }
    var copyArgs = [
        p5Image,
        0,
        0,
        scaleFactor * p5Image.width,
        scaleFactor * p5Image.height,
        0,
        0,
        this.width,
        this.height
      ];
    this.drawingContext.globalCompositeOperation = 'destination-in';
    this.copy.apply(this, copyArgs);
    this.drawingContext.globalCompositeOperation = currBlend;
  };
  p5.Image.prototype.filter = function (operation, value) {
    Filters.apply(this.canvas, Filters[operation.toLowerCase()], value);
  };
  p5.Image.prototype.blend = function () {
    p5.prototype.blend.apply(this, arguments);
  };
  p5.Image.prototype.save = function (filename, extension) {
    var mimeType;
    if (!extension) {
      extension = 'png';
      mimeType = 'image/png';
    } else {
      switch (extension.toLowerCase()) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      default:
        mimeType = 'image/png';
        break;
      }
    }
    var downloadMime = 'image/octet-stream';
    var imageData = this.canvas.toDataURL(mimeType);
    imageData = imageData.replace(mimeType, downloadMime);
    p5.prototype.downloadFile(imageData, filename, extension);
  };
  return p5.Image;
}({}, amdclean['core'], amdclean['filters']);
amdclean['polargeometry'] = function (require) {
  return {
    degreesToRadians: function (x) {
      return 2 * Math.PI * x / 360;
    },
    radiansToDegrees: function (x) {
      return 360 * x / (2 * Math.PI);
    }
  };
}({});
amdclean['p5Vector'] = function (require, core, polargeometry, constants) {
  'use strict';
  var p5 = core;
  var polarGeometry = polargeometry;
  var constants = constants;
  p5.Vector = function () {
    var x, y, z;
    if (arguments[0] instanceof p5) {
      this.p5 = arguments[0];
      x = arguments[1][0] || 0;
      y = arguments[1][1] || 0;
      z = arguments[1][2] || 0;
    } else {
      x = arguments[0] || 0;
      y = arguments[1] || 0;
      z = arguments[2] || 0;
    }
    this.x = x;
    this.y = y;
    this.z = z;
  };
  p5.Vector.prototype.set = function (x, y, z) {
    if (x instanceof p5.Vector) {
      this.x = x.x || 0;
      this.y = x.y || 0;
      this.z = x.z || 0;
      return this;
    }
    if (x instanceof Array) {
      this.x = x[0] || 0;
      this.y = x[1] || 0;
      this.z = x[2] || 0;
      return this;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    return this;
  };
  p5.Vector.prototype.copy = function () {
    if (this.p5) {
      return new p5.Vector(this.p5, [
        this.x,
        this.y,
        this.z
      ]);
    } else {
      return new p5.Vector(this.x, this.y, this.z);
    }
  };
  p5.Vector.prototype.add = function (x, y, z) {
    if (x instanceof p5.Vector) {
      this.x += x.x || 0;
      this.y += x.y || 0;
      this.z += x.z || 0;
      return this;
    }
    if (x instanceof Array) {
      this.x += x[0] || 0;
      this.y += x[1] || 0;
      this.z += x[2] || 0;
      return this;
    }
    this.x += x || 0;
    this.y += y || 0;
    this.z += z || 0;
    return this;
  };
  p5.Vector.prototype.sub = function (x, y, z) {
    if (x instanceof p5.Vector) {
      this.x -= x.x || 0;
      this.y -= x.y || 0;
      this.z -= x.z || 0;
      return this;
    }
    if (x instanceof Array) {
      this.x -= x[0] || 0;
      this.y -= x[1] || 0;
      this.z -= x[2] || 0;
      return this;
    }
    this.x -= x || 0;
    this.y -= y || 0;
    this.z -= z || 0;
    return this;
  };
  p5.Vector.prototype.mult = function (n) {
    this.x *= n || 0;
    this.y *= n || 0;
    this.z *= n || 0;
    return this;
  };
  p5.Vector.prototype.div = function (n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
    return this;
  };
  p5.Vector.prototype.mag = function () {
    return Math.sqrt(this.magSq());
  };
  p5.Vector.prototype.magSq = function () {
    var x = this.x, y = this.y, z = this.z;
    return x * x + y * y + z * z;
  };
  p5.Vector.prototype.dot = function (x, y, z) {
    if (x instanceof p5.Vector) {
      return this.dot(x.x, x.y, x.z);
    }
    return this.x * (x || 0) + this.y * (y || 0) + this.z * (z || 0);
  };
  p5.Vector.prototype.cross = function (v) {
    var x = this.y * v.z - this.z * v.y;
    var y = this.z * v.x - this.x * v.z;
    var z = this.x * v.y - this.y * v.x;
    if (this.p5) {
      return new p5.Vector(this.p5, [
        x,
        y,
        z
      ]);
    } else {
      return new p5.Vector(x, y, z);
    }
  };
  p5.Vector.prototype.dist = function (v) {
    var d = v.copy().sub(this);
    return d.mag();
  };
  p5.Vector.prototype.normalize = function () {
    return this.div(this.mag());
  };
  p5.Vector.prototype.limit = function (l) {
    var mSq = this.magSq();
    if (mSq > l * l) {
      this.div(Math.sqrt(mSq));
      this.mult(l);
    }
    return this;
  };
  p5.Vector.prototype.setMag = function (n) {
    return this.normalize().mult(n);
  };
  p5.Vector.prototype.heading = function () {
    var h = Math.atan2(this.y, this.x);
    if (this.p5) {
      if (this.p5._angleMode === constants.RADIANS) {
        return h;
      } else {
        return polarGeometry.radiansToDegrees(h);
      }
    } else {
      return h;
    }
  };
  p5.Vector.prototype.rotate = function (a) {
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        a = polarGeometry.degreesToRadians(a);
      }
    }
    var newHeading = this.heading() + a;
    var mag = this.mag();
    this.x = Math.cos(newHeading) * mag;
    this.y = Math.sin(newHeading) * mag;
    return this;
  };
  p5.Vector.prototype.lerp = function (x, y, z, amt) {
    if (x instanceof p5.Vector) {
      return this.lerp(x.x, x.y, x.z, y);
    }
    this.x += (x - this.x) * amt || 0;
    this.y += (y - this.y) * amt || 0;
    this.z += (z - this.z) * amt || 0;
    return this;
  };
  p5.Vector.prototype.array = function () {
    return [
      this.x || 0,
      this.y || 0,
      this.z || 0
    ];
  };
  p5.Vector.prototype.equals = function (x, y, z) {
    if (x instanceof p5.Vector) {
      x = x.x || 0;
      y = x.y || 0;
      z = x.z || 0;
    } else if (x instanceof Array) {
      x = x[0] || 0;
      y = x[1] || 0;
      z = x[2] || 0;
    } else {
      x = x || 0;
      y = y || 0;
      z = z || 0;
    }
    return this.x === x && this.y === y && this.z === z;
  };
  p5.Vector.fromAngle = function (angle) {
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        angle = polarGeometry.degreesToRadians(angle);
      }
    }
    if (this.p5) {
      return new p5.Vector(this.p5, [
        Math.cos(angle),
        Math.sin(angle),
        0
      ]);
    } else {
      return new p5.Vector(Math.cos(angle), Math.sin(angle), 0);
    }
  };
  p5.Vector.random2D = function () {
    var angle;
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        angle = this.p5.random(360);
      } else {
        angle = this.p5.random(constants.TWO_PI);
      }
    } else {
      angle = Math.random() * Math.PI * 2;
    }
    return this.fromAngle(angle);
  };
  p5.Vector.random3D = function () {
    var angle, vz;
    if (this.p5) {
      angle = this.p5.random(0, constants.TWO_PI);
      vz = this.p5.random(-1, 1);
    } else {
      angle = Math.random() * Math.PI * 2;
      vz = Math.random() * 2 - 1;
    }
    var vx = Math.sqrt(1 - vz * vz) * Math.cos(angle);
    var vy = Math.sqrt(1 - vz * vz) * Math.sin(angle);
    if (this.p5) {
      return new p5.Vector(this.p5, [
        vx,
        vy,
        vz
      ]);
    } else {
      return new p5.Vector(vx, vy, vz);
    }
  };
  p5.Vector.add = function (v1, v2, target) {
    if (!target) {
      target = v1.copy();
    } else {
      target.set(v1);
    }
    target.add(v2);
    return target;
  };
  p5.Vector.sub = function (v1, v2, target) {
    if (!target) {
      target = v1.copy();
    } else {
      target.set(v1);
    }
    target.sub(v2);
    return target;
  };
  p5.Vector.mult = function (v, n, target) {
    if (!target) {
      target = v.copy();
    } else {
      target.set(v);
    }
    target.mult(n);
    return target;
  };
  p5.Vector.div = function (v, n, target) {
    if (!target) {
      target = v.copy();
    } else {
      target.set(v);
    }
    target.div(n);
    return target;
  };
  p5.Vector.dot = function (v1, v2) {
    return v1.dot(v2);
  };
  p5.Vector.cross = function (v1, v2) {
    return v1.cross(v2);
  };
  p5.Vector.dist = function (v1, v2) {
    return v1.dist(v2);
  };
  p5.Vector.lerp = function (v1, v2, amt, target) {
    if (!target) {
      target = v1.copy();
    } else {
      target.set(v1);
    }
    target.lerp(v2, amt);
    return target;
  };
  p5.Vector.angleBetween = function (v1, v2) {
    var angle = Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        angle = polarGeometry.radiansToDegrees(angle);
      }
    }
    return angle;
  };
  return p5.Vector;
}({}, amdclean['core'], amdclean['polargeometry'], amdclean['constants']);
amdclean['p5TableRow'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.TableRow = function (str, separator) {
    var arr = [];
    var obj = {};
    if (str) {
      separator = separator || ',';
      arr = str.split(separator);
    }
    for (var i = 0; i < arr.length; i++) {
      var key = i;
      var val = arr[i];
      obj[key] = val;
    }
    this.arr = arr;
    this.obj = obj;
    this.table = null;
  };
  p5.TableRow.prototype.set = function (column, value) {
    if (typeof column === 'string') {
      var cPos = this.table.columns.indexOf(column);
      if (cPos >= 0) {
        this.obj[column] = value;
        this.arr[cPos] = value;
      } else {
        throw 'This table has no column named "' + column + '"';
      }
    } else {
      if (column < this.table.columns.length) {
        this.arr[column] = value;
        var cTitle = this.table.columns[column];
        this.obj[cTitle] = value;
      } else {
        throw 'Column #' + column + ' is out of the range of this table';
      }
    }
  };
  p5.TableRow.prototype.setNum = function (column, value) {
    var floatVal = parseFloat(value, 10);
    this.set(column, floatVal);
  };
  p5.TableRow.prototype.setString = function (column, value) {
    var stringVal = value.toString();
    this.set(column, stringVal);
  };
  p5.TableRow.prototype.get = function (column) {
    if (typeof column === 'string') {
      return this.obj[column];
    } else {
      return this.arr[column];
    }
  };
  p5.TableRow.prototype.getNum = function (column) {
    var ret;
    if (typeof column === 'string') {
      ret = parseFloat(this.obj[column], 10);
    } else {
      ret = parseFloat(this.arr[column], 10);
    }
    if (ret.toString() === 'NaN') {
      throw 'Error: ' + this.obj[column] + ' is NaN (Not a Number)';
    }
    return ret;
  };
  p5.TableRow.prototype.getString = function (column) {
    if (typeof column === 'string') {
      return this.obj[column].toString();
    } else {
      return this.arr[column].toString();
    }
  };
  return p5.TableRow;
}({}, amdclean['core']);
amdclean['p5Table'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.Table = function (rows) {
    this.columns = [];
    this.rows = [];
  };
  p5.Table.prototype.addRow = function (row) {
    var r = row || new p5.TableRow();
    if (typeof r.arr === 'undefined' || typeof r.obj === 'undefined') {
      throw 'invalid TableRow: ' + r;
    }
    r.table = this;
    this.rows.push(r);
    return r;
  };
  p5.Table.prototype.removeRow = function (id) {
    this.rows[id].table = null;
    var chunk = this.rows.splice(id + 1, this.rows.length);
    this.rows.pop();
    this.rows = this.rows.concat(chunk);
  };
  p5.Table.prototype.getRow = function (r) {
    return this.rows[r];
  };
  p5.Table.prototype.getRows = function () {
    return this.rows;
  };
  p5.Table.prototype.findRow = function (value, column) {
    if (typeof column === 'string') {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column] === value) {
          return this.rows[i];
        }
      }
    } else {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column] === value) {
          return this.rows[j];
        }
      }
    }
    return null;
  };
  p5.Table.prototype.findRows = function (value, column) {
    var ret = [];
    if (typeof column === 'string') {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column] === value) {
          ret.push(this.rows[i]);
        }
      }
    } else {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column] === value) {
          ret.push(this.rows[j]);
        }
      }
    }
    return ret;
  };
  p5.Table.prototype.matchRow = function (regexp, column) {
    if (typeof column === 'number') {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column].match(regexp)) {
          return this.rows[j];
        }
      }
    } else {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column].match(regexp)) {
          return this.rows[i];
        }
      }
    }
    return null;
  };
  p5.Table.prototype.matchRows = function (regexp, column) {
    var ret = [];
    if (typeof column === 'number') {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column].match(regexp)) {
          ret.push(this.rows[j]);
        }
      }
    } else {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column].match(regexp)) {
          ret.push(this.rows[i]);
        }
      }
    }
    return ret;
  };
  p5.Table.prototype.getColumn = function (value) {
    var ret = [];
    if (typeof value === 'string') {
      for (var i = 0; i < this.rows.length; i++) {
        ret.push(this.rows[i].obj[value]);
      }
    } else {
      for (var j = 0; j < this.rows.length; j++) {
        ret.push(this.rows[j].arr[value]);
      }
    }
    return ret;
  };
  p5.Table.prototype.clearRows = function () {
    delete this.rows;
    this.rows = [];
  };
  p5.Table.prototype.addColumn = function (title) {
    var t = title || null;
    this.columns.push(t);
  };
  p5.Table.prototype.getColumnCount = function () {
    return this.columns.length;
  };
  p5.Table.prototype.getRowCount = function () {
    return this.rows.length;
  };
  p5.Table.prototype.removeTokens = function (chars, column) {
    var escape = function (s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    var charArray = [];
    for (var i = 0; i < chars.length; i++) {
      charArray.push(escape(chars.charAt(i)));
    }
    var regex = new RegExp(charArray.join('|'), 'g');
    if (typeof column === 'undefined') {
      for (var c = 0; c < this.columns.length; c++) {
        for (var d = 0; d < this.rows.length; d++) {
          var s = this.rows[d].arr[c];
          s = s.replace(regex, '');
          this.rows[d].arr[c] = s;
          this.rows[d].obj[this.columns[c]] = s;
        }
      }
    } else if (typeof column === 'string') {
      for (var j = 0; j < this.rows.length; j++) {
        var val = this.rows[j].obj[column];
        val = val.replace(regex, '');
        this.rows[j].obj[column] = val;
        var pos = this.columns.indexOf(column);
        this.rows[j].arr[pos] = val;
      }
    } else {
      for (var k = 0; k < this.rows.length; k++) {
        var str = this.rows[k].arr[column];
        str = str.replace(regex, '');
        this.rows[k].arr[column] = str;
        this.rows[k].obj[this.columns[column]] = str;
      }
    }
  };
  p5.Table.prototype.trim = function (column) {
    var regex = new RegExp(' ', 'g');
    if (typeof column === 'undefined') {
      for (var c = 0; c < this.columns.length; c++) {
        for (var d = 0; d < this.rows.length; d++) {
          var s = this.rows[d].arr[c];
          s = s.replace(regex, '');
          this.rows[d].arr[c] = s;
          this.rows[d].obj[this.columns[c]] = s;
        }
      }
    } else if (typeof column === 'string') {
      for (var j = 0; j < this.rows.length; j++) {
        var val = this.rows[j].obj[column];
        val = val.replace(regex, '');
        this.rows[j].obj[column] = val;
        var pos = this.columns.indexOf(column);
        this.rows[j].arr[pos] = val;
      }
    } else {
      for (var k = 0; k < this.rows.length; k++) {
        var str = this.rows[k].arr[column];
        str = str.replace(regex, '');
        this.rows[k].arr[column] = str;
        this.rows[k].obj[this.columns[column]] = str;
      }
    }
  };
  p5.Table.prototype.removeColumn = function (c) {
    var cString;
    var cNumber;
    if (typeof c === 'string') {
      cString = c;
      cNumber = this.columns.indexOf(c);
      console.log('string');
    } else {
      cNumber = c;
      cString = this.columns[c];
    }
    var chunk = this.columns.splice(cNumber + 1, this.columns.length);
    this.columns.pop();
    this.columns = this.columns.concat(chunk);
    for (var i = 0; i < this.rows.length; i++) {
      var tempR = this.rows[i].arr;
      var chip = tempR.splice(cNumber + 1, tempR.length);
      tempR.pop();
      this.rows[i].arr = tempR.concat(chip);
      delete this.rows[i].obj[cString];
    }
  };
  p5.Table.prototype.set = function (row, column, value) {
    this.rows[row].set(column, value);
  };
  p5.Table.prototype.setNum = function (row, column, value) {
    this.rows[row].set(column, value);
  };
  p5.Table.prototype.setString = function (row, column, value) {
    this.rows[row].set(column, value);
  };
  p5.Table.prototype.get = function (row, column) {
    return this.rows[row].get(column);
  };
  p5.Table.prototype.getNum = function (row, column) {
    return this.rows[row].getNum(column);
  };
  p5.Table.prototype.getString = function (row, column) {
    return this.rows[row].getString(column);
  };
  p5.Table.prototype.getObject = function (headerColumn) {
    var tableObject = {};
    var obj, cPos, index;
    for (var i = 0; i < this.rows.length; i++) {
      obj = this.rows[i].obj;
      if (typeof headerColumn === 'string') {
        cPos = this.columns.indexOf(headerColumn);
        if (cPos >= 0) {
          index = obj[headerColumn];
          tableObject[index] = obj;
        } else {
          throw 'This table has no column named "' + headerColumn + '"';
        }
      } else {
        tableObject[i] = this.rows[i].obj;
      }
    }
    return tableObject;
  };
  p5.Table.prototype.getArray = function () {
    var tableArray = [];
    for (var i = 0; i < this.rows.length; i++) {
      tableArray.push(this.rows[i].arr);
    }
    return tableArray;
  };
  return p5.Table;
}({}, amdclean['core']);
amdclean['colorcreating_reading'] = function (require, core, p5Color) {
  'use strict';
  var p5 = core;
  p5.prototype.alpha = function (c) {
    if (c instanceof p5.Color || c instanceof Array) {
      return this.color(c).getAlpha();
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.blue = function (c) {
    if (c instanceof p5.Color || c instanceof Array) {
      return this.color(c).getBlue();
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.brightness = function (c) {
    if (c instanceof p5.Color || c instanceof Array) {
      return this.color(c).getBrightness();
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.color = function () {
    if (arguments[0] instanceof p5.Color) {
      return arguments[0];
    } else if (arguments[0] instanceof Array) {
      return new p5.Color(this, arguments[0]);
    } else {
      var args = Array.prototype.slice.call(arguments);
      return new p5.Color(this, args);
    }
  };
  p5.prototype.green = function (c) {
    if (c instanceof p5.Color || c instanceof Array) {
      return this.color(c).getGreen();
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.hue = function (c) {
    if (!c instanceof p5.Color) {
      throw new Error('Needs p5.Color as argument.');
    }
    return c.getHue();
  };
  p5.prototype.lerpColor = function (c1, c2, amt) {
    amt = Math.max(Math.min(amt, 1), 0);
    if (c1 instanceof Array) {
      var c = [];
      for (var i = 0; i < c1.length; i++) {
        c.push(Math.sqrt(p5.prototype.lerp(c1[i] * c1[i], c2[i] * c2[i], amt)));
      }
      return c;
    } else if (c1 instanceof p5.Color) {
      var pc = [];
      for (var j = 0; j < 4; j++) {
        pc.push(Math.sqrt(p5.prototype.lerp(c1.rgba[j] * c1.rgba[j], c2.rgba[j] * c2.rgba[j], amt)));
      }
      return new p5.Color(this, pc);
    } else {
      return Math.sqrt(p5.prototype.lerp(c1 * c1, c2 * c2, amt));
    }
  };
  p5.prototype.red = function (c) {
    if (c instanceof p5.Color || c instanceof Array) {
      return this.color(c).getRed();
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.saturation = function (c) {
    if (!c instanceof p5.Color) {
      throw new Error('Needs p5.Color as argument.');
    }
    return c.getSaturation();
  };
  return p5;
}({}, amdclean['core'], amdclean['p5Color']);
amdclean['colorsetting'] = function (require, core, constants, p5Color) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._doStroke = true;
  p5.prototype._doFill = true;
  p5.prototype._colorMode = constants.RGB;
  p5.prototype._maxRGB = [
    255,
    255,
    255,
    255
  ];
  p5.prototype._maxHSB = [
    255,
    255,
    255,
    255
  ];
  p5.prototype.background = function () {
    if (arguments[0] instanceof p5.Image) {
      this.image(arguments[0], 0, 0, this.width, this.height);
    } else {
      this._graphics.background.apply(this._graphics, arguments);
    }
  };
  p5.prototype.clear = function () {
    this._graphics.clear();
  };
  p5.prototype.colorMode = function () {
    if (arguments[0] === constants.RGB || arguments[0] === constants.HSB) {
      this._colorMode = arguments[0];
      var isRGB = this._colorMode === constants.RGB;
      var maxArr = isRGB ? this._maxRGB : this._maxHSB;
      if (arguments.length === 2) {
        maxArr[0] = arguments[1];
        maxArr[1] = arguments[1];
        maxArr[2] = arguments[1];
        maxArr[3] = arguments[1];
      } else if (arguments.length > 2) {
        maxArr[0] = arguments[1];
        maxArr[1] = arguments[2];
        maxArr[2] = arguments[3];
      }
      if (arguments.length === 5) {
        maxArr[3] = arguments[4];
      }
    }
  };
  p5.prototype.fill = function () {
    this._setProperty('_doFill', true);
    this._graphics.fill.apply(this._graphics, arguments);
  };
  p5.prototype.noFill = function () {
    this._setProperty('_doFill', false);
  };
  p5.prototype.noStroke = function () {
    this._setProperty('_doStroke', false);
  };
  p5.prototype.stroke = function () {
    this._setProperty('_doStroke', true);
    this._graphics.stroke.apply(this._graphics, arguments);
  };
  return p5;
}({}, amdclean['core'], amdclean['constants'], amdclean['p5Color']);
amdclean['dataconversion'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.float = function (str) {
    return parseFloat(str);
  };
  p5.prototype.int = function (n, radix) {
    if (typeof n === 'string') {
      radix = radix || 10;
      return parseInt(n, radix);
    } else if (typeof n === 'number') {
      return n | 0;
    } else if (typeof n === 'boolean') {
      return n ? 1 : 0;
    } else if (n instanceof Array) {
      return n.map(function (n) {
        return p5.prototype.int(n, radix);
      });
    }
  };
  p5.prototype.str = function (n) {
    if (n instanceof Array) {
      return n.map(p5.prototype.str);
    } else {
      return String(n);
    }
  };
  p5.prototype.boolean = function (n) {
    if (typeof n === 'number') {
      return n !== 0;
    } else if (typeof n === 'string') {
      return n.toLowerCase() === 'true';
    } else if (typeof n === 'boolean') {
      return n;
    } else if (n instanceof Array) {
      return n.map(p5.prototype.boolean);
    }
  };
  p5.prototype.byte = function (n) {
    var nn = p5.prototype.int(n, 10);
    if (typeof nn === 'number') {
      return (nn + 128) % 256 - 128;
    } else if (nn instanceof Array) {
      return nn.map(p5.prototype.byte);
    }
  };
  p5.prototype.char = function (n) {
    if (typeof n === 'number' && !isNaN(n)) {
      return String.fromCharCode(n);
    } else if (n instanceof Array) {
      return n.map(p5.prototype.char);
    } else if (typeof n === 'string') {
      return p5.prototype.char(parseInt(n, 10));
    }
  };
  p5.prototype.unchar = function (n) {
    if (typeof n === 'string' && n.length === 1) {
      return n.charCodeAt(0);
    } else if (n instanceof Array) {
      return n.map(p5.prototype.unchar);
    }
  };
  p5.prototype.hex = function (n, digits) {
    digits = digits === undefined || digits === null ? digits = 8 : digits;
    if (n instanceof Array) {
      return n.map(function (n) {
        return p5.prototype.hex(n, digits);
      });
    } else if (typeof n === 'number') {
      if (n < 0) {
        n = 4294967295 + n + 1;
      }
      var hex = Number(n).toString(16).toUpperCase();
      while (hex.length < digits) {
        hex = '0' + hex;
      }
      if (hex.length >= digits) {
        hex = hex.substring(hex.length - digits, hex.length);
      }
      return hex;
    }
  };
  p5.prototype.unhex = function (n) {
    if (n instanceof Array) {
      return n.map(p5.prototype.unhex);
    } else {
      return parseInt('0x' + n, 16);
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['dataarray_functions'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.append = function (array, value) {
    array.push(value);
    return array;
  };
  p5.prototype.arrayCopy = function (src, srcPosition, dst, dstPosition, length) {
    var start, end;
    if (typeof length !== 'undefined') {
      end = Math.min(length, src.length);
      start = dstPosition;
      src = src.slice(srcPosition, end + srcPosition);
    } else {
      if (typeof dst !== 'undefined') {
        end = dst;
        end = Math.min(end, src.length);
      } else {
        end = src.length;
      }
      start = 0;
      dst = srcPosition;
      src = src.slice(0, end);
    }
    Array.prototype.splice.apply(dst, [
      start,
      end
    ].concat(src));
  };
  p5.prototype.concat = function (list0, list1) {
    return list0.concat(list1);
  };
  p5.prototype.reverse = function (list) {
    return list.reverse();
  };
  p5.prototype.shorten = function (list) {
    list.pop();
    return list;
  };
  p5.prototype.shuffle = function (arr, bool) {
    arr = bool || ArrayBuffer.isView(arr) ? arr : arr.slice();
    var rnd, tmp, idx = arr.length;
    while (idx > 1) {
      rnd = Math.random() * idx | 0;
      tmp = arr[--idx];
      arr[idx] = arr[rnd];
      arr[rnd] = tmp;
    }
    return arr;
  };
  p5.prototype.sort = function (list, count) {
    var arr = count ? list.slice(0, Math.min(count, list.length)) : list;
    var rest = count ? list.slice(Math.min(count, list.length)) : [];
    if (typeof arr[0] === 'string') {
      arr = arr.sort();
    } else {
      arr = arr.sort(function (a, b) {
        return a - b;
      });
    }
    return arr.concat(rest);
  };
  p5.prototype.splice = function (list, value, index) {
    Array.prototype.splice.apply(list, [
      index,
      0
    ].concat(value));
    return list;
  };
  p5.prototype.subset = function (list, start, count) {
    if (typeof count !== 'undefined') {
      return list.slice(start, start + count);
    } else {
      return list.slice(start, list.length);
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['datastring_functions'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.join = function (list, separator) {
    return list.join(separator);
  };
  p5.prototype.match = function (str, reg) {
    return str.match(reg);
  };
  p5.prototype.matchAll = function (str, reg) {
    var re = new RegExp(reg, 'g');
    var match = re.exec(str);
    var matches = [];
    while (match !== null) {
      matches.push(match);
      match = re.exec(str);
    }
    return matches;
  };
  p5.prototype.nf = function () {
    if (arguments[0] instanceof Array) {
      var a = arguments[1];
      var b = arguments[2];
      return arguments[0].map(function (x) {
        return doNf(x, a, b);
      });
    } else {
      return doNf.apply(this, arguments);
    }
  };
  function doNf() {
    var num = arguments[0];
    var neg = num < 0;
    var n = neg ? num.toString().substring(1) : num.toString();
    var decimalInd = n.indexOf('.');
    var intPart = decimalInd !== -1 ? n.substring(0, decimalInd) : n;
    var decPart = decimalInd !== -1 ? n.substring(decimalInd + 1) : '';
    var str = neg ? '-' : '';
    if (arguments.length === 3) {
      for (var i = 0; i < arguments[1] - intPart.length; i++) {
        str += '0';
      }
      str += intPart;
      str += '.';
      str += decPart;
      for (var j = 0; j < arguments[2] - decPart.length; j++) {
        str += '0';
      }
      return str;
    } else {
      for (var k = 0; k < Math.max(arguments[1] - intPart.length, 0); k++) {
        str += '0';
      }
      str += n;
      return str;
    }
  }
  p5.prototype.nfc = function () {
    if (arguments[0] instanceof Array) {
      var a = arguments[1];
      return arguments[0].map(function (x) {
        return doNfc(x, a);
      });
    } else {
      return doNfc.apply(this, arguments);
    }
  };
  function doNfc() {
    var num = arguments[0].toString();
    var dec = num.indexOf('.');
    var rem = dec !== -1 ? num.substring(dec) : '';
    var n = dec !== -1 ? num.substring(0, dec) : num;
    n = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (arguments[1] === 0) {
      rem = '';
    }
    if (arguments.length > 1) {
      rem = rem.substring(0, arguments[1] + 1);
    }
    return n + rem;
  }
  p5.prototype.nfp = function () {
    var nfRes = this.nf.apply(this, arguments);
    if (nfRes instanceof Array) {
      return nfRes.map(addNfp);
    } else {
      return addNfp(nfRes);
    }
  };
  function addNfp() {
    return parseFloat(arguments[0]) > 0 ? '+' + arguments[0].toString() : arguments[0].toString();
  }
  p5.prototype.nfs = function () {
    var nfRes = this.nf.apply(this, arguments);
    if (nfRes instanceof Array) {
      return nfRes.map(addNfs);
    } else {
      return addNfs(nfRes);
    }
  };
  function addNfs() {
    return parseFloat(arguments[0]) > 0 ? ' ' + arguments[0].toString() : arguments[0].toString();
  }
  p5.prototype.split = function (str, delim) {
    return str.split(delim);
  };
  p5.prototype.splitTokens = function () {
    var d = arguments.length > 0 ? arguments[1] : /\s/g;
    return arguments[0].split(d).filter(function (n) {
      return n;
    });
  };
  p5.prototype.trim = function (str) {
    if (str instanceof Array) {
      return str.map(this.trim);
    } else {
      return str.trim();
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['environment'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var C = constants;
  var standardCursors = [
      C.ARROW,
      C.CROSS,
      C.HAND,
      C.MOVE,
      C.TEXT,
      C.WAIT
    ];
  p5.prototype._frameRate = 0;
  p5.prototype._lastFrameTime = new Date().getTime();
  p5.prototype._targetFrameRate = 60;
  if (window.console && console.log) {
    p5.prototype.print = function (args) {
      var newArgs = JSON.parse(JSON.stringify(args));
      console.log(newArgs);
    };
  } else {
    p5.prototype.print = function () {
    };
  }
  p5.prototype.println = p5.prototype.print;
  p5.prototype.frameCount = 0;
  p5.prototype.focused = true;
  p5.prototype.cursor = function (type, x, y) {
    var cursor = 'auto';
    var canvas = this._curElement.elt;
    if (standardCursors.indexOf(type) > -1) {
      cursor = type;
    } else if (typeof type === 'string') {
      var coords = '';
      if (x && y && (typeof x === 'number' && typeof y === 'number')) {
        coords = x + ' ' + y;
      }
      if (type.substring(0, 6) !== 'http://') {
        cursor = 'url(' + type + ') ' + coords + ', auto';
      } else if (/\.(cur|jpg|jpeg|gif|png|CUR|JPG|JPEG|GIF|PNG)$/.test(type)) {
        cursor = 'url(' + type + ') ' + coords + ', auto';
      } else {
        cursor = type;
      }
    }
    canvas.style.cursor = cursor;
  };
  p5.prototype.frameRate = function (fps) {
    if (typeof fps === 'undefined') {
      return this._frameRate;
    } else {
      this._setProperty('_targetFrameRate', fps);
      this._runFrames();
      return this;
    }
  };
  p5.prototype.getFrameRate = function () {
    return this.frameRate();
  };
  p5.prototype.setFrameRate = function (fps) {
    return this.frameRate(fps);
  };
  p5.prototype.noCursor = function () {
    this._curElement.elt.style.cursor = 'none';
  };
  p5.prototype.displayWidth = screen.width;
  p5.prototype.displayHeight = screen.height;
  p5.prototype.windowWidth = window.innerWidth;
  p5.prototype.windowHeight = window.innerHeight;
  p5.prototype._onresize = function (e) {
    this._setProperty('windowWidth', window.innerWidth);
    this._setProperty('windowHeight', window.innerHeight);
    var context = this._isGlobal ? window : this;
    var executeDefault;
    if (typeof context.windowResized === 'function') {
      executeDefault = context.windowResized(e);
      if (executeDefault !== undefined && !executeDefault) {
        e.preventDefault();
      }
    }
  };
  p5.prototype.width = 0;
  p5.prototype.height = 0;
  p5.prototype.fullscreen = function (val) {
    if (typeof val === 'undefined') {
      return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    } else {
      if (val) {
        launchFullscreen(document.documentElement);
      } else {
        exitFullscreen();
      }
    }
  };
  p5.prototype.devicePixelScaling = function (val) {
    if (val) {
      if (typeof val === 'number') {
        this.pixelDensity = val;
      } else {
        this.pixelDensity = window.devicePixelRatio || 1;
      }
    } else {
      this.pixelDensity = 1;
    }
    this.resizeCanvas(this.width, this.height, true);
  };
  function launchFullscreen(element) {
    var enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
    if (!enabled) {
      throw new Error('Fullscreen not enabled in this browser.');
    }
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
  p5.prototype.getURL = function () {
    return location.href;
  };
  p5.prototype.getURLPath = function () {
    return location.pathname.split('/').filter(function (v) {
      return v !== '';
    });
  };
  p5.prototype.getURLParams = function () {
    var re = /[?&]([^&=]+)(?:[&=])([^&=]+)/gim;
    var m;
    var v = {};
    while ((m = re.exec(location.search)) != null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      v[m[1]] = m[2];
    }
    return v;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['imageimage'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._imageMode = constants.CORNER;
  p5.prototype._tint = null;
  p5.prototype.createImage = function (width, height) {
    return new p5.Image(width, height);
  };
  var frames = [];
  p5.prototype.saveCanvas = function (_cnv, filename, extension) {
    if (!extension) {
      extension = p5.prototype._checkFileExtension(filename, extension)[1];
      if (extension === '') {
        extension = 'png';
      }
    }
    var cnv;
    if (_cnv) {
      cnv = _cnv;
    } else if (this._curElement && this._curElement.elt) {
      cnv = this._curElement.elt;
    }
    if (p5.prototype._isSafari()) {
      var aText = 'Hello, Safari user!\n';
      aText += 'Now capturing a screenshot...\n';
      aText += 'To save this image,\n';
      aText += 'go to File --> Save As.\n';
      alert(aText);
      window.location.href = cnv.toDataURL();
    } else {
      var mimeType;
      if (typeof extension === 'undefined') {
        extension = 'png';
        mimeType = 'image/png';
      } else {
        switch (extension) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'jpg':
          mimeType = 'image/jpeg';
          break;
        default:
          mimeType = 'image/png';
          break;
        }
      }
      var downloadMime = 'image/octet-stream';
      var imageData = cnv.toDataURL(mimeType);
      imageData = imageData.replace(mimeType, downloadMime);
      p5.prototype.downloadFile(imageData, filename, extension);
    }
  };
  p5.prototype.saveFrames = function (fName, ext, _duration, _fps, callback) {
    var duration = _duration || 3;
    duration = p5.prototype.constrain(duration, 0, 15);
    duration = duration * 1000;
    var fps = _fps || 15;
    fps = p5.prototype.constrain(fps, 0, 22);
    var count = 0;
    var makeFrame = p5.prototype._makeFrame;
    var cnv = this._curElement.elt;
    var frameFactory = setInterval(function () {
        makeFrame(fName + count, ext, cnv);
        count++;
      }, 1000 / fps);
    setTimeout(function () {
      clearInterval(frameFactory);
      if (callback) {
        callback(frames);
      } else {
        for (var i = 0; i < frames.length; i++) {
          var f = frames[i];
          p5.prototype.downloadFile(f.imageData, f.filename, f.ext);
        }
      }
      frames = [];
    }, duration + 0.01);
  };
  p5.prototype._makeFrame = function (filename, extension, _cnv) {
    var cnv;
    if (this) {
      cnv = this._curElement.elt;
    } else {
      cnv = _cnv;
    }
    var mimeType;
    if (!extension) {
      extension = 'png';
      mimeType = 'image/png';
    } else {
      switch (extension.toLowerCase()) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      default:
        mimeType = 'image/png';
        break;
      }
    }
    var downloadMime = 'image/octet-stream';
    var imageData = cnv.toDataURL(mimeType);
    imageData = imageData.replace(mimeType, downloadMime);
    var thisFrame = {};
    thisFrame.imageData = imageData;
    thisFrame.filename = filename;
    thisFrame.ext = extension;
    frames.push(thisFrame);
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['helpers'] = function (require, core) {
  'use strict';
  var p5 = core;
  var class2type = {};
  var toString = class2type.toString;
  var names = [
      'Boolean',
      'Number',
      'String',
      'Function',
      'Array',
      'Date',
      'RegExp',
      'Object',
      'Error'
    ];
  for (var n = 0; n < names.length; n++) {
    class2type['[object ' + names[n] + ']'] = names[n].toLowerCase();
  }
  var getType = function (obj) {
    if (obj == null) {
      return obj + '';
    }
    return typeof obj === 'object' || typeof obj === 'function' ? class2type[toString.call(obj)] || 'object' : typeof obj;
  };
  var isArray = Array.isArray || function (obj) {
      return getType(obj) === 'array';
    };
  var isNumeric = function (obj) {
    return !isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
  };
  var numberTypes = [
      'Number',
      'Integer',
      'Number/Constant'
    ];
  function typeMatches(defType, argType, arg) {
    if (defType.match(/^p5\./)) {
      var parts = defType.split('.');
      return arg instanceof p5[parts[1]];
    }
    return defType === 'Boolean' || defType.toLowerCase() === argType || numberTypes.indexOf(defType) > -1 && isNumeric(arg);
  }
  var PARAM_COUNT = 0;
  var EMPTY_VAR = 1;
  var WRONG_TYPE = 2;
  var typeColors = [
      '#2D7BB6',
      '#EE9900',
      '#4DB200'
    ];
  function report(message, func, color) {
    if ('undefined' === getType(color)) {
      color = '#B40033';
    } else if (getType(color) === 'number') {
      color = typeColors[color];
    }
    console.log('%c> p5.js says: ' + message + '%c [http://p5js.org/reference/#p5/' + func + ']', 'background-color:' + color + ';color:#FFF;', 'background-color:transparent;color:' + color + ';');
  }
  p5.prototype._validateParameters = function (func, args, types) {
    if (!isArray(types[0])) {
      types = [types];
    }
    var diff = Math.abs(args.length - types[0].length);
    var message, tindex = 0;
    for (var i = 1, len = types.length; i < len; i++) {
      var d = Math.abs(args.length - types[i].length);
      if (d <= diff) {
        tindex = i;
        diff = d;
      }
    }
    var symbol = 'X';
    if (diff > 0) {
      message = 'You wrote ' + func + '(';
      if (args.length > 0) {
        message += symbol + (',' + symbol).repeat(args.length - 1);
      }
      message += '). ' + func + ' was expecting ' + types[tindex].length + ' parameters. Try ' + func + '(';
      if (types[tindex].length > 0) {
        message += symbol + (',' + symbol).repeat(types[tindex].length - 1);
      }
      message += ').';
      if (types.length > 1) {
        message += ' ' + func + ' takes different numbers of parameters ' + 'depending on what you want to do. Click this link to learn more: ';
      }
      report(message, func, PARAM_COUNT);
    }
    for (var format = 0; format < types.length; format++) {
      for (var p = 0; p < types[format].length && p < args.length; p++) {
        var defType = types[format][p];
        var argType = getType(args[p]);
        if ('undefined' === argType || null === argType) {
          report('It looks like ' + func + ' received an empty variable in spot #' + (p + 1) + '. If not intentional, this is often a problem with scope: ' + '[link to scope].', func, EMPTY_VAR);
        } else if (!typeMatches(defType, argType, args[p])) {
          message = func + ' was expecting a ' + defType.toLowerCase() + ' for parameter #' + (p + 1) + ', received ';
          message += 'string' === argType ? '"' + args[p] + '"' : args[p];
          message += ' instead.';
          if (types.length > 1) {
            message += ' ' + func + ' takes different numbers of parameters ' + 'depending on what you want to do. ' + 'Click this link to learn more:';
          }
          report(message, func, WRONG_TYPE);
        }
      }
    }
  };
  p5.prototype._testColors = function () {
    var str = 'A box of biscuits, a box of mixed biscuits and a biscuit mixer';
    report(str, 'println', '#ED225D');
    report(str, 'println', '#2D7BB6');
    report(str, 'println', '#EE9900');
    report(str, 'println', '#A67F59');
    report(str, 'println', '#704F21');
    report(str, 'println', '#1CC581');
    report(str, 'println', '#FF6625');
    report(str, 'println', '#79EB22');
    report(str, 'println', '#B40033');
    report(str, 'println', '#084B7F');
    report(str, 'println', '#945F00');
    report(str, 'println', '#6B441D');
    report(str, 'println', '#2E1B00');
    report(str, 'println', '#008851');
    report(str, 'println', '#C83C00');
    report(str, 'println', '#4DB200');
  };
  return p5;
}({}, amdclean['core']);
amdclean['imageloading_displaying'] = function (require, core, filters, canvas, constants, helpers) {
  'use strict';
  var p5 = core;
  var Filters = filters;
  var canvas = canvas;
  var constants = constants;
  p5.prototype.loadImage = function (path, successCallback, failureCallback) {
    var img = new Image();
    var pImg = new p5.Image(1, 1, this);
    img.onload = function () {
      pImg.width = pImg.canvas.width = img.width;
      pImg.height = pImg.canvas.height = img.height;
      pImg.canvas.getContext('2d').drawImage(img, 0, 0);
      if (typeof successCallback === 'function') {
        successCallback(pImg);
      }
    };
    img.onerror = function (e) {
      if (typeof failureCallback === 'function') {
        failureCallback(e);
      }
    };
    if (path.indexOf('data:image/') !== 0) {
      img.crossOrigin = 'Anonymous';
    }
    img.src = path;
    return pImg;
  };
  p5.prototype.image = function (img, x, y, width, height) {
    this._validateParameters('image', arguments, [
      [
        'p5.Image',
        'Number',
        'Number'
      ],
      [
        'p5.Image',
        'Number',
        'Number',
        'Number',
        'Number'
      ]
    ]);
    x = x || 0;
    y = y || 0;
    width = width || img.width;
    height = height || img.height;
    var vals = canvas.modeAdjust(x, y, width, height, this._imageMode);
    this._graphics.image(img, vals.x, vals.y, vals.w, vals.h);
  };
  p5.prototype.tint = function () {
    var c = this.color.apply(this, arguments);
    this._tint = c.rgba;
  };
  p5.prototype.noTint = function () {
    this._tint = null;
  };
  p5.prototype._getTintedImageCanvas = function (img) {
    if (!img.canvas) {
      return img;
    }
    var pixels = Filters._toPixels(img.canvas);
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = img.canvas.width;
    tmpCanvas.height = img.canvas.height;
    var tmpCtx = tmpCanvas.getContext('2d');
    var id = tmpCtx.createImageData(img.canvas.width, img.canvas.height);
    var newPixels = id.data;
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var a = pixels[i + 3];
      newPixels[i] = r * this._tint[0] / 255;
      newPixels[i + 1] = g * this._tint[1] / 255;
      newPixels[i + 2] = b * this._tint[2] / 255;
      newPixels[i + 3] = a * this._tint[3] / 255;
    }
    tmpCtx.putImageData(id, 0, 0);
    return tmpCanvas;
  };
  p5.prototype.imageMode = function (m) {
    if (m === constants.CORNER || m === constants.CORNERS || m === constants.CENTER) {
      this._imageMode = m;
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['filters'], amdclean['canvas'], amdclean['constants'], amdclean['helpers']);
amdclean['imagepixels'] = function (require, core, filters, p5Color) {
  'use strict';
  var p5 = core;
  var Filters = filters;
  p5.prototype.pixels = [];
  p5.prototype.blend = function () {
    this._graphics.blend.apply(this._graphics, arguments);
  };
  p5.prototype.copy = function () {
    p5.Graphics2D._copyHelper.apply(this, arguments);
  };
  p5.prototype.filter = function (operation, value) {
    Filters.apply(this.canvas, Filters[operation.toLowerCase()], value);
  };
  p5.prototype.get = function (x, y, w, h) {
    return this._graphics.get(x, y, w, h);
  };
  p5.prototype.loadPixels = function () {
    this._graphics.loadPixels();
  };
  p5.prototype.set = function (x, y, imgOrCol) {
    this._graphics.set(x, y, imgOrCol);
  };
  p5.prototype.updatePixels = function (x, y, w, h) {
    this._graphics.updatePixels(x, y, w, h);
  };
  return p5;
}({}, amdclean['core'], amdclean['filters'], amdclean['p5Color']);
!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports)
    module.exports = definition();
  else if (typeof define == 'function' && define.amd)
    define('reqwest', definition);
  else
    context[name] = definition();
}('reqwest', amdclean, function () {
  var win = window, doc = document, httpsRe = /^http/, protocolRe = /(^\w+):\/\//, twoHundo = /^(20\d|1223)$/, byTag = 'getElementsByTagName', readyState = 'readyState', contentType = 'Content-Type', requestedWith = 'X-Requested-With', head = doc[byTag]('head')[0], uniqid = 0, callbackPrefix = 'reqwest_' + +new Date(), lastValue, xmlHttpRequest = 'XMLHttpRequest', xDomainRequest = 'XDomainRequest', noop = function () {
    }, isArray = typeof Array.isArray == 'function' ? Array.isArray : function (a) {
      return a instanceof Array;
    }, defaultHeaders = {
      'contentType': 'application/x-www-form-urlencoded',
      'requestedWith': xmlHttpRequest,
      'accept': {
        '*': 'text/javascript, text/html, application/xml, text/xml, */*',
        'xml': 'application/xml, text/xml',
        'html': 'text/html',
        'text': 'text/plain',
        'json': 'application/json, text/javascript',
        'js': 'application/javascript, text/javascript'
      }
    }, xhr = function (o) {
      if (o['crossOrigin'] === true) {
        var xhr = win[xmlHttpRequest] ? new XMLHttpRequest() : null;
        if (xhr && 'withCredentials' in xhr) {
          return xhr;
        } else if (win[xDomainRequest]) {
          return new XDomainRequest();
        } else {
          throw new Error('Browser does not support cross-origin requests');
        }
      } else if (win[xmlHttpRequest]) {
        return new XMLHttpRequest();
      } else {
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    }, globalSetupOptions = {
      dataFilter: function (data) {
        return data;
      }
    };
  function succeed(r) {
    var protocol = protocolRe.exec(r.url);
    protocol = protocol && protocol[1] || window.location.protocol;
    return httpsRe.test(protocol) ? twoHundo.test(r.request.status) : !!r.request.response;
  }
  function handleReadyState(r, success, error) {
    return function () {
      if (r._aborted)
        return error(r.request);
      if (r._timedOut)
        return error(r.request, 'Request is aborted: timeout');
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop;
        if (succeed(r))
          success(r.request);
        else
          error(r.request);
      }
    };
  }
  function setHeaders(http, o) {
    var headers = o['headers'] || {}, h;
    headers['Accept'] = headers['Accept'] || defaultHeaders['accept'][o['type']] || defaultHeaders['accept']['*'];
    var isAFormData = typeof FormData === 'function' && o['data'] instanceof FormData;
    if (!o['crossOrigin'] && !headers[requestedWith])
      headers[requestedWith] = defaultHeaders['requestedWith'];
    if (!headers[contentType] && !isAFormData)
      headers[contentType] = o['contentType'] || defaultHeaders['contentType'];
    for (h in headers)
      headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h]);
  }
  function setCredentials(http, o) {
    if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o['withCredentials'];
    }
  }
  function generalCallback(data) {
    lastValue = data;
  }
  function urlappend(url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s;
  }
  function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++, cbkey = o['jsonpCallback'] || 'callback', cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId), cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'), match = url.match(cbreg), script = doc.createElement('script'), loaded = 0, isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1;
    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval);
      } else {
        cbval = match[3];
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval);
    }
    win[cbval] = generalCallback;
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
      script.htmlFor = script.id = '_reqwest_' + reqId;
    }
    script.onload = script.onreadystatechange = function () {
      if (script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded' || loaded) {
        return false;
      }
      script.onload = script.onreadystatechange = null;
      script.onclick && script.onclick();
      fn(lastValue);
      lastValue = undefined;
      head.removeChild(script);
      loaded = 1;
    };
    head.appendChild(script);
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null;
        err({}, 'Request is aborted: timeout', {});
        lastValue = undefined;
        head.removeChild(script);
        loaded = 1;
      }
    };
  }
  function getRequest(fn, err) {
    var o = this.o, method = (o['method'] || 'GET').toUpperCase(), url = typeof o === 'string' ? o : o['url'], data = o['processData'] !== false && o['data'] && typeof o['data'] !== 'string' ? reqwest.toQueryString(o['data']) : o['data'] || null, http, sendWait = false;
    if ((o['type'] == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data);
      data = null;
    }
    if (o['type'] == 'jsonp')
      return handleJsonp(o, fn, err, url);
    http = o.xhr && o.xhr(o) || xhr(o);
    http.open(method, url, o['async'] === false ? false : true);
    setHeaders(http, o);
    setCredentials(http, o);
    if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
      http.onload = fn;
      http.onerror = err;
      http.onprogress = function () {
      };
      sendWait = true;
    } else {
      http.onreadystatechange = handleReadyState(this, fn, err);
    }
    o['before'] && o['before'](http);
    if (sendWait) {
      setTimeout(function () {
        http.send(data);
      }, 200);
    } else {
      http.send(data);
    }
    return http;
  }
  function Reqwest(o, fn) {
    this.o = o;
    this.fn = fn;
    init.apply(this, arguments);
  }
  function setType(header) {
    if (header.match('json'))
      return 'json';
    if (header.match('javascript'))
      return 'js';
    if (header.match('text'))
      return 'html';
    if (header.match('xml'))
      return 'xml';
  }
  function init(o, fn) {
    this.url = typeof o == 'string' ? o : o['url'];
    this.timeout = null;
    this._fulfilled = false;
    this._successHandler = function () {
    };
    this._fulfillmentHandlers = [];
    this._errorHandlers = [];
    this._completeHandlers = [];
    this._erred = false;
    this._responseArgs = {};
    var self = this;
    fn = fn || function () {
    };
    if (o['timeout']) {
      this.timeout = setTimeout(function () {
        timedOut();
      }, o['timeout']);
    }
    if (o['success']) {
      this._successHandler = function () {
        o['success'].apply(o, arguments);
      };
    }
    if (o['error']) {
      this._errorHandlers.push(function () {
        o['error'].apply(o, arguments);
      });
    }
    if (o['complete']) {
      this._completeHandlers.push(function () {
        o['complete'].apply(o, arguments);
      });
    }
    function complete(resp) {
      o['timeout'] && clearTimeout(self.timeout);
      self.timeout = null;
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp);
      }
    }
    function success(resp) {
      var type = o['type'] || resp && setType(resp.getResponseHeader('Content-Type'));
      resp = type !== 'jsonp' ? self.request : resp;
      var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type), r = filteredResponse;
      try {
        resp.responseText = r;
      } catch (e) {
      }
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')');
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err);
          }
          break;
        case 'js':
          resp = eval(r);
          break;
        case 'html':
          resp = r;
          break;
        case 'xml':
          resp = resp.responseXML && resp.responseXML.parseError && resp.responseXML.parseError.errorCode && resp.responseXML.parseError.reason ? null : resp.responseXML;
          break;
        }
      }
      self._responseArgs.resp = resp;
      self._fulfilled = true;
      fn(resp);
      self._successHandler(resp);
      while (self._fulfillmentHandlers.length > 0) {
        resp = self._fulfillmentHandlers.shift()(resp);
      }
      complete(resp);
    }
    function timedOut() {
      self._timedOut = true;
      self.request.abort();
    }
    function error(resp, msg, t) {
      resp = self.request;
      self._responseArgs.resp = resp;
      self._responseArgs.msg = msg;
      self._responseArgs.t = t;
      self._erred = true;
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t);
      }
      complete(resp);
    }
    this.request = getRequest.call(this, success, error);
  }
  Reqwest.prototype = {
    abort: function () {
      this._aborted = true;
      this.request.abort();
    },
    retry: function () {
      init.call(this, this.o, this.fn);
    },
    then: function (success, fail) {
      success = success || function () {
      };
      fail = fail || function () {
      };
      if (this._fulfilled) {
        this._responseArgs.resp = success(this._responseArgs.resp);
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
      } else {
        this._fulfillmentHandlers.push(success);
        this._errorHandlers.push(fail);
      }
      return this;
    },
    always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp);
      } else {
        this._completeHandlers.push(fn);
      }
      return this;
    },
    fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
      } else {
        this._errorHandlers.push(fn);
      }
      return this;
    },
    'catch': function (fn) {
      return this.fail(fn);
    }
  };
  function reqwest(o, fn) {
    return new Reqwest(o, fn);
  }
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : '';
  }
  function serial(el, cb) {
    var n = el.name, t = el.tagName.toLowerCase(), optCb = function (o) {
        if (o && !o['disabled'])
          cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']));
      }, ch, ra, val, i;
    if (el.disabled || !n)
      return;
    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type);
        ra = /radio/i.test(el.type);
        val = el.value;
        (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val));
      }
      break;
    case 'textarea':
      cb(n, normalize(el.value));
      break;
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i]);
        }
      }
      break;
    }
  }
  function eachFormElement() {
    var cb = this, e, i, serializeSubtags = function (e, tags) {
        var i, j, fa;
        for (i = 0; i < tags.length; i++) {
          fa = e[byTag](tags[i]);
          for (j = 0; j < fa.length; j++)
            serial(fa[j], cb);
        }
      };
    for (i = 0; i < arguments.length; i++) {
      e = arguments[i];
      if (/input|select|textarea/i.test(e.tagName))
        serial(e, cb);
      serializeSubtags(e, [
        'input',
        'select',
        'textarea'
      ]);
    }
  }
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments));
  }
  function serializeHash() {
    var hash = {};
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]]);
        hash[name].push(value);
      } else
        hash[name] = value;
    }, arguments);
    return hash;
  }
  reqwest.serializeArray = function () {
    var arr = [];
    eachFormElement.apply(function (name, value) {
      arr.push({
        name: name,
        value: value
      });
    }, arguments);
    return arr;
  };
  reqwest.serialize = function () {
    if (arguments.length === 0)
      return '';
    var opt, fn, args = Array.prototype.slice.call(arguments, 0);
    opt = args.pop();
    opt && opt.nodeType && args.push(opt) && (opt = null);
    opt && (opt = opt.type);
    if (opt == 'map')
      fn = serializeHash;
    else if (opt == 'array')
      fn = reqwest.serializeArray;
    else
      fn = serializeQueryString;
    return fn.apply(null, args);
  };
  reqwest.toQueryString = function (o, trad) {
    var prefix, i, traditional = trad || false, s = [], enc = encodeURIComponent, add = function (key, value) {
        value = 'function' === typeof value ? value() : value == null ? '' : value;
        s[s.length] = enc(key) + '=' + enc(value);
      };
    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++)
        add(o[i]['name'], o[i]['value']);
    } else {
      for (prefix in o) {
        if (o.hasOwnProperty(prefix))
          buildParams(prefix, o[prefix], traditional, add);
      }
    }
    return s.join('&').replace(/%20/g, '+');
  };
  function buildParams(prefix, obj, traditional, add) {
    var name, i, v, rbracket = /\[\]$/;
    if (isArray(obj)) {
      for (i = 0; obj && i < obj.length; i++) {
        v = obj[i];
        if (traditional || rbracket.test(prefix)) {
          add(prefix, v);
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
        }
      }
    } else if (obj && obj.toString() === '[object Object]') {
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
      }
    } else {
      add(prefix, obj);
    }
  }
  reqwest.getcallbackPrefix = function () {
    return callbackPrefix;
  };
  reqwest.compat = function (o, fn) {
    if (o) {
      o['type'] && (o['method'] = o['type']) && delete o['type'];
      o['dataType'] && (o['type'] = o['dataType']);
      o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback'];
      o['jsonp'] && (o['jsonpCallback'] = o['jsonp']);
    }
    return new Reqwest(o, fn);
  };
  reqwest.ajaxSetup = function (options) {
    options = options || {};
    for (var k in options) {
      globalSetupOptions[k] = options[k];
    }
  };
  return reqwest;
});
amdclean['inputfiles'] = function (require, core, reqwest) {
  'use strict';
  var p5 = core;
  var reqwest = reqwest;
  p5.prototype.createInput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.createReader = function () {
    throw 'not yet implemented';
  };
  p5.prototype.loadBytes = function () {
    throw 'not yet implemented';
  };
  p5.prototype.loadJSON = function () {
    var path = arguments[0];
    var callback = arguments[1];
    var ret = [];
    var t = 'json';
    if (typeof arguments[2] === 'string') {
      if (arguments[2] === 'jsonp' || arguments[2] === 'json') {
        t = arguments[2];
      }
    }
    reqwest({
      url: path,
      type: t,
      crossOrigin: true
    }).then(function (resp) {
      for (var k in resp) {
        ret[k] = resp[k];
      }
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    });
    return ret;
  };
  p5.prototype.loadStrings = function (path, callback) {
    var ret = [];
    var req = new XMLHttpRequest();
    req.open('GET', path, true);
    req.onreadystatechange = function () {
      if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
        var arr = req.responseText.match(/[^\r\n]+/g);
        for (var k in arr) {
          ret[k] = arr[k];
        }
        if (typeof callback !== 'undefined') {
          callback(ret);
        }
      }
    };
    req.send(null);
    return ret;
  };
  p5.prototype.loadTable = function (path) {
    var callback = null;
    var options = [];
    var header = false;
    var sep = ',';
    var separatorSet = false;
    for (var i = 1; i < arguments.length; i++) {
      if (typeof arguments[i] === 'function') {
        callback = arguments[i];
      } else if (typeof arguments[i] === 'string') {
        options.push(arguments[i]);
        if (arguments[i] === 'header') {
          header = true;
        }
        if (arguments[i] === 'csv') {
          if (separatorSet) {
            throw new Error('Cannot set multiple separator types.');
          } else {
            sep = ',';
            separatorSet = true;
          }
        } else if (arguments[i] === 'tsv') {
          if (separatorSet) {
            throw new Error('Cannot set multiple separator types.');
          } else {
            sep = '\t';
            separatorSet = true;
          }
        }
      }
    }
    var t = new p5.Table();
    reqwest({
      url: path,
      crossOrigin: true,
      type: 'csv'
    }).then(function (resp) {
      resp = resp.responseText;
      var state = {};
      var PRE_TOKEN = 0, MID_TOKEN = 1, POST_TOKEN = 2, POST_RECORD = 4;
      var QUOTE = '"', CR = '\r', LF = '\n';
      var records = [];
      var offset = 0;
      var currentRecord = null;
      var currentChar;
      var recordBegin = function () {
        state.escaped = false;
        currentRecord = [];
        tokenBegin();
      };
      var recordEnd = function () {
        state.currentState = POST_RECORD;
        records.push(currentRecord);
        currentRecord = null;
      };
      var tokenBegin = function () {
        state.currentState = PRE_TOKEN;
        state.token = '';
      };
      var tokenEnd = function () {
        currentRecord.push(state.token);
        tokenBegin();
      };
      while (true) {
        currentChar = resp[offset++];
        if (currentChar == null) {
          if (state.escaped) {
            throw new Error('Unclosed quote in file.');
          }
          if (currentRecord) {
            tokenEnd();
            recordEnd();
            break;
          }
        }
        if (currentRecord === null) {
          recordBegin();
        }
        if (state.currentState === PRE_TOKEN) {
          if (currentChar === QUOTE) {
            state.escaped = true;
            state.currentState = MID_TOKEN;
            continue;
          }
          state.currentState = MID_TOKEN;
        }
        if (state.currentState === MID_TOKEN && state.escaped) {
          if (currentChar === QUOTE) {
            if (resp[offset] === QUOTE) {
              state.token += QUOTE;
              offset++;
            } else {
              state.escaped = false;
              state.currentState = POST_TOKEN;
            }
          } else {
            state.token += currentChar;
          }
          continue;
        }
        if (currentChar === CR) {
          if (resp[offset] === LF) {
            offset++;
          }
          tokenEnd();
          recordEnd();
        } else if (currentChar === LF) {
          tokenEnd();
          recordEnd();
        } else if (currentChar === sep) {
          tokenEnd();
        } else if (state.currentState === MID_TOKEN) {
          state.token += currentChar;
        }
      }
      if (header) {
        t.columns = records.shift();
      } else {
        for (i = 0; i < records.length; i++) {
          t.columns[i] = i.toString();
        }
      }
      var row;
      for (i = 0; i < records.length; i++) {
        if (i === records.length - 1 && records[i].length === 1) {
          if (records[i][0] === 'undefined') {
            break;
          }
        }
        row = new p5.TableRow();
        row.arr = records[i];
        row.obj = makeObject(records[i], t.columns);
        t.addRow(row);
      }
      if (callback !== null) {
        callback(t);
      }
    }).fail(function (err, msg) {
      if (typeof callback !== 'undefined') {
        callback(false);
      }
    });
    return t;
  };
  function makeObject(row, headers) {
    var ret = {};
    headers = headers || [];
    if (typeof headers === 'undefined') {
      for (var j = 0; j < row.length; j++) {
        headers[j.toString()] = j;
      }
    }
    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      var val = row[i];
      ret[key] = val;
    }
    return ret;
  }
  p5.prototype.loadXML = function (path, callback) {
    var ret = [];
    reqwest({
      url: path,
      type: 'xml',
      crossOrigin: true
    }).then(function (resp) {
      callback(resp);
    });
    return ret;
  };
  p5.prototype.parseXML = function () {
    throw 'not yet implemented';
  };
  p5.prototype.selectFolder = function () {
    throw 'not yet implemented';
  };
  p5.prototype.selectInput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.httpGet = function () {
    var args = Array.prototype.slice.call(arguments);
    args.push('GET');
    p5.prototype.httpDo.apply(this, args);
  };
  p5.prototype.httpPost = function () {
    var args = Array.prototype.slice.call(arguments);
    args.push('POST');
    p5.prototype.httpDo.apply(this, args);
  };
  p5.prototype.httpDo = function () {
    var method = 'GET';
    var path = arguments[0];
    var data = {};
    var type = '';
    var callback;
    for (var i = 1; i < arguments.length; i++) {
      var a = arguments[i];
      if (typeof a === 'string') {
        if (a === 'GET' || a === 'POST' || a === 'PUT') {
          method = a;
        } else {
          type = a;
        }
      } else if (typeof a === 'object') {
        data = a;
      } else if (typeof a === 'function') {
        callback = a;
      }
    }
    if (type === '') {
      if (path.indexOf('json') !== -1) {
        type = 'json';
      } else if (path.indexOf('xml') !== -1) {
        type = 'xml';
      } else {
        type = 'text';
      }
    }
    reqwest({
      url: path,
      method: method,
      data: data,
      type: type,
      crossOrigin: true,
      success: function (resp) {
        if (typeof callback !== 'undefined') {
          if (type === 'text') {
            callback(resp.response);
          } else {
            callback(resp);
          }
        }
      }
    });
  };
  window.URL = window.URL || window.webkitURL;
  p5.prototype._pWriters = [];
  p5.prototype.beginRaw = function () {
    throw 'not yet implemented';
  };
  p5.prototype.beginRecord = function () {
    throw 'not yet implemented';
  };
  p5.prototype.createOutput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.createWriter = function (name, extension) {
    var newPW;
    for (var i in p5.prototype._pWriters) {
      if (p5.prototype._pWriters[i].name === name) {
        newPW = new p5.PrintWriter(name + window.millis(), extension);
        p5.prototype._pWriters.push(newPW);
        return newPW;
      }
    }
    newPW = new p5.PrintWriter(name, extension);
    p5.prototype._pWriters.push(newPW);
    return newPW;
  };
  p5.prototype.endRaw = function () {
    throw 'not yet implemented';
  };
  p5.prototype.endRecord = function () {
    throw 'not yet implemented';
  };
  p5.PrintWriter = function (filename, extension) {
    var self = this;
    this.name = filename;
    this.content = '';
    this.print = function (data) {
      this.content += data;
    };
    this.println = function (data) {
      this.content += data + '\n';
    };
    this.flush = function () {
      this.content = '';
    };
    this.close = function () {
      var arr = [];
      arr.push(this.content);
      p5.prototype.writeFile(arr, filename, extension);
      for (var i in p5.prototype._pWriters) {
        if (p5.prototype._pWriters[i].name === this.name) {
          p5.prototype._pWriters.splice(i, 1);
        }
      }
      self.flush();
      self = {};
    };
  };
  p5.prototype.saveBytes = function () {
    throw 'not yet implemented';
  };
  p5.prototype.save = function (object, _filename, _options) {
    var args = arguments;
    var cnv = this._curElement.elt;
    if (args.length === 0) {
      p5.prototype.saveCanvas(cnv);
      return;
    } else if (args[0] instanceof p5.Graphics) {
      p5.prototype.saveCanvas(args[0].elt, args[1], args[2]);
      return;
    } else if (args.length === 1 && typeof args[0] === 'string') {
      p5.prototype.saveCanvas(cnv, args[0]);
    } else {
      var extension = _checkFileExtension(args[1], args[2])[1];
      switch (extension) {
      case 'json':
        p5.prototype.saveJSON(args[0], args[1], args[2]);
        return;
      case 'txt':
        p5.prototype.saveStrings(args[0], args[1], args[2]);
        return;
      default:
        if (args[0] instanceof Array) {
          p5.prototype.saveStrings(args[0], args[1], args[2]);
        } else if (args[0] instanceof p5.Table) {
          p5.prototype.saveTable(args[0], args[1], args[2], args[3]);
        } else if (args[0] instanceof p5.Image) {
          p5.prototype.saveCanvas(args[0].canvas, args[1]);
        } else if (args[0] instanceof p5.SoundFile) {
          p5.prototype.saveSound(args[0], args[1], args[2], args[3]);
        }
      }
    }
  };
  p5.prototype.saveJSON = function (json, filename, opt) {
    var stringify;
    if (opt) {
      stringify = JSON.stringify(json);
    } else {
      stringify = JSON.stringify(json, undefined, 2);
    }
    console.log(stringify);
    this.saveStrings(stringify.split('\n'), filename, 'json');
  };
  p5.prototype.saveJSONObject = p5.prototype.saveJSON;
  p5.prototype.saveJSONArray = p5.prototype.saveJSON;
  p5.prototype.saveStream = function () {
    throw 'not yet implemented';
  };
  p5.prototype.saveStrings = function (list, filename, extension) {
    var ext = extension || 'txt';
    var pWriter = this.createWriter(filename, ext);
    for (var i in list) {
      if (i < list.length - 1) {
        pWriter.println(list[i]);
      } else {
        pWriter.print(list[i]);
      }
    }
    pWriter.close();
    pWriter.flush();
  };
  p5.prototype.saveXML = function () {
    throw 'not yet implemented';
  };
  p5.prototype.selectOutput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.saveTable = function (table, filename, options) {
    var pWriter = this.createWriter(filename, options);
    var header = table.columns;
    var sep = ',';
    if (options === 'tsv') {
      sep = '\t';
    }
    if (options !== 'html') {
      if (header[0] !== '0') {
        for (var h = 0; h < header.length; h++) {
          if (h < header.length - 1) {
            pWriter.print(header[h] + sep);
          } else {
            pWriter.println(header[h]);
          }
        }
      }
      for (var i = 0; i < table.rows.length; i++) {
        var j;
        for (j = 0; j < table.rows[i].arr.length; j++) {
          if (j < table.rows[i].arr.length - 1) {
            pWriter.print(table.rows[i].arr[j] + sep);
          } else if (i < table.rows.length - 1) {
            pWriter.println(table.rows[i].arr[j]);
          } else {
            pWriter.print(table.rows[i].arr[j]);
          }
        }
      }
    } else {
      pWriter.println('<html>');
      pWriter.println('<head>');
      var str = '  <meta http-equiv="content-type" content';
      str += '="text/html;charset=utf-8" />';
      pWriter.println(str);
      pWriter.println('</head>');
      pWriter.println('<body>');
      pWriter.println('  <table>');
      if (header[0] !== '0') {
        pWriter.println('    <tr>');
        for (var k = 0; k < header.length; k++) {
          var e = escapeHelper(header[k]);
          pWriter.println('      <td>' + e);
          pWriter.println('      </td>');
        }
        pWriter.println('    </tr>');
      }
      for (var row = 0; row < table.rows.length; row++) {
        pWriter.println('    <tr>');
        for (var col = 0; col < table.columns.length; col++) {
          var entry = table.rows[row].getString(col);
          var htmlEntry = escapeHelper(entry);
          pWriter.println('      <td>' + htmlEntry);
          pWriter.println('      </td>');
        }
        pWriter.println('    </tr>');
      }
      pWriter.println('  </table>');
      pWriter.println('</body>');
      pWriter.print('</html>');
    }
    pWriter.close();
    pWriter.flush();
  };
  var escapeHelper = function (content) {
    return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };
  p5.prototype.writeFile = function (dataToDownload, filename, extension) {
    var type = 'application/octet-stream';
    if (p5.prototype._isSafari()) {
      type = 'text/plain';
    }
    var blob = new Blob(dataToDownload, { 'type': type });
    var href = window.URL.createObjectURL(blob);
    p5.prototype.downloadFile(href, filename, extension);
  };
  p5.prototype.downloadFile = function (href, fName, extension) {
    var fx = _checkFileExtension(fName, extension);
    var filename = fx[0];
    var ext = fx[1];
    var a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.onclick = destroyClickedElement;
    a.style.display = 'none';
    document.body.appendChild(a);
    if (p5.prototype._isSafari()) {
      var aText = 'Hello, Safari user! To download this file...\n';
      aText += '1. Go to File --> Save As.\n';
      aText += '2. Choose "Page Source" as the Format.\n';
      aText += '3. Name it with this extension: ."' + ext + '"';
      alert(aText);
    }
    a.click();
    href = null;
  };
  function _checkFileExtension(filename, extension) {
    if (!extension || extension === true || extension === 'true') {
      extension = '';
    }
    if (!filename) {
      filename = 'untitled';
    }
    var ext = '';
    if (filename && filename.indexOf('.') > -1) {
      ext = filename.split('.').pop();
    }
    if (extension) {
      if (ext !== extension) {
        ext = extension;
        filename = filename + '.' + ext;
      }
    }
    return [
      filename,
      ext
    ];
  }
  p5.prototype._checkFileExtension = _checkFileExtension;
  p5.prototype._isSafari = function () {
    var x = Object.prototype.toString.call(window.HTMLElement);
    return x.indexOf('Constructor') > 0;
  };
  function destroyClickedElement(event) {
    document.body.removeChild(event.target);
  }
  return p5;
}({}, amdclean['core'], amdclean['reqwest']);
amdclean['inputkeyboard'] = function (require, core) {
  'use strict';
  var p5 = core;
  var downKeys = {};
  p5.prototype.isKeyPressed = false;
  p5.prototype.keyIsPressed = false;
  p5.prototype.key = '';
  p5.prototype.keyCode = 0;
  p5.prototype._onkeydown = function (e) {
    this._setProperty('isKeyPressed', true);
    this._setProperty('keyIsPressed', true);
    this._setProperty('keyCode', e.which);
    downKeys[e.which] = true;
    var key = String.fromCharCode(e.which);
    if (!key) {
      key = e.which;
    }
    this._setProperty('key', key);
    var keyPressed = this.keyPressed || window.keyPressed;
    if (typeof keyPressed === 'function' && !e.charCode) {
      var executeDefault = keyPressed(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype._onkeyup = function (e) {
    var keyReleased = this.keyReleased || window.keyReleased;
    this._setProperty('isKeyPressed', false);
    this._setProperty('keyIsPressed', false);
    downKeys[e.which] = false;
    var key = String.fromCharCode(e.which);
    if (!key) {
      key = e.which;
    }
    this._setProperty('key', key);
    this._setProperty('keyCode', e.which);
    if (typeof keyReleased === 'function') {
      var executeDefault = keyReleased(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype._onkeypress = function (e) {
    this._setProperty('keyCode', e.which);
    this._setProperty('key', String.fromCharCode(e.which));
    var keyTyped = this.keyTyped || window.keyTyped;
    if (typeof keyTyped === 'function') {
      var executeDefault = keyTyped(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype._onblur = function (e) {
    downKeys = {};
  };
  p5.prototype.keyIsDown = function (code) {
    return downKeys[code];
  };
  return p5;
}({}, amdclean['core']);
amdclean['inputacceleration'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.deviceOrientation = undefined;
  p5.prototype.accelerationX = 0;
  p5.prototype.accelerationY = 0;
  p5.prototype.accelerationZ = 0;
  p5.prototype.pAccelerationX = 0;
  p5.prototype.pAccelerationY = 0;
  p5.prototype.pAccelerationZ = 0;
  p5.prototype._updatePAccelerations = function () {
    this._setProperty('pAccelerationX', this.accelerationX);
    this._setProperty('pAccelerationY', this.accelerationY);
    this._setProperty('pAccelerationZ', this.accelerationZ);
  };
  var move_threshold = 0.5;
  p5.prototype.setMoveThreshold = function (val) {
    if (typeof val === 'number') {
      move_threshold = val;
    }
  };
  var old_max_axis = '';
  var new_max_axis = '';
  p5.prototype._ondeviceorientation = function (e) {
    this._setProperty('accelerationX', e.beta);
    this._setProperty('accelerationY', e.gamma);
    this._setProperty('accelerationZ', e.alpha);
    this._handleMotion();
  };
  p5.prototype._ondevicemotion = function (e) {
    this._setProperty('accelerationX', e.acceleration.x * 2);
    this._setProperty('accelerationY', e.acceleration.y * 2);
    this._setProperty('accelerationZ', e.acceleration.z * 2);
    this._handleMotion();
  };
  p5.prototype._onMozOrientation = function (e) {
    this._setProperty('accelerationX', e.x);
    this._setProperty('accelerationY', e.y);
    this._setProperty('accelerationZ', e.z);
    this._handleMotion();
  };
  p5.prototype._handleMotion = function () {
    if (window.orientation === 90 || window.orientation === -90) {
      this._setProperty('deviceOrientation', 'landscape');
    } else if (window.orientation === 0) {
      this._setProperty('deviceOrientation', 'portrait');
    } else if (window.orientation === undefined) {
      this._setProperty('deviceOrientation', 'undefined');
    }
    var onDeviceMove = this.onDeviceMove || window.onDeviceMove;
    if (typeof onDeviceMove === 'function') {
      if (Math.abs(this.accelerationX - this.pAccelerationX) > move_threshold || Math.abs(this.accelerationY - this.pAccelerationY) > move_threshold || Math.abs(this.accelerationZ - this.pAccelerationZ) > move_threshold) {
        onDeviceMove();
      }
    }
    var onDeviceTurn = this.onDeviceTurn || window.onDeviceTurn;
    if (typeof onDeviceTurn === 'function') {
      var max_val = 0;
      if (Math.abs(this.accelerationX) > max_val) {
        max_val = this.accelerationX;
        new_max_axis = 'x';
      }
      if (Math.abs(this.accelerationY) > max_val) {
        max_val = this.accelerationY;
        new_max_axis = 'y';
      }
      if (Math.abs(this.accelerationZ) > max_val) {
        new_max_axis = 'z';
      }
      if (old_max_axis !== '' && old_max_axis !== new_max_axis) {
        onDeviceTurn(new_max_axis);
      }
      old_max_axis = new_max_axis;
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['inputmouse'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype.mouseX = 0;
  p5.prototype.mouseY = 0;
  p5.prototype.pmouseX = 0;
  p5.prototype.pmouseY = 0;
  p5.prototype.winMouseX = 0;
  p5.prototype.winMouseY = 0;
  p5.prototype.pwinMouseX = 0;
  p5.prototype.pwinMouseY = 0;
  p5.prototype.mouseButton = 0;
  p5.prototype.mouseIsPressed = false;
  p5.prototype.isMousePressed = false;
  p5.prototype._updateMouseCoords = function (e) {
    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
      this._setProperty('mouseX', this.touchX);
      this._setProperty('mouseY', this.touchY);
    } else {
      if (this._curElement !== null) {
        var mousePos = getMousePos(this._curElement.elt, e);
        this._setProperty('mouseX', mousePos.x);
        this._setProperty('mouseY', mousePos.y);
      }
    }
    this._setProperty('winMouseX', e.pageX);
    this._setProperty('winMouseY', e.pageY);
  };
  p5.prototype._updatePMouseCoords = function (e) {
    this._setProperty('pmouseX', this.mouseX);
    this._setProperty('pmouseY', this.mouseY);
    this._setProperty('pwinMouseX', this.winMouseX);
    this._setProperty('pwinMouseY', this.winMouseY);
  };
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  p5.prototype._setMouseButton = function (e) {
    if (e.button === 1) {
      this._setProperty('mouseButton', constants.CENTER);
    } else if (e.button === 2) {
      this._setProperty('mouseButton', constants.RIGHT);
    } else {
      this._setProperty('mouseButton', constants.LEFT);
      if (e.type === 'touchstart' || e.type === 'touchmove') {
        this._setProperty('mouseX', this.touchX);
        this._setProperty('mouseY', this.touchY);
      }
    }
  };
  p5.prototype._onmousemove = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._updateMouseCoords(e);
    if (!this.isMousePressed) {
      if (typeof context.mouseMoved === 'function') {
        executeDefault = context.mouseMoved(e);
        if (executeDefault === false) {
          e.preventDefault();
        }
      }
    } else {
      if (typeof context.mouseDragged === 'function') {
        executeDefault = context.mouseDragged(e);
        if (executeDefault === false) {
          e.preventDefault();
        }
      } else if (typeof context.touchMoved === 'function') {
        executeDefault = context.touchMoved(e);
        if (executeDefault === false) {
          e.preventDefault();
        }
        this._updateTouchCoords(e);
      }
    }
  };
  p5.prototype._onmousedown = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._setProperty('isMousePressed', true);
    this._setProperty('mouseIsPressed', true);
    this._setMouseButton(e);
    this._updateMouseCoords(e);
    if (typeof context.mousePressed === 'function') {
      executeDefault = context.mousePressed(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.touchStarted === 'function') {
      executeDefault = context.touchStarted(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateTouchCoords(e);
    }
  };
  p5.prototype._onmouseup = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._setProperty('isMousePressed', false);
    this._setProperty('mouseIsPressed', false);
    if (typeof context.mouseReleased === 'function') {
      executeDefault = context.mouseReleased(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.touchEnded === 'function') {
      executeDefault = context.touchEnded(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateTouchCoords(e);
    }
  };
  p5.prototype._onclick = function (e) {
    var context = this._isGlobal ? window : this;
    if (typeof context.mouseClicked === 'function') {
      var executeDefault = context.mouseClicked(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype._onmousewheel = p5.prototype._onDOMMouseScroll = function (e) {
    var context = this._isGlobal ? window : this;
    if (typeof context.mouseWheel === 'function') {
      var executeDefault = context.mouseWheel(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['inputtime_date'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.day = function () {
    return new Date().getDate();
  };
  p5.prototype.hour = function () {
    return new Date().getHours();
  };
  p5.prototype.minute = function () {
    return new Date().getMinutes();
  };
  p5.prototype.millis = function () {
    return new Date().getTime() - this._startTime;
  };
  p5.prototype.month = function () {
    return new Date().getMonth() + 1;
  };
  p5.prototype.second = function () {
    return new Date().getSeconds();
  };
  p5.prototype.year = function () {
    return new Date().getFullYear();
  };
  return p5;
}({}, amdclean['core']);
amdclean['inputtouch'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.touchX = 0;
  p5.prototype.touchY = 0;
  p5.prototype.ptouchX = 0;
  p5.prototype.ptouchY = 0;
  p5.prototype.touches = [];
  p5.prototype.touchIsDown = false;
  p5.prototype._updateTouchCoords = function (e) {
    if (e.type === 'mousedown' || e.type === 'mousemove' || e.type === 'mouseup') {
      this._setProperty('touchX', this.mouseX);
      this._setProperty('touchY', this.mouseY);
    } else {
      var touchPos = getTouchPos(this._curElement.elt, e, 0);
      this._setProperty('touchX', touchPos.x);
      this._setProperty('touchY', touchPos.y);
      var touches = [];
      for (var i = 0; i < e.touches.length; i++) {
        var pos = getTouchPos(this._curElement.elt, e, i);
        touches[i] = {
          x: pos.x,
          y: pos.y
        };
      }
      this._setProperty('touches', touches);
    }
  };
  p5.prototype._updatePTouchCoords = function () {
    this._setProperty('ptouchX', this.touchX);
    this._setProperty('ptouchY', this.touchY);
  };
  function getTouchPos(canvas, e, i) {
    i = i || 0;
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[i] || e.changedTouches[i];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }
  p5.prototype._ontouchstart = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._updateTouchCoords(e);
    this._setProperty('touchIsDown', true);
    if (typeof context.touchStarted === 'function') {
      executeDefault = context.touchStarted(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.mousePressed === 'function') {
      executeDefault = context.mousePressed(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype._ontouchmove = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._updateTouchCoords(e);
    if (typeof context.touchMoved === 'function') {
      executeDefault = context.touchMoved(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.mouseDragged === 'function') {
      executeDefault = context.mouseDragged(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateMouseCoords(e);
    }
  };
  p5.prototype._ontouchend = function (e) {
    this._updateTouchCoords(e);
    if (this.touches.length === 0) {
      this._setProperty('touchIsDown', false);
    }
    var context = this._isGlobal ? window : this;
    var executeDefault;
    if (typeof context.touchEnded === 'function') {
      executeDefault = context.touchEnded(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.mouseReleased === 'function') {
      executeDefault = context.mouseReleased(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateMouseCoords(e);
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathmath'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.createVector = function (x, y, z) {
    if (this instanceof p5) {
      return new p5.Vector(this, arguments);
    } else {
      return new p5.Vector(x, y, z);
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathcalculation'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.abs = Math.abs;
  p5.prototype.ceil = Math.ceil;
  p5.prototype.constrain = function (n, low, high) {
    return Math.max(Math.min(n, high), low);
  };
  p5.prototype.dist = function (x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  };
  p5.prototype.exp = Math.exp;
  p5.prototype.floor = Math.floor;
  p5.prototype.lerp = function (start, stop, amt) {
    return amt * (stop - start) + start;
  };
  p5.prototype.log = Math.log;
  p5.prototype.mag = function (x, y) {
    return Math.sqrt(x * x + y * y);
  };
  p5.prototype.map = function (n, start1, stop1, start2, stop2) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  };
  p5.prototype.max = function () {
    if (arguments[0] instanceof Array) {
      return Math.max.apply(null, arguments[0]);
    } else {
      return Math.max.apply(null, arguments);
    }
  };
  p5.prototype.min = function () {
    if (arguments[0] instanceof Array) {
      return Math.min.apply(null, arguments[0]);
    } else {
      return Math.min.apply(null, arguments);
    }
  };
  p5.prototype.norm = function (n, start, stop) {
    return this.map(n, start, stop, 0, 1);
  };
  p5.prototype.pow = Math.pow;
  p5.prototype.round = Math.round;
  p5.prototype.sq = function (n) {
    return n * n;
  };
  p5.prototype.sqrt = Math.sqrt;
  return p5;
}({}, amdclean['core']);
amdclean['mathrandom'] = function (require, core) {
  'use strict';
  var p5 = core;
  var seeded = false;
  var lcg = function () {
      var m = 4294967296, a = 1664525, c = 1013904223, seed, z;
      return {
        setSeed: function (val) {
          z = seed = (val == null ? Math.random() * m : val) >>> 0;
        },
        getSeed: function () {
          return seed;
        },
        rand: function () {
          z = (a * z + c) % m;
          return z / m;
        }
      };
    }();
  p5.prototype.randomSeed = function (seed) {
    lcg.setSeed(seed);
    seeded = true;
  };
  p5.prototype.random = function (min, max) {
    var rand;
    if (seeded) {
      rand = lcg.rand();
    } else {
      rand = Math.random();
    }
    if (arguments.length === 0) {
      return rand;
    } else if (arguments.length === 1) {
      return rand * min;
    } else {
      if (min > max) {
        var tmp = min;
        min = max;
        max = tmp;
      }
      return rand * (max - min) + min;
    }
  };
  var y2;
  var previous = false;
  p5.prototype.randomGaussian = function (mean, sd) {
    var y1, x1, x2, w;
    if (previous) {
      y1 = y2;
      previous = false;
    } else {
      do {
        x1 = this.random(2) - 1;
        x2 = this.random(2) - 1;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1);
      w = Math.sqrt(-2 * Math.log(w) / w);
      y1 = x1 * w;
      y2 = x2 * w;
      previous = true;
    }
    var m = mean || 0;
    var s = sd || 1;
    return y1 * s + m;
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathnoise'] = function (require, core) {
  'use strict';
  var p5 = core;
  var PERLIN_YWRAPB = 4;
  var PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
  var PERLIN_ZWRAPB = 8;
  var PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
  var PERLIN_SIZE = 4095;
  var perlin_octaves = 4;
  var perlin_amp_falloff = 0.5;
  var SINCOS_PRECISION = 0.5;
  var SINCOS_LENGTH = Math.floor(360 / SINCOS_PRECISION);
  var sinLUT = new Array(SINCOS_LENGTH);
  var cosLUT = new Array(SINCOS_LENGTH);
  var DEG_TO_RAD = Math.PI / 180;
  for (var i = 0; i < SINCOS_LENGTH; i++) {
    sinLUT[i] = Math.sin(i * DEG_TO_RAD * SINCOS_PRECISION);
    cosLUT[i] = Math.cos(i * DEG_TO_RAD * SINCOS_PRECISION);
  }
  var perlin_PI = SINCOS_LENGTH;
  perlin_PI >>= 1;
  var perlin;
  p5.prototype.noise = function (x, y, z) {
    y = y || 0;
    z = z || 0;
    if (perlin == null) {
      perlin = new Array(PERLIN_SIZE + 1);
      for (var i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = Math.random();
      }
    }
    if (x < 0) {
      x = -x;
    }
    if (y < 0) {
      y = -y;
    }
    if (z < 0) {
      z = -z;
    }
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi;
    var yf = y - yi;
    var zf = z - zi;
    var rxf, ryf;
    var r = 0;
    var ampl = 0.5;
    var n1, n2, n3;
    var noise_fsc = function (i) {
      return 0.5 * (1 - cosLUT[Math.floor(i * perlin_PI) % SINCOS_LENGTH]);
    };
    for (var o = 0; o < perlin_octaves; o++) {
      var of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
      rxf = noise_fsc(xf);
      ryf = noise_fsc(yf);
      n1 = perlin[of & PERLIN_SIZE];
      n1 += rxf * (perlin[of + 1 & PERLIN_SIZE] - n1);
      n2 = perlin[of + PERLIN_YWRAP & PERLIN_SIZE];
      n2 += rxf * (perlin[of + PERLIN_YWRAP + 1 & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);
      of += PERLIN_ZWRAP;
      n2 = perlin[of & PERLIN_SIZE];
      n2 += rxf * (perlin[of + 1 & PERLIN_SIZE] - n2);
      n3 = perlin[of + PERLIN_YWRAP & PERLIN_SIZE];
      n3 += rxf * (perlin[of + PERLIN_YWRAP + 1 & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);
      n1 += noise_fsc(zf) * (n2 - n1);
      r += n1 * ampl;
      ampl *= perlin_amp_falloff;
      xi <<= 1;
      xf *= 2;
      yi <<= 1;
      yf *= 2;
      zi <<= 1;
      zf *= 2;
      if (xf >= 1) {
        xi++;
        xf--;
      }
      if (yf >= 1) {
        yi++;
        yf--;
      }
      if (zf >= 1) {
        zi++;
        zf--;
      }
    }
    return r;
  };
  p5.prototype.noiseDetail = function (lod, falloff) {
    if (lod > 0) {
      perlin_octaves = lod;
    }
    if (falloff > 0) {
      perlin_amp_falloff = falloff;
    }
  };
  p5.prototype.noiseSeed = function (seed) {
    var lcg = function () {
        var m = 4294967296, a = 1664525, c = 1013904223, seed, z;
        return {
          setSeed: function (val) {
            z = seed = (val == null ? Math.random() * m : val) >>> 0;
          },
          getSeed: function () {
            return seed;
          },
          rand: function () {
            z = (a * z + c) % m;
            return z / m;
          }
        };
      }();
    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (var i = 0; i < PERLIN_SIZE + 1; i++) {
      perlin[i] = lcg.rand();
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathtrigonometry'] = function (require, core, polargeometry, constants) {
  'use strict';
  var p5 = core;
  var polarGeometry = polargeometry;
  var constants = constants;
  p5.prototype._angleMode = constants.RADIANS;
  p5.prototype.acos = function (ratio) {
    if (this._angleMode === constants.RADIANS) {
      return Math.acos(ratio);
    } else {
      return polarGeometry.radiansToDegrees(Math.acos(ratio));
    }
  };
  p5.prototype.asin = function (ratio) {
    if (this._angleMode === constants.RADIANS) {
      return Math.asin(ratio);
    } else {
      return polarGeometry.radiansToDegrees(Math.asin(ratio));
    }
  };
  p5.prototype.atan = function (ratio) {
    if (this._angleMode === constants.RADIANS) {
      return Math.atan(ratio);
    } else {
      return polarGeometry.radiansToDegrees(Math.atan(ratio));
    }
  };
  p5.prototype.atan2 = function (y, x) {
    if (this._angleMode === constants.RADIANS) {
      return Math.atan2(y, x);
    } else {
      return polarGeometry.radiansToDegrees(Math.atan2(y, x));
    }
  };
  p5.prototype.cos = function (angle) {
    if (this._angleMode === constants.RADIANS) {
      return Math.cos(angle);
    } else {
      return Math.cos(this.radians(angle));
    }
  };
  p5.prototype.sin = function (angle) {
    if (this._angleMode === constants.RADIANS) {
      return Math.sin(angle);
    } else {
      return Math.sin(this.radians(angle));
    }
  };
  p5.prototype.tan = function (angle) {
    if (this._angleMode === constants.RADIANS) {
      return Math.tan(angle);
    } else {
      return Math.tan(this.radians(angle));
    }
  };
  p5.prototype.degrees = function (angle) {
    return polarGeometry.radiansToDegrees(angle);
  };
  p5.prototype.radians = function (angle) {
    return polarGeometry.degreesToRadians(angle);
  };
  p5.prototype.angleMode = function (mode) {
    if (mode === constants.DEGREES || mode === constants.RADIANS) {
      this._angleMode = mode;
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['polargeometry'], amdclean['constants']);
amdclean['renderingrendering'] = function (require, core, constants, p5Graphics2D, p5Graphics3D) {
  var p5 = core;
  var constants = constants;
  p5.prototype.createCanvas = function (w, h, renderer) {
    var r = renderer || constants.P2D;
    var isDefault, c;
    if (arguments[3]) {
      isDefault = typeof arguments[3] === 'boolean' ? arguments[3] : false;
    }
    if (r === constants.WEBGL) {
      c = document.getElementById('defaultCanvas');
      if (c) {
        c.parentNode.removeChild(c);
      }
      c = document.createElement('canvas');
      c.id = 'defaultCanvas';
    } else {
      if (isDefault) {
        c = document.createElement('canvas');
        c.id = 'defaultCanvas';
      } else {
        c = this.canvas;
      }
    }
    if (!this._setupDone) {
      c.className += ' p5_hidden';
      c.style.visibility = 'hidden';
    }
    if (this._userNode) {
      this._userNode.appendChild(c);
    } else {
      document.body.appendChild(c);
    }
    if (r === constants.WEBGL) {
      if (!this._defaultGraphics) {
        this._graphics = new p5.Graphics3D(c, this, true);
        this._defaultGraphics = this._graphics;
        this._elements.push(this._defaultGraphics);
      }
    } else {
      if (!this._defaultGraphics) {
        this._graphics = new p5.Graphics2D(c, this, true);
        this._defaultGraphics = this._graphics;
        this._elements.push(this._defaultGraphics);
      }
    }
    this._defaultGraphics.resize(w, h);
    this._defaultGraphics._applyDefaults();
    return this._defaultGraphics;
  };
  p5.prototype.resizeCanvas = function (w, h, noRedraw) {
    if (this._graphics) {
      this._graphics.resize(w, h);
      this._graphics._applyDefaults();
      if (!noRedraw) {
        this.redraw();
      }
    }
  };
  p5.prototype.noCanvas = function () {
    if (this.canvas) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  };
  p5.prototype.createGraphics = function (w, h, renderer) {
    if (renderer === constants.WEBGL) {
      return this._createGraphics3D(w, h);
    } else {
      return this._createGraphics2D(w, h);
    }
  };
  p5.prototype._createGraphics2D = function (w, h) {
    var c = document.createElement('canvas');
    var node = this._userNode || document.body;
    node.appendChild(c);
    var pg = new p5.Graphics2D(c, this, false);
    this._elements.push(pg);
    for (var p in p5.prototype) {
      if (!pg[p]) {
        if (typeof p5.prototype[p] === 'function') {
          pg[p] = p5.prototype[p].bind(pg);
        } else {
          pg[p] = p5.prototype[p];
        }
      }
    }
    pg.resize(w, h);
    pg._applyDefaults();
    return pg;
  };
  p5.prototype._createGraphics3D = function (w, h) {
    var c = document.createElement('canvas');
    var node = this._userNode || document.body;
    node.appendChild(c);
    var pg = new p5.Graphics3D(c, this, false);
    this._elements.push(pg);
    for (var p in p5.prototype) {
      if (!pg.hasOwnProperty(p)) {
        if (typeof p5.prototype[p] === 'function') {
          pg[p] = p5.prototype[p].bind(pg);
        } else {
          pg[p] = p5.prototype[p];
        }
      }
    }
    pg.resize(w, h);
    pg._applyDefaults();
    return pg;
  };
  p5.prototype.blendMode = function (mode) {
    if (mode === constants.BLEND || mode === constants.DARKEST || mode === constants.LIGHTEST || mode === constants.DIFFERENCE || mode === constants.MULTIPLY || mode === constants.EXCLUSION || mode === constants.SCREEN || mode === constants.REPLACE || mode === constants.OVERLAY || mode === constants.HARD_LIGHT || mode === constants.SOFT_LIGHT || mode === constants.DODGE || mode === constants.BURN || mode === constants.ADD || mode === constants.NORMAL) {
      this.drawingContext.globalCompositeOperation = mode;
    } else {
      throw new Error('Mode ' + mode + ' not recognized.');
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['constants'], amdclean['p5Graphics2D'], amdclean['p5Graphics3D']);
amdclean['shape2d_primitives'] = function (require, core, constants, helpers) {
  'use strict';
  var p5 = core;
  var constants = constants;
  var EPSILON = 0.00001;
  p5.prototype._createArc = function (radius, startAngle, endAngle) {
    var twoPI = Math.PI * 2;
    var curves = [];
    var piOverTwo = Math.PI / 2;
    var sgn = startAngle < endAngle ? 1 : -1;
    var a1 = startAngle;
    var totalAngle = Math.min(twoPI, Math.abs(endAngle - startAngle));
    while (totalAngle > EPSILON) {
      var a2 = a1 + sgn * Math.min(totalAngle, piOverTwo);
      curves.push(this._createSmallArc(radius, a1, a2));
      totalAngle -= Math.abs(a2 - a1);
      a1 = a2;
    }
    return curves;
  };
  p5.prototype._createSmallArc = function (r, a1, a2) {
    var a = (a2 - a1) / 2;
    var x4 = r * Math.cos(a);
    var y4 = r * Math.sin(a);
    var x1 = x4;
    var y1 = -y4;
    var k = 0.5522847498;
    var f = k * Math.tan(a);
    var x2 = x1 + f * y4;
    var y2 = y1 + f * x4;
    var x3 = x2;
    var y3 = -y2;
    var ar = a + a1;
    var cos_ar = Math.cos(ar);
    var sin_ar = Math.sin(ar);
    return {
      x1: r * Math.cos(a1),
      y1: r * Math.sin(a1),
      x2: x2 * cos_ar - y2 * sin_ar,
      y2: x2 * sin_ar + y2 * cos_ar,
      x3: x3 * cos_ar - y3 * sin_ar,
      y3: x3 * sin_ar + y3 * cos_ar,
      x4: r * Math.cos(a2),
      y4: r * Math.sin(a2)
    };
  };
  p5.prototype.arc = function (x, y, width, height, start, stop, mode) {
    if (!this._doStroke && !this._doFill) {
      return this;
    }
    if (this._angleMode === constants.DEGREES) {
      start = this.radians(start);
      stop = this.radians(stop);
    }
    var curves = this._createArc(1, start, stop);
    this._graphics.arc(x, y, width, height, start, stop, mode, curves);
    return this;
  };
  p5.prototype.ellipse = function (x, y, w, h) {
    this._validateParameters('ellipse', arguments, [
      'Number',
      'Number',
      'Number',
      'Number'
    ]);
    if (!this._doStroke && !this._doFill) {
      return this;
    }
    w = Math.abs(w);
    h = Math.abs(h);
    this._graphics.ellipse(x, y, w, h);
    return this;
  };
  p5.prototype.line = function () {
    this._validateParameters('line', arguments, [
      [
        'Number',
        'Number',
        'Number',
        'Number'
      ],
      [
        'Number',
        'Number',
        'Number',
        'Number',
        'Number',
        'Number'
      ]
    ]);
    if (!this._doStroke) {
      return this;
    }
    if (this._graphics.isP3D) {
      this._graphics.line(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
    } else {
      this._graphics.line(arguments[0], arguments[1], arguments[2], arguments[3]);
    }
  };
  p5.prototype.point = function (x, y) {
    this._validateParameters('point', arguments, [
      'Number',
      'Number'
    ]);
    if (!this._doStroke) {
      return this;
    }
    this._graphics.point(x, y);
    return this;
  };
  p5.prototype.quad = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    this._validateParameters('quad', arguments, [
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number'
    ]);
    if (!this._doStroke && !this._doFill) {
      return this;
    }
    this._graphics.quad(x1, y1, x2, y2, x3, y3, x4, y4);
    return this;
  };
  p5.prototype.rect = function (x, y, w, h, tl, tr, br, bl) {
    this._validateParameters('rect', arguments, [
      [
        'Number',
        'Number',
        'Number',
        'Number'
      ],
      [
        'Number',
        'Number',
        'Number',
        'Number',
        'Number'
      ],
      [
        'Number',
        'Number',
        'Number',
        'Number',
        'Number',
        'Number',
        'Number',
        'Number',
        'Number'
      ]
    ]);
    if (!this._doStroke && !this._doFill) {
      return;
    }
    this._graphics.rect(x, y, w, h, tl, tr, br, bl);
    return this;
  };
  p5.prototype.triangle = function (x1, y1, x2, y2, x3, y3) {
    this._validateParameters('triangle', arguments, [
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number'
    ]);
    if (!this._doStroke && !this._doFill) {
      return this;
    }
    this._graphics.triangle(x1, y1, x2, y2, x3, y3);
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants'], amdclean['helpers']);
amdclean['shape3d_primitives'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.Geometry3D = function () {
    this.vertices = [];
    this.faces = [];
    this.faceNormals = [];
    this.uvs = [];
  };
  p5.prototype.plane = function (width, height, detailX, detailY) {
    p5.prototype.Geometry3D.call(this);
    width = width || 1;
    height = height || 1;
    detailX = detailX || 1;
    detailY = detailY || 1;
    for (var y = 0; y <= detailY; y++) {
      var t = y / detailY;
      for (var x = 0; x <= detailX; x++) {
        var s = x / detailX;
        this.vertices.push([
          2 * width * s - width,
          2 * height * t - height,
          0
        ]);
        this.uvs.push([
          s,
          t
        ]);
        this.faceNormals.push([
          0,
          0,
          1
        ]);
        if (x < detailX && y < detailY) {
          var i = x + y * (detailX + 1);
          this.faces.push([
            i,
            i + 1,
            i + detailX + 1
          ]);
          this.faces.push([
            i + detailX + 1,
            i + 1,
            i + detailX + 2
          ]);
        }
      }
    }
    var vertices = verticesArray(this.faces, this.vertices);
    this._graphics.drawGeometry(vertices);
    return this;
  };
  p5.prototype.cube = function (width, height, depth, detailX, detailY, detailZ) {
    p5.prototype.Geometry3D.call(this);
    width = width || 1;
    height = height || 1;
    depth = depth || 1;
    detailX = detailX || 1;
    detailY = detailY || 1;
    detailZ = detailZ || 1;
    for (var y1 = 0; y1 <= detailY; y1++) {
      var t1 = y1 / detailY;
      for (var x1 = 0; x1 <= detailX; x1++) {
        var s1 = x1 / detailX;
        this.vertices.push([
          2 * width * s1 - width,
          2 * height * t1 - height,
          depth / 2
        ]);
        this.uvs.push([
          s1,
          t1
        ]);
        this.faceNormals.push([
          0,
          0,
          1
        ]);
        if (x1 < detailX && y1 < detailY) {
          var i1 = x1 + y1 * (detailX + 1);
          this.faces.push([
            i1,
            i1 + 1,
            i1 + detailX + 1
          ]);
          this.faces.push([
            i1 + detailX + 1,
            i1 + 1,
            i1 + detailX + 2
          ]);
        }
      }
    }
    for (var y2 = 0; y2 <= detailY; y2++) {
      var t2 = y2 / detailY;
      for (var x2 = 0; x2 <= detailX; x2++) {
        var s2 = x2 / detailX;
        this.vertices.push([
          2 * width * s2 - width,
          2 * height * t2 - height,
          -depth / 2
        ]);
        this.uvs.push([
          s2,
          t2
        ]);
        this.faceNormals.push([
          0,
          0,
          -1
        ]);
        if (x2 < detailX && y2 < detailY) {
          var i2 = x2 + y2 * (detailX + 1);
          this.faces.push([
            i2,
            i2 + 1,
            i2 + detailX + 1
          ]);
          this.faces.push([
            i2 + detailX + 1,
            i2 + 1,
            i2 + detailX + 2
          ]);
        }
      }
    }
    var vertices = verticesArray(this.faces, this.vertices);
    this._graphics.drawGeometry(vertices);
    return this;
  };
  p5.prototype.sphere = function (radius, detailX, detailY, detalZ) {
    p5.prototype.Geometry3D.call(this);
    radius = radius || 6;
    detailX = detailX || 1;
    detailY = detailY || 1;
    var vertices = verticesArray(this.faces, this.vertices);
    this._graphics.drawGeometry(vertices);
    return this;
  };
  function verticesArray(faces, vertices) {
    var output = [];
    faces.forEach(function (face) {
      face.forEach(function (index) {
        vertices[index].forEach(function (vertex) {
          output.push(vertex);
        });
      });
    });
    return output;
  }
  return p5;
}({}, amdclean['core']);
amdclean['shapeattributes'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._rectMode = constants.CORNER;
  p5.prototype._ellipseMode = constants.CENTER;
  p5.prototype.ellipseMode = function (m) {
    if (m === constants.CORNER || m === constants.CORNERS || m === constants.RADIUS || m === constants.CENTER) {
      this._ellipseMode = m;
    }
    return this;
  };
  p5.prototype.noSmooth = function () {
    this._graphics.noSmooth();
    return this;
  };
  p5.prototype.rectMode = function (m) {
    if (m === constants.CORNER || m === constants.CORNERS || m === constants.RADIUS || m === constants.CENTER) {
      this._rectMode = m;
    }
    return this;
  };
  p5.prototype.smooth = function () {
    this._graphics.smooth();
    return this;
  };
  p5.prototype.strokeCap = function (cap) {
    if (cap === constants.ROUND || cap === constants.SQUARE || cap === constants.PROJECT) {
      this._graphics.strokeCap(cap);
    }
    return this;
  };
  p5.prototype.strokeJoin = function (join) {
    if (join === constants.ROUND || join === constants.BEVEL || join === constants.MITER) {
      this._graphics.strokeJoin(join);
    }
    return this;
  };
  p5.prototype.strokeWeight = function (w) {
    this._graphics.strokeWeight(w);
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['shapecurves'] = function (require, core, helpers) {
  'use strict';
  var p5 = core;
  var bezierDetail = 20;
  var curveDetail = 20;
  p5.prototype._curveTightness = 0;
  p5.prototype.bezier = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    this._validateParameters('bezier', arguments, [
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number'
    ]);
    if (!this._doStroke) {
      return this;
    }
    this._graphics.bezier(x1, y1, x2, y2, x3, y3, x4, y4);
    return this;
  };
  p5.prototype.bezierDetail = function (d) {
    bezierDetail = d;
    return this;
  };
  p5.prototype.bezierPoint = function (a, b, c, d, t) {
    var adjustedT = 1 - t;
    return Math.pow(adjustedT, 3) * a + 3 * Math.pow(adjustedT, 2) * t * b + 3 * adjustedT * Math.pow(t, 2) * c + Math.pow(t, 3) * d;
  };
  p5.prototype.bezierTangent = function (a, b, c, d, t) {
    var adjustedT = 1 - t;
    return 3 * d * Math.pow(t, 2) - 3 * c * Math.pow(t, 2) + 6 * c * adjustedT * t - 6 * b * adjustedT * t + 3 * b * Math.pow(adjustedT, 2) - 3 * a * Math.pow(adjustedT, 2);
  };
  p5.prototype.curve = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    this._validateParameters('curve', arguments, [
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number',
      'Number'
    ]);
    if (!this._doStroke) {
      return;
    }
    this._graphics.curve(x1, y1, x2, y2, x3, y3, x4, y4);
    return this;
  };
  p5.prototype.curveDetail = function (d) {
    curveDetail = d;
    return this;
  };
  p5.prototype.curveTightness = function (t) {
    this._setProperty('_curveTightness', t);
  };
  p5.prototype.curvePoint = function (a, b, c, d, t) {
    var t3 = t * t * t, t2 = t * t, f1 = -0.5 * t3 + t2 - 0.5 * t, f2 = 1.5 * t3 - 2.5 * t2 + 1, f3 = -1.5 * t3 + 2 * t2 + 0.5 * t, f4 = 0.5 * t3 - 0.5 * t2;
    return a * f1 + b * f2 + c * f3 + d * f4;
  };
  p5.prototype.curveTangent = function (a, b, c, d, t) {
    var t2 = t * t, f1 = -3 * t2 / 2 + 2 * t - 0.5, f2 = 9 * t2 / 2 - 5 * t, f3 = -9 * t2 / 2 + 4 * t + 0.5, f4 = 3 * t2 / 2 - t;
    return a * f1 + b * f2 + c * f3 + d * f4;
  };
  return p5;
}({}, amdclean['core'], amdclean['helpers']);
amdclean['shapevertex'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  var shapeKind = null;
  var vertices = [];
  var contourVertices = [];
  var isBezier = false;
  var isCurve = false;
  var isQuadratic = false;
  var isContour = false;
  p5.prototype.beginContour = function () {
    contourVertices = [];
    isContour = true;
    return this;
  };
  p5.prototype.beginShape = function (kind) {
    if (kind === constants.POINTS || kind === constants.LINES || kind === constants.TRIANGLES || kind === constants.TRIANGLE_FAN || kind === constants.TRIANGLE_STRIP || kind === constants.QUADS || kind === constants.QUAD_STRIP) {
      shapeKind = kind;
    } else {
      shapeKind = null;
    }
    vertices = [];
    contourVertices = [];
    return this;
  };
  p5.prototype.bezierVertex = function (x2, y2, x3, y3, x4, y4) {
    if (vertices.length === 0) {
      throw 'vertex() must be used once before calling bezierVertex()';
    } else {
      isBezier = true;
      var vert = [];
      for (var i = 0; i < arguments.length; i++) {
        vert[i] = arguments[i];
      }
      vert.isVert = false;
      if (isContour) {
        contourVertices.push(vert);
      } else {
        vertices.push(vert);
      }
    }
    return this;
  };
  p5.prototype.curveVertex = function (x, y) {
    isCurve = true;
    this.vertex(x, y);
    return this;
  };
  p5.prototype.endContour = function () {
    var vert = contourVertices[0].slice();
    vert.isVert = contourVertices[0].isVert;
    vert.moveTo = false;
    contourVertices.push(vert);
    vertices.push(vertices[0]);
    for (var i = 0; i < contourVertices.length; i++) {
      vertices.push(contourVertices[i]);
    }
    return this;
  };
  p5.prototype.endShape = function (mode) {
    if (vertices.length === 0) {
      return this;
    }
    if (!this._doStroke && !this._doFill) {
      return this;
    }
    var closeShape = mode === constants.CLOSE;
    if (closeShape && !isContour) {
      vertices.push(vertices[0]);
    }
    this._graphics.endShape(mode, vertices, isCurve, isBezier, isQuadratic, isContour, shapeKind);
    isCurve = false;
    isBezier = false;
    isQuadratic = false;
    isContour = false;
    if (closeShape) {
      vertices.pop();
    }
    return this;
  };
  p5.prototype.quadraticVertex = function (cx, cy, x3, y3) {
    if (this._contourInited) {
      var pt = {};
      pt.x = cx;
      pt.y = cy;
      pt.x3 = x3;
      pt.y3 = y3;
      pt.type = constants.QUADRATIC;
      this._contourVertices.push(pt);
      return this;
    }
    if (vertices.length > 0) {
      isQuadratic = true;
      var vert = [];
      for (var i = 0; i < arguments.length; i++) {
        vert[i] = arguments[i];
      }
      vert.isVert = false;
      if (isContour) {
        contourVertices.push(vert);
      } else {
        vertices.push(vert);
      }
    } else {
      throw 'vertex() must be used once before calling quadraticVertex()';
    }
    return this;
  };
  p5.prototype.vertex = function (x, y, moveTo) {
    var vert = [];
    vert.isVert = true;
    vert[0] = x;
    vert[1] = y;
    vert[2] = 0;
    vert[3] = 0;
    vert[4] = 0;
    vert[5] = this._graphics._getFill();
    vert[6] = this._graphics._getStroke();
    if (moveTo) {
      vert.moveTo = moveTo;
    }
    if (isContour) {
      if (contourVertices.length === 0) {
        vert.moveTo = true;
      }
      contourVertices.push(vert);
    } else {
      vertices.push(vert);
    }
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['structure'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.exit = function () {
    throw 'exit() not implemented, see remove()';
  };
  p5.prototype.noLoop = function () {
    this._loop = false;
    if (this._drawInterval) {
      clearInterval(this._drawInterval);
    }
  };
  p5.prototype.loop = function () {
    this._loop = true;
    this._draw();
  };
  p5.prototype.push = function () {
    this._graphics.push();
    this._styles.push({
      doStroke: this._doStroke,
      doFill: this._doFill,
      tint: this._tint,
      imageMode: this._imageMode,
      rectMode: this._rectMode,
      ellipseMode: this._ellipseMode,
      colorMode: this._colorMode,
      textFont: this.textFont,
      textLeading: this.textLeading,
      textSize: this.textSize,
      textStyle: this.textStyle
    });
  };
  p5.prototype.pop = function () {
    this._graphics.pop();
    var lastS = this._styles.pop();
    this._doStroke = lastS.doStroke;
    this._doFill = lastS.doFill;
    this._tint = lastS.tint;
    this._imageMode = lastS.imageMode;
    this._rectMode = lastS.rectMode;
    this._ellipseMode = lastS.ellipseMode;
    this._colorMode = lastS.colorMode;
    this.textFont = lastS.textFont;
    this.textLeading = lastS.textLeading;
    this.textSize = lastS.textSize;
    this.textStyle = lastS.textStyle;
  };
  p5.prototype.pushStyle = function () {
    throw new Error('pushStyle() not used, see push()');
  };
  p5.prototype.popStyle = function () {
    throw new Error('popStyle() not used, see pop()');
  };
  p5.prototype.redraw = function () {
    var userSetup = this.setup || window.setup;
    var userDraw = this.draw || window.draw;
    if (typeof userDraw === 'function') {
      this.push();
      if (typeof userSetup === 'undefined') {
        this.scale(this.pixelDensity, this.pixelDensity);
      }
      this._registeredMethods.pre.forEach(function (f) {
        f.call(this);
      });
      userDraw();
      this._registeredMethods.post.forEach(function (f) {
        f.call(this);
      });
      this.pop();
    }
  };
  p5.prototype.size = function () {
    throw 'size() not implemented, see createCanvas()';
  };
  return p5;
}({}, amdclean['core']);
amdclean['transform'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype.applyMatrix = function (n00, n01, n02, n10, n11, n12) {
    this._graphics.applyMatrix(n00, n01, n02, n10, n11, n12);
    return this;
  };
  p5.prototype.popMatrix = function () {
    throw new Error('popMatrix() not used, see pop()');
  };
  p5.prototype.printMatrix = function () {
    throw new Error('printMatrix() not implemented');
  };
  p5.prototype.pushMatrix = function () {
    throw new Error('pushMatrix() not used, see push()');
  };
  p5.prototype.resetMatrix = function () {
    this._graphics.resetMatrix();
    return this;
  };
  p5.prototype.rotate = function (r) {
    if (this._angleMode === constants.DEGREES) {
      r = this.radians(r);
    }
    this._graphics.rotate(r);
    return this;
  };
  p5.prototype.rotateX = function (rad) {
    if (this._graphics.isP3D) {
      this._graphics.rotateX(rad);
    } else {
      throw 'not yet implemented.';
    }
    return this;
  };
  p5.prototype.rotateY = function (rad) {
    if (this._graphics.isP3D) {
      this._graphics.rotateY(rad);
    } else {
      throw 'not yet implemented.';
    }
    return this;
  };
  p5.prototype.rotateZ = function (rad) {
    if (this._graphics.isP3D) {
      this._graphics.rotateZ(rad);
    } else {
      throw 'not supported in p2d. Please use webgl mode';
    }
    return this;
  };
  p5.prototype.scale = function () {
    if (this._graphics.isP3D) {
      this._graphics.scale(arguments[0], arguments[1], arguments[2]);
    } else {
      this._graphics.scale.apply(this._graphics, arguments);
    }
    return this;
  };
  p5.prototype.shearX = function (angle) {
    if (this._angleMode === constants.DEGREES) {
      angle = this.radians(angle);
    }
    this._graphics.shearX(angle);
    return this;
  };
  p5.prototype.shearY = function (angle) {
    if (this._angleMode === constants.DEGREES) {
      angle = this.radians(angle);
    }
    this._graphics.shearY(angle);
    return this;
  };
  p5.prototype.translate = function (x, y, z) {
    if (this._graphics.isP3D) {
      this._graphics.translate(x, y, z);
    } else {
      this._graphics.translate(x, y);
    }
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['typographyattributes'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._textLeading = 15;
  p5.prototype._textFont = 'sans-serif';
  p5.prototype._textSize = 12;
  p5.prototype._textStyle = constants.NORMAL;
  p5.prototype._textAscent = null;
  p5.prototype._textDescent = null;
  p5.prototype.textAlign = function (h, v) {
    this._graphics.textAlign(h, v);
  };
  p5.prototype.textLeading = function (l) {
    this._setProperty('_textLeading', l);
  };
  p5.prototype.textSize = function (s) {
    this._setProperty('_textSize', s);
    this._setProperty('_textLeading', s * 1.25);
    this._applyTextProperties();
  };
  p5.prototype.textStyle = function (s) {
    if (s === constants.NORMAL || s === constants.ITALIC || s === constants.BOLD) {
      this._setProperty('_textStyle', s);
      this._applyTextProperties();
    }
  };
  p5.prototype.textWidth = function (s) {
    return this._graphics.textWidth(s);
  };
  p5.prototype.textAscent = function () {
    if (this._textAscent == null) {
      this._updateTextMetrics();
    }
    return this._textAscent;
  };
  p5.prototype.textDescent = function () {
    if (this._textDescent == null) {
      this._updateTextMetrics();
    }
    return this._textDescent;
  };
  p5.prototype._applyTextProperties = function () {
    this._setProperty('_textAscent', null);
    this._setProperty('_textDescent', null);
    this._graphics._applyTextProperties(this._textStyle, this._textSize, this._textFont);
  };
  p5.prototype._updateTextMetrics = function () {
    var text = document.createElement('span');
    text.style.fontFamily = this._textFont;
    text.style.fontSize = this._textSize + 'px';
    text.innerHTML = 'ABCjgq|';
    var block = document.createElement('div');
    block.style.display = 'inline-block';
    block.style.width = '1px';
    block.style.height = '0px';
    var container = document.createElement('div');
    container.appendChild(text);
    container.appendChild(block);
    container.style.height = '0px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
    block.style.verticalAlign = 'baseline';
    var blockOffset = this._calculateOffset(block);
    var textOffset = this._calculateOffset(text);
    var ascent = blockOffset[1] - textOffset[1];
    block.style.verticalAlign = 'bottom';
    blockOffset = this._calculateOffset(block);
    textOffset = this._calculateOffset(text);
    var height = blockOffset[1] - textOffset[1];
    var descent = height - ascent;
    document.body.removeChild(container);
    this._setProperty('_textAscent', ascent);
    this._setProperty('_textDescent', descent);
  };
  p5.prototype._calculateOffset = function (object) {
    var currentLeft = 0, currentTop = 0;
    if (object.offsetParent) {
      do {
        currentLeft += object.offsetLeft;
        currentTop += object.offsetTop;
      } while (object = object.offsetParent);
    } else {
      currentLeft += object.offsetLeft;
      currentTop += object.offsetTop;
    }
    return [
      currentLeft,
      currentTop
    ];
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['typographyloading_displaying'] = function (require, core, helpers) {
  'use strict';
  var p5 = core;
  p5.prototype.text = function (str, x, y, maxWidth, maxHeight) {
    this._validateParameters('text', arguments, [
      [
        'String',
        'Number',
        'Number'
      ],
      [
        'String',
        'Number',
        'Number',
        'Number',
        'Number'
      ]
    ]);
    if (typeof str !== 'string') {
      str = str.toString();
    }
    this._graphics.text.apply(this._graphics, arguments);
  };
  p5.prototype.textFont = function (str) {
    this._setProperty('_textFont', str);
    this._applyTextProperties();
  };
  return p5;
}({}, amdclean['core'], amdclean['helpers']);
amdclean['src_app'] = function (require, core, p5Color, p5Element, p5Graphics2D, p5Graphics3D, p5Image, p5Vector, p5TableRow, p5Table, colorcreating_reading, colorsetting, constants, dataconversion, dataarray_functions, datastring_functions, environment, imageimage, imageloading_displaying, imagepixels, inputfiles, inputkeyboard, inputacceleration, inputmouse, inputtime_date, inputtouch, mathmath, mathcalculation, mathrandom, mathnoise, mathtrigonometry, renderingrendering, shape2d_primitives, shape3d_primitives, shapeattributes, shapecurves, shapevertex, structure, transform, typographyattributes, typographyloading_displaying, shaders) {
  'use strict';
  var p5 = core;
  var _globalInit = function () {
    if (!window.PHANTOMJS && !window.mocha) {
      if (window.setup && typeof window.setup === 'function' || window.draw && typeof window.draw === 'function') {
        new p5();
      }
    }
  };
  if (document.readyState === 'complete') {
    _globalInit();
  } else {
    window.addEventListener('load', _globalInit, false);
  }
  return p5;
}({}, amdclean['core'], amdclean['p5Color'], amdclean['p5Element'], amdclean['p5Graphics2D'], amdclean['p5Graphics3D'], amdclean['p5Image'], amdclean['p5Vector'], amdclean['p5TableRow'], amdclean['p5Table'], amdclean['colorcreating_reading'], amdclean['colorsetting'], amdclean['constants'], amdclean['dataconversion'], amdclean['dataarray_functions'], amdclean['datastring_functions'], amdclean['environment'], amdclean['imageimage'], amdclean['imageloading_displaying'], amdclean['imagepixels'], amdclean['inputfiles'], amdclean['inputkeyboard'], amdclean['inputacceleration'], amdclean['inputmouse'], amdclean['inputtime_date'], amdclean['inputtouch'], amdclean['mathmath'], amdclean['mathcalculation'], amdclean['mathrandom'], amdclean['mathnoise'], amdclean['mathtrigonometry'], amdclean['renderingrendering'], amdclean['shape2d_primitives'], amdclean['shape3d_primitives'], amdclean['shapeattributes'], amdclean['shapecurves'], amdclean['shapevertex'], amdclean['structure'], amdclean['transform'], amdclean['typographyattributes'], amdclean['typographyloading_displaying'], amdclean['shaders']);
return amdclean['src_app'];
}));