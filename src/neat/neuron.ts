import Connection from './connection'

export default class Neuron {
	public value: number
	public connections: Connection[] = []
}
