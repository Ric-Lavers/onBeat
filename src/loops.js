/**
 * requestAnimationFrame Loop
 * @param {function} cb 
 * @param {objectOf({ dur: number, repeat: boolean })} options 
 */
export const rAFLoop = (cb, options) => {
  let id=0; // not doing anything with this id
  let start=null; // can be better

  const loop = (
    timestamp,
    cb,
    options={
      dur: 2000,
      repeat: false
    }
  ) => {
    if(!start) start = timestamp;
    let progress = timestamp - start;
    cb(progress);
    
    if((progress < options.dur || options.repeat)/*  && !window['stop'] */){ 
      id = window.requestAnimationFrame(t => loop(t, cb, options))
    }
  }
  window.requestAnimationFrame(t => loop(t, cb, options))
}

/**
 * setInterval Loop
 * @param {function} cb 
 * @param {objectOf({ interval:number, dur:number, repeat:boolean })} options 
 */
export const intervalLoop = (cb, options = {interval:500, dur:2000, repeat:false}) => {
  let id=0; // not doing anything with this id
  let start=performance.now();
  
  let interval = setInterval(up, options.interval);

  const up = () => {
    let progress = performance.now()
    if ( (progress - start <= options.dur && !options.repeat) || !window['stop'] ) {
      clearInterval(interval)
    }
    cb({ id, progress })
    id++ 
  }
}

/* CSS animation loop */
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/animationiteration_event