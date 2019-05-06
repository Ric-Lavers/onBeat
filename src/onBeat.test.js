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
	// it('should return callback correct beat', async() => {
	// 	expect.assertions(1);
	// 	onBeat.asyncStep(
	// 		'3-',
	// 		() => {console.log( performance.now() ); return 1000}
	// 	)
	// 	.then(time => expect(time).toBe(1000))
	// 	.catch(err => console.error(err))
		
	// })
})

describe('promiseStep', () => {
	it('should return the data from function using .then()', () => {
		return onBeat.promiseStep(
			'3-',
			() => 'test'
		).then( d => {
			expect(d).toBe('test')
		})
	})
	it('should return the data from function using async/ await', async () => {
		expect.assertions(1);
		const data = await onBeat.promiseStep(
			'3-',
			() => 'test'
		)
		expect(data).toBe('test')
	})
	it('should throw when mark is out of range', async() => {
		expect.assertions(1);
		try {
			await onBeat.promiseStep(
				42,
				() => 'test'
			)
		} catch (e) {
			expect(e.message).toEqual('not a valid mark');
		}
	})
	it('callback should return a id', async() => {
		expect.assertions(1);
		try {
			const id = await onBeat.promiseStep(
				'1-',
				({ id, timestamp }) => ({ id, timestamp })
			)
			expect(id.id).not.toBeNaN()
		} catch (e) {
		}
	})
	it('id to demostrate that its not running multiple loops', async() => {
		expect.assertions(1);
		try {
			let timeNow = performance.now()
			const id = await onBeat.promiseStep(
				'2-',
				({ id, timestamp }) => ({ id, timestamp })
			)
			let timeRunning = id.timestamp - timeNow
			let  miniumFrames = timeRunning /  (1000 / 60) * 1.4/* num calualted includes processing*/
			
			expect(id.id).toBeLessThan(  miniumFrames )
		} catch (e) {
		}
	})
	it.only('not run multiple loops', async() => {
		jest.setTimeout(10000)
		
		const beat = new OnBeat(120, 10, 4)
		const currentMark = beat.getCurrentMark()
		console.log({currentMark})
		beat.promiseStep(
			parseInt(currentMark > 6  ? 0 : currentMark )+4,
			(d) => d
		).then( d => console.log(d) )
		beat.promiseStep(
			parseInt(currentMark > 8  ? 0 : currentMark )+2,
			(d) => d
		).then( d => console.log(d) )

		let x = await beat.promiseStep(
			parseInt(currentMark === 1 ? 11 : currentMark ) -1,
			(d) => d
		)
		console.log(x)
		expect(x.id).not.toBeNaN()
	
	})
})