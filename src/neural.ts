import Car from './car'
import Track from './track'

let generations: any = []

let population: number = 10

function inputs(vision1, vision2, vision3, vision4, vision5, speed) {}

export function startLearning(scene: Phaser.Scene, cars: Car[]) {
	for (let i = 0; i < population; i++) {
		let car = new Car(scene)
		cars.push(car)
		carBrain(car)
	}
}

function carBrain(car: Car) {
	let brain = new Brain(car)
	car.onUpdate = brain.onUpdate
}

class Brain {
	public car: Car
	constructor(car: Car) {
		this.car = car
	}
	public onUpdate() {}
}
