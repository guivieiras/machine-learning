import Connection from './connection'

export default class Neuron {
	public value: number = 0
	public maxvalue: number = -Infinity
	public minvalue: number = Infinity
	public connections: Connection[] = []
	public id: number
	constructor(id = Math.round(Math.random() * 10000)) {
		this.id = id
	}
}
