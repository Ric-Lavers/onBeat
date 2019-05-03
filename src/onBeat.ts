import "@babel/polyfill";
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
interface Options {
  customMarks?: Array<object>,
  repeat?: boolean,
  duration?: number,
}
interface LoopOptions {
  repeat?: boolean,
  duration?: number,
}

export default class onBeat {
  static sixteenths = ["-", "e", "&", "a"]
  static eighths = ["-", "&"]
  static quaters = ["-"]
  public bpms: number;
  public beatMark: string;
  public loopOptions: LoopOptions;
  public stop: boolean;
  public start: number | null;
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
    currentMark = ['16th','8th','4th'].includes(mark) 
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
    if (beat && !parseInt(note)) {
      /* check note is vaild to the timeSignature */
      return true
    }
    throw Error('not a valid mark')
  }

  toggleStop() {
    this.stop = !this.stop
  }

  getBeatMark= () => {
    console.warn('use getCurrentMark instead')
    this.setBeatMark();
    return this.beatMark
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

    console.log( currentTime , markTime )
    
    // if the markTime is less than current time it needs to wait complete the cycle
    const timeTilMark = currentTime <= markTime 
      ? markTime - currentTime
      : (beatTime * this.phaseLen) + markTime - currentTime

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
    if ( (<any>Object).getOwnPropertySymbols(this.que).length ) {
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
        if ( !(<any>Object).getOwnPropertySymbols(this.que).length ) {
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

