
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

