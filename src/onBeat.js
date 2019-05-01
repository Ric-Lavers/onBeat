"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/**
 *
 * @param {*} bpm
 * @param {*} options
 */
exports.bpmToMs = function (bpm, options) {
    if (options === void 0) { options = { decimals: 2 }; }
    if (options.decimals > 14) {
        console.warn('max decimals is 14');
    }
    var beatsPerMs = 60 / bpm * 1000;
    var decimalPlaces = Math.pow(10, options.decimals);
    return Math.round(beatsPerMs * decimalPlaces) / decimalPlaces;
};
var onBeat = /** @class */ (function () {
    function onBeat(bpm, phaseLen, timeSigniture, options) {
        var _this = this;
        if (options === void 0) { options = { customMarks: [] }; }
        this.bpm = bpm;
        this.phaseLen = phaseLen;
        this.timeSigniture = timeSigniture;
        this.convertMarkTonumbers = function (mark) {
            var beat = parseInt(mark);
            var indexOf = onBeat.sixteenths.indexOf(mark[mark.length - 1]);
            var sixteenthNote = indexOf === -1 ? 0 : indexOf;
            return [beat, sixteenthNote];
        };
        this.checkCustomMark = function (currentMark, mark) {
            currentMark = ['16th', '8th', '4th'].includes(mark)
                ? currentMark[1]
                : currentMark;
            return (_this.customMarks[mark]
                && _this.customMarks[mark].includes(currentMark));
        };
        this.getBeatMark = function () {
            console.warn('use getCurrentMark instead');
            _this.setBeatMark();
            return _this.beatMark;
        };
        this.setBeatMark = function (timestamp) {
            var beatMark = _this.getCurrentMark(timestamp);
            if (beatMark !== _this.beatMark) {
                _this.beatMark = beatMark;
            }
            if (_this.setToWindow) {
                window['beatMark'] = beatMark;
            }
            return beatMark;
        };
        this.getCurrentMark = function (timestamp) {
            if (timestamp === void 0) { timestamp = window.performance.now(); }
            var beat = Math.floor((timestamp / _this.bpms) % _this.phaseLen) + 1;
            var sixteenthNote = onBeat.sixteenths[Math.floor(timestamp / (_this.bpms / _this.timeSigniture)) % _this.timeSigniture];
            var beatMark = "" + beat + sixteenthNote;
            return beatMark;
        };
        this.getTimeTilMark = function (mark) {
            var _a = _this.convertMarkTonumbers(mark), beat = _a[0], sixteenthNote = _a[1];
            var _b = _this.convertMarkTonumbers(_this.getCurrentMark()), b = _b[0], s = _b[1];
            _this.debug && console.log([beat, sixteenthNote], [b, s]);
            //! this will only work for 16ths? # whats going on?
            var beatTime = 500 * 4;
            var fraction = beatTime / (4 * 4);
            var getTime = function (b, s) { return ((fraction * 4 * b) + (fraction * (s + 1))); };
            var markTime = getTime(beat, sixteenthNote);
            var currentTime = getTime(b, s);
            _this.debug && console.log(markTime, currentTime);
            var timeTilMark = currentTime < markTime ? markTime - currentTime : beatTime + markTime - currentTime;
            return timeTilMark;
        };
        this.wRAF_LOOP = function (timestamp, cb) {
            if (!_this.start)
                _this.start = timestamp;
            var progress = timestamp - _this.start;
            cb(progress);
            if ((progress < _this.loopOptions.duration || _this.loopOptions.repeat) && !_this.stop) {
                var id = window.requestAnimationFrame(function (t) { return _this.wRAF_LOOP(t, cb); });
            }
        };
        this.beatMarkLoop = function () {
            if (Object.getOwnPropertySymbols(_this.que).length) {
                _this.stop = false;
                return;
            }
            _this.stop = false;
            var set = function () {
                var bm = _this.getBeatMark();
                window['beatMark'] = bm;
                if (_this.debug) {
                    document.getElementById('beatmark').innerText = bm;
                }
            };
            window.requestAnimationFrame(function (ts) { return _this.wRAF_LOOP(ts, set); });
        };
        this.asyncStep = function (mark, cb) { return __awaiter(_this, void 0, void 0, function () {
            var markSymbol, step;
            var _this = this;
            return __generator(this, function (_a) {
                this.beatMarkLoop();
                mark = typeof mark === 'number' ? "" + mark + '-' : mark;
                markSymbol = Symbol(mark);
                this.que[markSymbol] = cb;
                step = function () {
                    if (_this.beatMark === mark || _this.checkCustomMark(_this.beatMark, mark)) {
                        delete _this.que[markSymbol];
                        if (!Object.getOwnPropertySymbols(_this.que).length) {
                            _this.stop = true;
                        }
                        return cb("_" + mark + "_");
                    }
                    if (_this.beatMark !== mark) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
                return [2 /*return*/];
            });
        }); };
        var sixteenths = onBeat.sixteenths, eighths = onBeat.eighths, quaters = onBeat.quaters;
        var ts = [sixteenths, quaters, eighths, sixteenths];
        this.bpms = exports.bpmToMs(bpm) || 500;
        this.phaseLen = phaseLen || 4;
        this.timeSigniture = timeSigniture || 4;
        this.beatMark = "0-";
        // loops
        this.loopOptions = {
            repeat: options.repeat || true,
            duration: options.duration || 2000
        };
        this.que = {};
        this.stop = false;
        this.start = null;
        // globals
        this.setToWindow = false;
        // debug
        this.debug = true;
        this.customMarks = __assign({ 'default': ['1-'], '16th': onBeat.sixteenths, '8th': onBeat.eighths, '4th': onBeat.quaters }, options.customMarks);
    }
    onBeat.prototype.toggleStop = function () {
        this.stop = !this.stop;
    };
    onBeat.sixteenths = ["-", "e", "&", "a"];
    onBeat.eighths = ["-", "&"];
    onBeat.quaters = ["-"];
    return onBeat;
}());
exports["default"] = onBeat;
