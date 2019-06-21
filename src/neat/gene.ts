import Connection from './connection'
import Layer from './layer'
import Neuron from './neuron'

export default class Gene {
	public inputLayer: Neuron[] = []
	public hiddenLayer: Neuron[] = []
	public outputLayer: Neuron[] = []

	constructor(inputLenght: number) {
		this.inputLayer = new Array(inputLenght).fill('').map(x => new Neuron())
		this.hiddenLayer = new Array(inputLenght).fill('').map(x => new Neuron())
		this.outputLayer = new Array(3).fill('').map(x => new Neuron())

		for (let neuron of this.inputLayer) {
			for (let n of this.hiddenLayer) {
				let rnd = Math.random() * 2 - 1
				// if (rnd > 0.8) {
				neuron.connections.push(new Connection(neuron, n, Math.random() * 2 - 1))
				// }
			}
		}
		for (let neuron of this.hiddenLayer) {
			for (let n of this.outputLayer) {
				let rnd = Math.random() * 2 - 1
				// if (rnd > 0.8) {
				neuron.connections.push(new Connection(neuron, n, Math.random() * 2 - 1))
				// }
			}
		}
	}

	public clone(): Gene {
		let newGene = new Gene(this.inputLayer.length)

		newGene.outputLayer = this.outputLayer.map(x => new Neuron(x.id))
		newGene.hiddenLayer = this.hiddenLayer.map(x => new Neuron(x.id))
		newGene.inputLayer = this.inputLayer.map(x => new Neuron(x.id))

		function getNeuronById(id) {
			return [...newGene.outputLayer, ...newGene.inputLayer, ...newGene.hiddenLayer].find(x => x.id === id)
		}

		for (let i = 0; i < this.inputLayer.length; i++) {
			newGene.inputLayer[i].connections = this.inputLayer[i].connections.map(x => ({
				from: getNeuronById(x.from.id),
				to: getNeuronById(x.to.id),
				weight: x.weight
			}))
		}
		for (let i = 0; i < this.inputLayer.length; i++) {
			newGene.hiddenLayer[i].connections = this.hiddenLayer[i].connections.map(x => ({
				from: getNeuronById(x.from.id),
				to: getNeuronById(x.to.id),
				weight: x.weight
			}))
		}

		return newGene
	}
}
