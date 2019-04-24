import { beatMark, bpm, custom } from './index.js'

const customMark = (currentMark, mark) => (
  window[custom][mark]
    && window[custom][mark].includes(currentMark)
)
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
 * sets the beat mark to the bpm
 * 
 * @param {number} bpms 
 * @param {number} phaseLen 
 * @param {string} timeSigniture 
 * @param {number} progress  (ms)
 */
export const setBeatMark = ( bpms=500, phaseLen=16, timeSigniture='sixteenths' ) => progress => {
  // const quaters = [""]
  // const eighths = ["", "&"]
  // const triplets = ["", "trip", "let"]
  const sixteenths = ["-", "e", "&", "a"]
  let currentValue = 0
  let note = null
  let beat = progress / bpms
  let nextValue = (Math.round( progress / bpms ) % phaseLen) + 1

  if (nextValue <= phaseLen) {
    if (currentValue !== Math.round( progress / bpms ) + 1){
      currentValue = nextValue
    }
    let sixteenth = beat === 0 ? 0 :Math.round( progress / (bpms / 4) + 1 ) % 4
  
    if ( note !== sixteenth ) {
      // console.log(nextValue + sixteenths[sixteenth] )
      window['beatMark'] = `${nextValue}${sixteenths[sixteenth]}`
      note = sixteenth

      if ( currentValue === phaseLen && note === 3 ) {// reset
        currentValue = 0
      }
      return nextValue + sixteenths[sixteenth]
    }
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

export const asyncStep = async (mark, cb) =>{
  console.log( mark )
  let step = () => {

    if (window['beatMark'] === mark || customMark(window['beatMark'], mark) ) {
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