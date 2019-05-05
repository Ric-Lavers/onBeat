import OnBeat from './onBeat.ts'

const onBeat = new OnBeat(120, 4, 4)

test('returns a beatmark', () => {
	const bm = onBeat.getCurrentMark()

	expect(bm).toEqual(
		expect.stringMatching(/\d[-a&e]/)
	)
})

describe('convertMarkTonumbers', () => {

	test('converts simple mark to numbers  (quater note)', () => {
		let [beat, sixteenthNote] = onBeat.convertMarkTonumbers('3a')
		expect(beat).toBe(3)
	})
	test('converts simple mark to numbers  (quater note)', () => {
		let [beat, sixteenthNote] = onBeat.convertMarkTonumbers('3a')
		expect(sixteenthNote).toBe(3)
	})
	test('convert long mark to numbers (quater note)', () => {
		let [b, s] = onBeat.convertMarkTonumbers('15e')
		expect(b).toBe(15)
	})
	test('convert long mark to numbers (16th note)', () => {
		let [b, s] = onBeat.convertMarkTonumbers('15e')
		expect(s).toBe(1)
	})
	
})

describe('getCurrentMark', () => {
	test('getCurrent mark correct - simple', () => {
		const mark = onBeat.getCurrentMark(0)
		expect(mark).toBe('1-')
	})
	test('getCurrent mark correct - simple', () => {
		const mark = onBeat.getCurrentMark(1000)
		expect(mark).toBe('3-')
	})
	test('getCurrent mark correct - simple', () => {
		const mark = onBeat.getCurrentMark(10000)
		expect(mark).toBe('1-')
	})
	test('getCurrent mark correct - offbeat', () => {
		const mark = onBeat.getCurrentMark(9999)
		expect(mark).toBe('4a')
	})
	test('getCurrent mark correct - offbeat', () => {
		const mark = new OnBeat(120, 4, 1).getCurrentMark(1490)
		expect(mark).toBe('3-')
	})
	test('getCurrent mark correct - higher tempo', () => {
		const mark = new OnBeat(180, 4, 1).getCurrentMark(1332)
		expect(mark).toBe('4-')
	})
	test('setBeatMark', () => {
		onBeat.setBeatMark(1000)
		expect(onBeat.beatMark).toBe('3-')
	})
	
})

describe('getTimeTilMark', () => {

	test('time to next mark', () => {
		const timeTilMark = onBeat.getTimeTilMark('4-', 0)
		expect(timeTilMark).toBe(1500);
	})
	test('time to next mark', () => {
		const timeTilMark = new OnBeat(60, 4, 4).getTimeTilMark('4-', 0)
		expect(timeTilMark).toBe(3000);
	})
	test('time to next mark', () => {
		const timeTilMark = new OnBeat(60, 4, 4).getTimeTilMark('1-', 0)
		expect(timeTilMark).toBe(0);
	})
	test('time to next mark', () => {
		const timeTilMark = new OnBeat(60, 4, 4).getTimeTilMark('2-', 123)
		expect(timeTilMark).toBe(1000 - 123);
	})
	test('time to next mark', () => {
		const timeTilMark = new OnBeat(60, 4, 4).getTimeTilMark('1-', 1050 )
		expect(timeTilMark).toBe(4000 - 1050);
	})
})

describe('asyncStep', () => {
	it('should return callback correct beat', async() => {
		const time =  await onBeat.asyncStep(
			'3-',
			() => 'time'
		)
		console.log( time )
		// expect(time).toBe(1000) 
	})
	
})