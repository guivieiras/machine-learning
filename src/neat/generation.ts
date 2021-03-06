import { generateKeyPairSync } from 'crypto'
import Connection from './connection'
import Gene from './gene'

export default class Generation {
	public genes: Gene[] = []

	public static elitism: number = 2;

	public forwardGeneration(bestGenes: Gene[], weightVariation: number = 0.2) {
		let total = weightVariation * 20

		for (let i = 0; i < Generation.elitism; i++) {
			this.genes[i] = bestGenes[i]
		}

		for (let i = Generation.elitism; i < this.genes.length; i++) {
			this.genes[i] = this.genes[i % Generation.elitism].clone()
			for (let neuron of this.genes[i].inputLayer) {
				for (let connection of neuron.connections) {
					connection.weight += (Math.random() * total) / 10 - weightVariation
					// connection.weight = connection.weight > 1 ? 1 : connection.weight < -1 ? -1 : connection.weight
				}
			}

			for (let neuron of this.genes[i].hiddenLayer) {
				for (let connection of neuron.connections) {
					connection.weight += (Math.random() * total) / 10 - weightVariation
					// connection.weight = connection.weight > 1 ? 1 : connection.weight < -1 ? -1 : connection.weight
				}
			}
		}
	}

	public createGenes(quantity: number, inputSize: number) {
		for (let i = 0; i < quantity; i++) {
			this.genes.push(new Gene(inputSize))
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
