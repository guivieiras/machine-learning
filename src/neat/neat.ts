import Car from '../car'
import Brain from './brain'
import Gene from './gene'
import Generation from './generation'
import Genome from './genome'

let populationSize: number = 10

let genome = new Genome()

export function startLearning(scene: Phaser.Scene, cars: Car[]) {
	let generation: Generation = genome.createGeneration()
	let genes: Gene[] = generation.createGenes(populationSize)

	for (let gene of genes) {
		let car = new Car(scene)
		gene.getInputs = car.getInputs
		gene.brain = new Brain(car.onUpdate)

		cars.push(car)
		carBrain(car)
	}
}

function carBrain(car: Car) {
	let brain = new Brain(car)
	car.onUpdate = brain.onUpdate
}
