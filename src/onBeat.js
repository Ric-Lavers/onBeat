"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.bpmToMs = void 0;

require("@babel/polyfill");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 
 * @param {*} bpm 
 * @param {*} options 
 */
var bpmToMs = function bpmToMs(bpm) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    decimals: 2
  };

  if (options.decimals > 14) {
    console.warn('max decimals is 14');
  }

  var beatsPerMs = 60 / bpm * 1000;
  var decimalPlaces = Math.pow(10, options.decimals);
  return Math.round(beatsPerMs * decimalPlaces) / decimalPlaces;
};

exports.bpmToMs = bpmToMs;

var onBeat =
/*#__PURE__*/
function () {
  function onBeat(bpm, phaseLen, timeSigniture) {
    var _this = this;

    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      customMarks: []
    };

    _classCallCheck(this, onBeat);

    this.bpm = bpm;
    this.phaseLen = phaseLen;
    this.timeSigniture = timeSigniture;

    _defineProperty(this, "bpms", void 0);

    _defineProperty(this, "beatMark", void 0);

    _defineProperty(this, "loopOptions", void 0);

    _defineProperty(this, "stop", void 0);

    _defineProperty(this, "start", void 0);

    _defineProperty(this, "setToWindow", void 0);

    _defineProperty(this, "customMarks", void 0);

    _defineProperty(this, "debug", void 0);

    _defineProperty(this, "que", void 0);

    _defineProperty(this, "convertMarkTonumbers", function (mark) {
      var beat = parseInt(mark);
      var indexOf = onBeat.sixteenths.indexOf(mark[mark.length - 1]);
      var sixteenthNote = indexOf === -1 ? 0 : indexOf;
      return [beat, sixteenthNote];
    });

    _defineProperty(this, "checkCustomMark", function (currentMark, mark) {
      //? huh
      currentMark = ['16th', '8th', '4th'].includes(mark) ? currentMark[1] : currentMark;
      return _this.customMarks[mark] && _this.customMarks[mark].includes(currentMark);
    });

    _defineProperty(this, "isMarkValid", function (mark) {
      var beat = parseInt(mark);
      var note = mark.substring(mark.length - 1);

      if (beat && !parseInt(note)) {
        /* check note is vaild to the timeSignature */
        return true;
      }

      throw Error('not a valid mark');
    });

    _defineProperty(this, "getBeatMark", function () {
      console.warn('use getCurrentMark instead');

      _this.setBeatMark();

      return _this.beatMark;
    });

    _defineProperty(this, "setBeatMark", function (timestamp) {
      var beatMark = _this.getCurrentMark(timestamp);

      if (beatMark !== _this.beatMark) {
        _this.beatMark = beatMark;
      }

      if (_this.setToWindow) {
        window['beatMark'] = beatMark;
      }

      return beatMark;
    });

    _defineProperty(this, "getCurrentMark", function () {
      var timestamp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.performance.now();
      var beat = Math.floor(timestamp / _this.bpms % _this.phaseLen) + 1;

      var sixteenthNote = onBeat.sixteenths[Math.floor(timestamp / (_this.bpms / _this.timeSigniture)) % _this.timeSigniture];

      var beatMark = "".concat(beat).concat(sixteenthNote);
      return beatMark;
    });

    _defineProperty(this, "getTimeTilMark", function (mark) {
      var timestamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.performance.now();

      var _this$convertMarkTonu = _this.convertMarkTonumbers(mark),
          _this$convertMarkTonu2 = _slicedToArray(_this$convertMarkTonu, 2),
          beat = _this$convertMarkTonu2[0],
          sixteenthNote = _this$convertMarkTonu2[1];

      var _this$convertMarkTonu3 = _this.convertMarkTonumbers(_this.getCurrentMark(timestamp)),
          _this$convertMarkTonu4 = _slicedToArray(_this$convertMarkTonu3, 2),
          b = _this$convertMarkTonu4[0],
          n = _this$convertMarkTonu4[1]; // is the mark even valid?


      _this.isMarkValid(mark); // get total time in ms to complete one beat


      var beatTime = bpmToMs(_this.bpm); // get total time in ms to complete one note

      var noteTime = beatTime / _this.timeSigniture; // time is equal to beatTime x beat + noteTime x (note + 1)

      var getTime = function getTime(b, n) {
        return beatTime * (b - 1) + noteTime * n;
      };

      var currentTime = getTime(b, n) + timestamp % noteTime;
      var markTime = getTime(beat, sixteenthNote);
      console.log(currentTime, markTime); // if the markTime is less than current time it needs to wait complete the cycle

      var timeTilMark = currentTime <= markTime ? markTime - currentTime : beatTime * _this.phaseLen + markTime - currentTime;
      return timeTilMark;
    });

    _defineProperty(this, "wRAF_LOOP", function (timestamp, cb) {
      if (!_this.start) _this.start = timestamp;
      var progress = timestamp - _this.start;
      cb(progress);

      if ((progress < _this.loopOptions.duration || _this.loopOptions.repeat) && !_this.stop) {
        var id = window.requestAnimationFrame(function (t) {
          return _this.wRAF_LOOP(t, cb);
        });
      }
    });

    _defineProperty(this, "beatMarkLoop", function () {
      if (Object.getOwnPropertySymbols(_this.que).length) {
        _this.stop = false;
        return;
      }

      _this.stop = false;

      var set = function set() {
        var bm = _this.getBeatMark();

        window['beatMark'] = bm;

        if (_this.debug) {
          document.getElementById('beatmark').innerText = bm;
        }
      };

      window.requestAnimationFrame(function (ts) {
        return _this.wRAF_LOOP(ts, set);
      });
    });

    _defineProperty(this, "asyncStep",
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(mark, cb) {
        var markSymbol, step;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.beatMarkLoop();

                mark = typeof mark === 'number' ? "".concat(mark, '-') : mark; // maybe i'll need this 

                markSymbol = Symbol(mark);
                _this.que[markSymbol] = cb;

                step = function step() {
                  if (_this.beatMark === mark || _this.checkCustomMark(_this.beatMark, mark)) {
                    delete _this.que[markSymbol];

                    if (!Object.getOwnPropertySymbols(_this.que).length) {
                      _this.stop = true;
                    }

                    return cb("_".concat(mark, "_"));
                  }

                  if (_this.beatMark !== mark) {
                    window.requestAnimationFrame(step);
                  }
                };

                window.requestAnimationFrame(step);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    var sixteenths = onBeat.sixteenths,
        eighths = onBeat.eighths,
        quaters = onBeat.quaters;
    var _ts = [sixteenths, quaters, eighths, sixteenths];
    this.bpms = bpmToMs(bpm) || 500;
    this.phaseLen = phaseLen || 4;
    this.timeSigniture = timeSigniture || 4;
    this.beatMark = "0-"; // loops

    this.loopOptions = {
      repeat: options.repeat || true,
      duration: options.duration || 2000
    };
    this.que = {};
    this.stop = false;
    this.start = null; // globals

    this.setToWindow = false; // debug

    this.debug = true;
    this.customMarks = _objectSpread({
      'default': ['1-'],
      '16th': onBeat.sixteenths,
      '8th': onBeat.eighths,
      '4th': onBeat.quaters
    }, options.customMarks);
  }

  _createClass(onBeat, [{
    key: "toggleStop",
    value: function toggleStop() {
      this.stop = !this.stop;
    }
  }]);

  return onBeat;
}();

exports["default"] = onBeat;

_defineProperty(onBeat, "sixteenths", ["-", "e", "&", "a"]);

_defineProperty(onBeat, "eighths", ["-", "&"]);

_defineProperty(onBeat, "quaters", ["-"]);
