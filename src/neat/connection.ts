import Neuron from './neuron'

export default class Connection {
	public to: Neuron
	public weight: number

	constructor(to: Neuron, weight: number) {
		this.to = to
		this.weight = weight
	}
}
