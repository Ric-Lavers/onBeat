
/**
 * 
 * @param {*} bpm 
 * @param {*} options 
 */
export const bpmToMs = (bpm, options={decimals: 2}) => {
  if (options.decimals > 14) {
    console.warn('max decimals is 14')
  }
  let beatsPerMs = 60 / bpm * 1000
  let decimalPlaces = 10**options.decimals

  return Math.round(beatsPerMs * decimalPlaces) / decimalPlaces
}

/**
 * setUp
 * 
 * sets the time signiture, bpm, custom markers, and default custom markers. 
 */


/**
 * sets the beat mark to the bpm
 * 
 * @param {number} bpms 
 * @param {number} phaseLen 
 * @param {string} timeSigniture 
 * @param {number} progress  (ms)
 */

// const quaters = [""]
// const eighths = ["", "&"]
// const triplets = ["", "trip", "let"]
const sixteenths = ["-", "e", "&", "a"]
export const setBeatMark = ( bpms=500, phaseLen=16, timeSigniture='sixteenths' ) => timestamp => {
  let beat = Math.floor((timestamp / bpms) % phaseLen) + 1
  let sixteenthNote = sixteenths[Math.floor(timestamp / (bpms / 4)) % 4]

  const beatMark = `${beat}${sixteenthNote}`

  if ( beatMark !== window['beatMark']){
    window['beatMark'] = beatMark
  }
}

const convertMarkTonumbers = mark => {
  let beat = parseInt(mark)
  let sixteenthNote = sixteenths.indexOf(mark[1])
  return [beat, sixteenthNote]
}



export default class onBeat {
  static sixteenths = ["-", "e", "&", "a"]
  static eighths = ["-", "&"]
  static quaters = ["-"]
  
  convertMarkTonumbers = mark => {
    let beat = parseInt(mark)
    
    let indexOf = onBeat.sixteenths.indexOf(mark[1] )
    let sixteenthNote = indexOf === -1 ? 0 :indexOf
    return [beat, sixteenthNote]
  }

  constructor(bpm, phaseLen, timeSigniture, options={ customMarks: [] }) {
    let { sixteenths, eighths, quaters } = onBeat
    let ts = [sixteenths, quaters, eighths, sixteenths]
    this.bpms = bpmToMs( bpm ) || 500
    this.phaseLen = phaseLen || 4
    this.timeSigniture = timeSigniture || 4
    this.beatMark = "0-"
    // loops
    this.loopOptions = {
      repeat: true,
      duration: 2000,
    }
    this.que = {}
    this.stop = false
    this.start = null
    // globals
    this.setToWindow= false
    // debug
    this.debug = true
    this.customMarks = {
      'default': ['1-'],
      '16th': onBeat.sixteenths,
      '8th': onBeat.eighths,
      '4th': onBeat.quaters,
      ...options.customMarks
    }
  }

  checkCustomMark = (currentMark, mark) => {
    currentMark = ['16th','8th','4th'].includes(mark) 
          ? currentMark[1]
          : currentMark
    return (
      this.customMarks[mark]
        && this.customMarks[mark].includes(currentMark)
    )
  }

  toggleStop() {
    this.stop = !this.stop
  }

  getBeatMark= () => {this.setBeatMark(); return this.beatMark}

  setBeatMark = timestamp => {
    const beatMark = this.getCurrentMark(timestamp)
    if ( beatMark !== this.beatMark ) {
      this.beatMark = beatMark
    }
    if ( this.setToWindow ) {
      window['beatMark'] = beatMark
    }
  }

  getCurrentMark = (timestamp = window.performance.now()) => {
    const beat = Math.floor(
      (timestamp / this.bpms) % this.phaseLen) + 1
    const sixteenthNote = sixteenths[Math.floor(
      timestamp / (this.bpms / this.timeSigniture)) % this.timeSigniture]

    const beatMark = `${beat}${sixteenthNote}`
    return beatMark
  }

  getTimeTilMark = (mark, timestamp = window.performance.now()) => {
    let [ beat, sixteenthNote] = this.convertMarkTonumbers(mark)
    let [ b, s] = this.convertMarkTonumbers(this.getCurrentMark())
		console.log(
    	[ beat, sixteenthNote],
      [ b, s]
    )
  	let beatTime = 500 * 4
    let fraction = beatTime/ (4*4)
    const getTime = (b,s) => ((fraction *4 * b) + (fraction * (s + 1)))
    let markTime = getTime(beat,sixteenthNote)
		let currentTime = getTime(b,s)
    console.log(
    	markTime,
			currentTime
    )
		const timeTilMark = currentTime < markTime ? markTime - currentTime : beatTime + markTime - currentTime
		return timeTilMark
  }

  wRAF_LOOP = (timestamp, cb) => {

    if(!this.start) this.start = timestamp;
    let progress = timestamp - this.start;
    cb(progress);

    if((progress < this.loopOptions.duration || this.loopOptions.repeat) && !this.stop){ 
      let id = window.requestAnimationFrame(t => this.wRAF_LOOP(t, cb))
    }
  }

  beatMarkLoop = () => {
    if ( Object.getOwnPropertySymbols(this.que).length ) {
      this.stop = false
      return
    }
    this.stop = false

    const set = () => {
      let bm = this.getBeatMark()
      window['beatMark'] = bm
      if (this.debug){
        document.getElementById('beatmark').innerText = bm
      }
    }

    window.requestAnimationFrame(ts => this.wRAF_LOOP(ts, set) )
  }


  asyncStep = async (mark, cb) =>{
    
    this.beatMarkLoop()
    mark = typeof mark === 'number' ? `${mark}${'-'}` : mark
    // maybe i'll need this 
    const markSymbol = Symbol(mark)
    this.que[markSymbol] = cb
    let step = () => {
      if ( this.beatMark === mark || this.checkCustomMark(this.beatMark, mark) ) {
        delete this.que[markSymbol]
        if ( !Object.getOwnPropertySymbols(this.que).length ) {
          this.stop = true
        }
        return cb(`_${mark}_`)
      }
      if(this.beatMark !== mark ){
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }

}


/**
 * promiseStep, returns a promise that goes into a requestAnimationFrame loop  and resolves then the window beatmark matches required beatMark,
 * (this does mean its one animation frame behind the beat.)
 * 
 */
let currentMarks = [];
let callbacks = []
export const promiseStep = (mark, cb) => new Promise((resolve, reject) => {
  
  currentMarks = [...currentMarks, cb]
  console.log( 'promiseStep', currentMarks)
  let step = () => {

    if (window['beatMark'] === mark ) {
      callbacks.push( currentMarks.shift() ) 
      if (callbacks.length === 1) {
        console.log( 'callback', callbacks )
        console.log( 'currentMarks', currentMarks )
        callbacks[0]()
      }
      console.log( 'callback', callbacks )
      console.log( 'currentMarks', currentMarks )
    }
    if (!currentMarks.length){
      console.log( 'no length - resolve' )
      currentMarks=[]
      resolve()
    }
    if(window['beatMark'] !== mark ){
      window.requestAnimationFrame(step)
    }
  }
  window.requestAnimationFrame(step)
})

const checkCustomMark = (currentMark, mark) => {
  currentMark = ['16th','8th','4th'].includes(mark) 
        ? currentMark[1]
        : currentMark
  return (
    window[mark]
      && window[mark].includes(currentMark)
  )
}

export const asyncStep = async (mark, cb) =>{
  let step = () => {

    if (window['beatMark'] === mark || checkCustomMark(window['beatMark'], mark) ) {
      return cb(`_${mark}_`)
    }
    if(window['beatMark'] !== mark ){
      window.requestAnimationFrame(step)
    }
  }
  window.requestAnimationFrame(step)
}

/* 
export class Step {
  constructor(){
    this.callbacks = []
  }

  promiseStep = (mark, cb) => new Promise((resolve, reject) => {
    this.callbacks= [ ...this.callbacks, cb ]
    console.log( 'step.promiseStep' , this.callbacks )
    
    let marked = false//true

    let step = (timeStamp) => {
      // console.log( marked, mark,window['beatMark'], this.callbacks.length , timeStamp)
      if (!this.callbacks.length){
        console.log( 'no length - resolve' )
        return resolve()
      }
      if ( timeStamp >= 12000 ){
        resolve()
        return 
      }

      if (window['beatMark'] === mark && marked ) {
        console.log('callbacking')
        marked = false
        this.callbacks.shift()()
        window.requestAnimationFrame(t => step(t))
      } else if (window['beatMark'] === mark) {
        window.requestAnimationFrame(t => step(t))
      }
    
      if( window['beatMark'] !== mark ){
        marked = true
        window.requestAnimationFrame(t => step(t))
      }
    }

    if (this.callbacks.length === 1) {
      console.log( 'wAF' )
      window.requestAnimationFrame(step)
    }
  })

  asyncStep = async (mark, cb) =>{
    let step = () => {
  
      if (window['beatMark'] === mark) {
        return cb(`_${mark}_`)
      }
      if(window['beatMark'] !== mark ){
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }
  


} */