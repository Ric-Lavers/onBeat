import { globalWindow } from './utils'

export const beatMark = Symbol('beatMark')
export const bpm = Symbol('bpm')
export const stop = Symbol('stop')
export const custom = Symbol('custom')

window[beatMark] = '0';
window[bpm] = 120;
window[stop] = false;
window[custom] = {
  'snare': [ '2&', '4&' ],
  'kick': [ '1-', '2-', '3-', '4-' ],
}

var wrAF = window.requestAnimationFrame
