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
/*  */
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
            //? huh
            var noteTypes = ['16th', '8th', '4th'];
            currentMark = noteTypes.includes(mark)
                ? currentMark[1]
                : currentMark;
            return (_this.customMarks[mark]
                && _this.customMarks[mark].includes(currentMark));
        };
        this.isMarkValid = function (mark) {
            var beat = parseInt(mark);
            var note = mark.substring(mark.length - 1);
            if (beat && !parseInt(note)) {
                /* check note is vaild to the timeSignature */
                return true;
            }
            throw Error('not a valid mark');
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
        this.getTimeTilMark = function (mark, timestamp) {
            if (timestamp === void 0) { timestamp = window.performance.now(); }
            var _a = _this.convertMarkTonumbers(mark), beat = _a[0], sixteenthNote = _a[1];
            var _b = _this.convertMarkTonumbers(_this.getCurrentMark(timestamp)), b = _b[0], n = _b[1];
            // is the mark even valid?
            _this.isMarkValid(mark);
            // get total time in ms to complete one beat
            var beatTime = exports.bpmToMs(_this.bpm);
            // get total time in ms to complete one note
            var noteTime = beatTime / _this.timeSigniture;
            // time is equal to beatTime x beat + noteTime x (note + 1)
            var getTime = function (b, n) { return ((beatTime * (b - 1)) + (noteTime * n)); };
            var currentTime = getTime(b, n) + (timestamp % noteTime);
            var markTime = getTime(beat, sixteenthNote);
            // if the markTime is less than current time it needs to wait complete the cycle
            var timeTilMark = currentTime <= markTime
                ? markTime - currentTime
                : (beatTime * _this.phaseLen) + markTime - currentTime;
            return timeTilMark;
        };
        this.wRAF_LOOP = function (timestamp, cb) {
            if (!_this.start)
                _this.start = timestamp;
            var progress = timestamp - _this.start;
            cb(progress); // try catch?
            if ((progress < _this.loopOptions.duration || _this.loopOptions.repeat) && !_this.stop) {
                var id = window.requestAnimationFrame(function (t) { return _this.wRAF_LOOP(t, cb); });
            }
        };
        this.beatMarkLoop = function () {
            // if there is any callbacks in the que, prevent stop and end ?
            if (Object.getOwnPropertySymbols(_this.que).length) {
                _this.stop = false;
                return;
            }
            _this.stop = false;
            var set = function () {
                var bm = _this.setBeatMark();
                if (_this.debug) {
                    document.getElementById('beatmark').innerText = bm;
                }
            };
            window.requestAnimationFrame(function (ts) { return _this.wRAF_LOOP(ts, set); });
        };
        this.asyncStep = function (mark, cb) {
            // start the beat
            _this.beatMarkLoop(); //?  why are there 2 loops? */
            // if user has used a number, convert to a markString
            mark = typeof mark === 'number' ? "" + mark + '-' : mark;
            // maybe i'll need this 
            var markSymbol = Symbol(mark);
            // queing with a unique symbol, the callback wont get lost
            _this.que[markSymbol] = cb;
            var id = null;
            var step = function () {
                if (_this.beatMark === mark || _this.checkCustomMark(_this.beatMark, mark)) {
                    window.cancelAnimationFrame(id);
                    // when the que is empty there is no need to loop. There are no callbacks.
                    if (!Object.getOwnPropertySymbols(_this.que).length) {
                        _this.stop = true;
                    }
                    try {
                        var data = cb("_" + mark + "_");
                        // losing the callback reference
                        delete _this.que[markSymbol];
                        return [data];
                    }
                    catch (error) {
                        // error but the markSymbol remains
                        return [null, markSymbol];
                    }
                }
                else if (_this.beatMark !== mark) {
                    id = window.requestAnimationFrame(step); //?  why are there 2 loops? */
                }
                else {
                    console.warn("Loop ended prematurely");
                }
            }; /* beat mark doesn't equal mark and this.checkCustomMark has confirmed the mark  */
            // Start the step
            id = window.requestAnimationFrame(step);
        };
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
