import { Scene } from 'phaser'
import Car from '../car'
import Brain from './brain'
import Entity from './entity'
import Gene from './gene'
import Generation from './generation'
import Genome from './genome'

let populationSize: number = 100

let genome = new Genome()

export function startLearning(scene: Phaser.Scene, cars: Car[]) {
	let generation: Generation = genome.createGeneration()
	let genes: Gene[] = generation.createGenes(populationSize)

	for (let gene of genes) {
		let car = new Car(scene)
		let brain = new Brain()

		let entity = new Entity(car, gene, brain)
		car.entity = entity
		cars.push(car)
	}
}

export function updateLearning(scene: Scene, cars: Car[]) {
	if (cars.length > 0 && cars.every(x => !x.alive)) {
		let bestFitness = cars.reduce((acc, next) => {
			if (acc.fitness > next.fitness) {
				return acc
			} else if (acc.fitness === next.fitness && acc.aliveTicks < next.aliveTicks) {
				return acc
			} else {
				return next
			}
		})
		// console.log(bestFitness)
		return
		let thisGeneration = genome.generations[genome.generations.length - 1]
		thisGeneration.forwardGeneration(bestFitness.entity.gene)
		for (let gene of thisGeneration.genes) {
			let car = new Car(scene)
			let brain = new Brain()

			let entity = new Entity(car, gene, brain)
			car.entity = entity

			// console.log(car)
			// throw new Error('oie')
			cars.push(car)
		}
	}
}
