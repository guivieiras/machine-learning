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
	public count = 0

	constructor(car: Car, gene: Gene, brain: Brain) {
		this.gene = gene
		this.brain = brain
		this.car = car
	}

	public update(car: Car) {
		for (let n of this.gene.hiddenLayer) {
			n.value = 0
		}
		for (let n of this.gene.inputLayer) {
			n.value = 0
		}
		for (let n of this.gene.outputLayer) {
			n.value = 0
		}

		let inputs = car.getInputs()
		for (let i = 0; i < this.gene.inputLayer.length; i++) {
			let neuron = this.gene.inputLayer[i]
			neuron.maxvalue = Math.max(neuron.maxvalue, inputs[i])
			neuron.minvalue = Math.min(neuron.minvalue, inputs[i])
			neuron.value = remap(inputs[i], 0, 500, 0, 1)
			for (let connection of neuron.connections) {
				connection.to.value += connection.weight * neuron.value
			}
		}
		// for (let i = 0; i < this.gene.hiddenLayer.length; i++) {
		// 	this.gene.hiddenLayer[i].value = sigmoid(this.gene.hiddenLayer[i].value)
		// }
		for (let i = 0; i < this.gene.hiddenLayer.length; i++) {
			for (let connection of this.gene.hiddenLayer[i].connections) {
				connection.to.value += connection.weight * this.gene.hiddenLayer[i].value
			}
		}
		if (this.count++ === 1) {
			// throw new Error('oie')
		}
		// for (let i = 0; i < this.gene.outputLayer.length; i++) {
		// 	this.gene.outputLayer[i].value = sigmoid(this.gene.outputLayer[i].value)
		// }

		this.steer3()
	}

	public sixOut() {
		if (this.gene.outputLayer[0].value > this.gene.outputLayer[1].value && this.gene.outputLayer[0].value > this.gene.outputLayer[2].value) {
			this.car.upKey = true
			this.car.downKey = false
		} else if (this.gene.outputLayer[1].value > this.gene.outputLayer[0].value && this.gene.outputLayer[1].value > this.gene.outputLayer[2].value) {
			this.car.upKey = false
			this.car.downKey = true
		} else {
			this.car.upKey = false
			this.car.downKey = false
		}
		if (this.gene.outputLayer[3].value > this.gene.outputLayer[4].value && this.gene.outputLayer[3].value > this.gene.outputLayer[5].value) {
			this.car.leftKey = true
			this.car.rightKey = false
		} else if (this.gene.outputLayer[4].value > this.gene.outputLayer[3].value && this.gene.outputLayer[4].value > this.gene.outputLayer[5].value) {
			this.car.leftKey = false
			this.car.rightKey = true
		} else {
			this.car.leftKey = false
			this.car.rightKey = false
		}
	}

	public steer3() {
		if (this.gene.outputLayer[0].value > this.gene.outputLayer[1].value) {
			this.car.upKey = true
			this.car.downKey = false
		} else {
			this.car.upKey = false
			this.car.downKey = false
		}
		this.car.steerRatio = Math.max(Math.min(this.gene.outputLayer[2].value, 1), -1)
	}

	public fourOut() {
		if (this.gene.outputLayer[0].value > this.gene.outputLayer[1].value) {
			this.car.upKey = true
		} else {
			this.car.upKey = false
		}
		if (this.gene.outputLayer[2].value > this.gene.outputLayer[3].value) {
			this.car.leftKey = true
			this.car.rightKey = false
		} else {
			this.car.leftKey = false
			this.car.rightKey = true
		}
	}

	public fiveOut() {
		if (this.gene.outputLayer[0].value > this.gene.outputLayer[1].value) {
			this.car.upKey = true
			this.car.downKey = false
		} else {
			this.car.upKey = false
			this.car.downKey = false
		}
		if (this.gene.outputLayer[2].value > this.gene.outputLayer[3].value && this.gene.outputLayer[2].value > this.gene.outputLayer[4].value) {
			this.car.leftKey = true
			this.car.rightKey = false
		} else if (this.gene.outputLayer[3].value > this.gene.outputLayer[2].value && this.gene.outputLayer[3].value > this.gene.outputLayer[4].value) {
			this.car.leftKey = false
			this.car.rightKey = true
		} else {
			this.car.leftKey = false
			this.car.rightKey = false
		}
	}
}

function sigmoid(t) {
	return 1 / (1 + Math.pow(Math.E, -t))
}

function remap(n, start1, stop1, start2, stop2) {
	return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}
