import OnBeat from './onBeat'

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

describe('getTimeTilMark', () => {
	const timeTilMark = onBeat.getTimeTilMark('4-')
})
