import Brain from './brain'
import Connection from './connection'
import Layer from './layer'
import Neuron from './neuron'

export default class Gene {
	public inputLayer: Layer = new Layer()
	public hiddenLayer: Layer = new Layer()
	public outputLayer: Layer = new Layer()

	constructor(inputLenght: number) {
		this.inputLayer.neurons = new Array(inputLenght).fill('').map(x => new Neuron())
		this.outputLayer.neurons = new Array(4).fill('').map(x => new Neuron())

		for (let neuron of this.inputLayer.neurons) {
			for (let n of this.outputLayer.neurons) {
				let rnd = Math.random() * 2 - 1
				if (rnd > 0.5) {
					neuron.connections.push(new Connection(n, Math.random() * 2 - 1))
				}
			}
			// console.log(neuron.connections)
		}
	}

	public clone() {
		let newGene = new Gene(this.inputLayer.neurons.length)

		newGene.outputLayer.neurons = this.outputLayer.neurons.map(x => new Neuron())
		newGene.inputLayer.neurons = this.inputLayer.neurons.map(x => {
			let n = new Neuron()

			for (let con of x.connections) {
				// ignore
			}

			return n
		})

		for (let neuron of newGene.inputLayer.neurons) {
			// ignore
		}
	}
}
