import Neuron from './neuron'

export default class Connection {
	public from: Neuron
	public to: Neuron
	public weight: number

	constructor(from: Neuron, to: Neuron, weight: number) {
		this.from = from
		this.to = to
		this.weight = weight
	}
}
