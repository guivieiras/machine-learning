import Generation from './generation'

export default class Genome {
	public generations: Generation[] = []

	public createGeneration(): Generation {
		let gen = new Generation()
		this.generations.push(gen)
		return gen
	}
}
