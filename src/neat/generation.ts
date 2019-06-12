import { generateKeyPairSync } from 'crypto'
import Connection from './connection'
import Gene from './gene'

export default class Generation {
	public genes: Gene[] = []

	public forwardGeneration(gene: Gene) {
		this.genes[0] = gene.clone()
		for (let i = 1; i < this.genes.length; i++) {
			this.genes[i] = gene.clone()

			for (let neuron of this.genes[i].inputLayer) {
				for (let connection of neuron.connections) {
					connection.weight += (Math.random() * 2) / 10 - 0.2
				}

				for (let outNeuron of this.genes[i].outputLayer) {
					if (neuron.connections.every(x => x.to.id !== outNeuron.id)) {
						let rnd = Math.random() * 2 - 1
						if (rnd > 0.8) {
							neuron.connections.push(new Connection(outNeuron, Math.random() * 2 - 1))
						}
					}
				}
			}
		}
	}

	public createGenes(quantity: number) {
		for (let i = 0; i < quantity; i++) {
			this.genes.push(new Gene(6))
		}
		return this.genes
	}
}

function deepCopy(obj) {
	let copy

	// Handle the 3 simple types, and null or undefined
	if (null == obj || 'object' !== typeof obj) {
		return obj
	}

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date()
		copy.setTime(obj.getTime())
		return copy
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = []
		for (let i = 0, len = obj.length; i < len; i++) {
			copy[i] = deepCopy(obj[i])
		}
		return copy
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {}
		for (let attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				copy[attr] = deepCopy(obj[attr])
			}
		}
		return copy
	}

	throw new Error("Unable to copy obj! Its type isn't supported.")
}
