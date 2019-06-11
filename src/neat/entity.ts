import Car from '../car'
import Brain from './brain'
import Gene from './gene'

export default class Entity {
	public gene: Gene
	public brain: Brain

	public car: Car

	public onUpdate: (car: Car) => void
	public getInputs: () => number[]

	constructor(car: Car, gene: Gene, brain: Brain) {
		this.gene = gene
		this.brain = brain
		this.car = car

		car.onUpdate = this.update
	}

	public think() {
		// ignore
	}

	public update(car: Car) {
		let input = Math.round(Math.random())
		if (input === 0) {
			car.rightKey = true
			car.leftKey = false
		}
		if (input === 1) {
			car.rightKey = false
			car.leftKey = true
		}
		car.upKey = true
		// ignore
	}
}
