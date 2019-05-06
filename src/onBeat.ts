import '@babel/polyfill'
/**
 * 
 * @param {*} bpm 
 * @param {*} options 
 */
export const bpmToMs = (bpm: number, options={decimals: 2}) => {
  if (options.decimals > 14) {
    console.warn('max decimals is 14')
  }
  let beatsPerMs = 60 / bpm * 1000
  let decimalPlaces = 10**options.decimals

  return Math.round(beatsPerMs * decimalPlaces) / decimalPlaces
}
/*  */
interface Options {
  customMarks?: Array<object>,
  repeat?: boolean,
  duration?: number,
}
interface LoopOptions {
  repeat?: boolean,
  duration?: number,
}
/*  */
class onBeat {
  static sixteenths = ["-", "e", "&", "a"]
  static eighths = ["-", "&"]
  static quaters = ["-"]
  public bpms: number;
  public beatMark: string;
  public loopOptions: LoopOptions;
  public stop: boolean;
  public start: number | null;
  public startedAt: number;
  public setToWindow: boolean;
  public customMarks: object;

  private debug: boolean;
  private que: object;

  
  
  convertMarkTonumbers = mark => {
    let beat = parseInt(mark)
    
    let indexOf = onBeat.sixteenths.indexOf(mark[mark.length - 1] )
    let sixteenthNote = indexOf === -1 ? 0 :indexOf
    return [beat, sixteenthNote]
  }

  constructor(public bpm: number, public phaseLen: number, public timeSigniture: number, options: Options={ customMarks: [] }) {
    let { sixteenths, eighths, quaters } = onBeat
    let ts = [sixteenths, quaters, eighths, sixteenths]
    this.startedAt = performance.now()
    this.bpms = bpmToMs( bpm ) || 500
    this.phaseLen = phaseLen || 4
    this.timeSigniture = timeSigniture || 4
    this.beatMark = "0-"
    // loops
    this.loopOptions = {
      repeat: options.repeat || true,
      duration: options.duration || 2000,
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

  checkCustomMark = (currentMark: string, mark: string) => {
    //? huh
    const noteTypes: Array<string> = ['16th','8th','4th']
    currentMark = noteTypes.includes(mark) 
          ? currentMark[1]
          : currentMark
    return (
      this.customMarks[mark]
        && this.customMarks[mark].includes(currentMark)
    )
  }

  isMarkValid = (mark: string) => {
    const beat = parseInt(mark)
    const note = mark.substring(mark.length -1)
    if (
      beat &&
      !parseInt(note) &&
      beat <= this.phaseLen
      ) {
      /* check note is vaild to the timeSignature */
      return true
    }else {
      return false
    }
  }

  toggleStop() {
    this.stop = !this.stop
  }

  setBeatMark = (timestamp?: number) => {
    const beatMark = this.getCurrentMark(timestamp)
    if ( beatMark !== this.beatMark ) {
      this.beatMark = beatMark
    }
    if ( this.setToWindow ) {
      window['beatMark'] = beatMark
    }
    return beatMark
  }

  getCurrentMark = (timestamp: number = window.performance.now()) => {
    const beat = Math.floor(
      (timestamp / this.bpms) % this.phaseLen) + 1
    const sixteenthNote = onBeat.sixteenths[Math.floor(
      timestamp / (this.bpms / this.timeSigniture)) % this.timeSigniture]

    const beatMark = `${beat}${sixteenthNote}`
    return beatMark
  }

  getTimeTilMark = (mark: string, timestamp: number = window.performance.now()) => {
    let [ beat, sixteenthNote] = this.convertMarkTonumbers(mark)
    let [ b, n] = this.convertMarkTonumbers(this.getCurrentMark(timestamp))

    // is the mark even valid?
    this.isMarkValid(mark)
    // get total time in ms to complete one beat
    let beatTime = bpmToMs(this.bpm) 
    // get total time in ms to complete one note
    let noteTime = beatTime/ this.timeSigniture
    // time is equal to beatTime x beat + noteTime x (note + 1)
    const getTime = (b,n) => ((beatTime * (b -1)) + (noteTime * n))

    let currentTime = getTime(b,n) + ( timestamp % noteTime )
    let markTime = getTime(beat,sixteenthNote)

    // if the markTime is less than current time it needs to wait complete the cycle
    const timeTilMark = currentTime <= markTime 
      ? markTime - currentTime
      : (beatTime * this.phaseLen) + markTime - currentTime

		return timeTilMark
  }

  wRAF_LOOP = (timestamp, cb) => {

    if(!this.start) this.start = timestamp;
    let progress = timestamp - this.start;
    cb(progress); // try catch?

    if((progress < this.loopOptions.duration || this.loopOptions.repeat) && !this.stop){ 
      let id = window.requestAnimationFrame(t => this.wRAF_LOOP(t, cb))
    }
  }

  beatMarkLoop = () => {
    // if there is any callbacks in the que, prevent stop and end ?
    if ( (<any>Object).getOwnPropertySymbols(this.que).length ) {
      this.stop = false
      return
    }
    this.stop = false

    const set = () => {
      let bm = this.setBeatMark()
      
      if (this.debug){
        document.getElementById('beatmark').innerText = bm
      }
    }

    window.requestAnimationFrame(ts => this.wRAF_LOOP(ts, set) )
  }


  asyncStep = async (mark: string, cb: any) => {
    // start the beat
    // this.beatMarkLoop() //?  why are there 2 loops? */

    // if user has used a number, convert to a markString
    mark = typeof mark === 'number' ? `${mark}${'-'}` : mark
    // maybe i'll need this 
    const markSymbol: symbol = Symbol(mark)
    // queing with a unique symbol, the callback wont get lost
    this.que[markSymbol] = cb

    let id = null

    let step = async () => {
      this.setBeatMark()
      
      if ( this.beatMark === mark || this.checkCustomMark(this.beatMark, mark) ) {
        window.cancelAnimationFrame(id)
        // when the que is empty there is no need to loop. There are no callbacks.
        if ( !(<any>Object).getOwnPropertySymbols(this.que).length ) {
          this.stop = true
        }
        try {
          const data = cb(`_${mark}_`)
          // losing the callback reference
          delete this.que[markSymbol]
          return data
        } catch (error) {
            // error but the markSymbol remains
          return [null, markSymbol]
        }
      }
      else if(this.beatMark !== mark ){
        id = window.requestAnimationFrame(step) //?  why are there 2 loops? */
      }else {console.warn("Loop ended prematurely")}
    }/* beat mark doesn't equal mark and this.checkCustomMark has confirmed the mark  */  
    
    // Start the step
    id = window.requestAnimationFrame(step)
  }
  
  promiseStep = (mark, cb) => new Promise((resolve, reject) => {
    let id;

    mark = typeof mark === 'number' ? `${mark}${'-'}` : mark

    if ( !this.isMarkValid(mark) ) {
      throw new Error('not a valid mark')
      // reject('not a valid mark')
    }
    let step = (timestamp) => {
      let bm = this.setBeatMark()
      // let debug = document.getElementById('beatmark')
      // if(debug) debug.innerText = bm;
  
      if ( this.beatMark === mark || this.checkCustomMark(this.beatMark, mark) ) {
        let data = cb({ id, timestamp, mark })
        resolve(data)
      } else if(this.beatMark !== mark ){
        id = window.requestAnimationFrame(t => step(t))
      } else {
        console.warn("Loop ended prematurely")
        reject()
      }
    }
    // start loop
    id = window.requestAnimationFrame(step)
  })
}
export default onBeat
