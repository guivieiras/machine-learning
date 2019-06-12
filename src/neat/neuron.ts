import Connection from './connection'

export default class Neuron {
	public value: number = 0
	public connections: Connection[] = []
	public id: number
	constructor(id = Math.round(Math.random() * 1000)) {
		this.id = id
	}
}
