import { generateKeyPair } from 'crypto'
import Car from '../car'
import Brain from './brain'
import Connection from './connection'
import Gene from './gene'
import Layer from './layer'
import Neuron from './neuron'

export default class Entity {
	public gene: Gene
	public brain: Brain

	public car: Car

	public getInputs: () => number[]

	constructor(car: Car, gene: Gene, brain: Brain) {
		// gene.hiddenLayer.neurons = [1, 2, 3, 4, 5].map(x => new Neuron())
		this.gene = gene
		this.brain = brain
		this.car = car
		gene.inputLayer.neurons = new Array(car.getInputs().length).fill(new Neuron())
		gene.outputLayer.neurons = new Array(4).fill(new Neuron())

		for (let neuron of gene.inputLayer.neurons) {
			for (let n of gene.outputLayer.neurons) {
				// neuron.value = Math.random() * 2 - 1
				neuron.connections.push(new Connection(n, Math.random() * 2 - 1))
			}
		}
	}

	public think() {
		// ignore
	}

	public update(car: Car) {
		let input = Math.round(Math.random())
		for (let i = 0; i < this.gene.inputLayer.neurons.length; i++) {
			this.gene.inputLayer.neurons[i].value = car.getInputs()[i]

			for (let connection of this.gene.inputLayer.neurons[i].connections) {
				console.log(
					connection.weight,
					this.gene.inputLayer.neurons[i].value,
					sigmoid(connection.weight * this.gene.inputLayer.neurons[i].value)
				)
				connection.to.value = sigmoid(connection.weight * this.gene.inputLayer.neurons[i].value)
			}
		}

		for (let i = 0; i < this.gene.outputLayer.neurons.length; i++) {
			if (i === 0 && this.gene.outputLayer.neurons[i].value > 0.5) {
				this.car.upKey = true
				this.car.downKey = false
			}
			if (i === 1 && this.gene.outputLayer.neurons[i].value > 0.5) {
				this.car.upKey = false
				this.car.downKey = true
			}
			if (i === 2 && this.gene.outputLayer.neurons[i].value > 0.5) {
				this.car.leftKey = true
				this.car.rightKey = false
			}
			if (i === 3 && this.gene.outputLayer.neurons[i].value > 0.5) {
				this.car.leftKey = false
				this.car.rightKey = true
			}
		}
		// if (input === 0) {
		// 	car.rightKey = true
		// 	car.leftKey = false
		// }
		// if (input === 1) {
		// 	car.rightKey = false
		// 	car.leftKey = true
		// }
		// car.upKey = true
		// ignore
	}
}

function sigmoid(t) {
	return 1 / (1 + Math.pow(Math.E, -t))
}
