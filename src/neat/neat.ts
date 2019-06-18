import { Scene } from 'phaser'
import Car from '../car'
import Brain from './brain'
import Entity from './entity'
import Gene from './gene'
import Generation from './generation'
import Genome from './genome'

let populationSize: number = 200

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
	if (cars[0]) {
		// document.getElementById('info').innerText = JSON.stringify(cars[0].entity.gene, null, 2)
	}

	if (cars.length > 0 && cars.every(x => !x.alive)) {
		let bestFitness = cars
			.sort((a, b) => {
				return b.fitness - a.fitness
			})
			.map(o => o.entity.gene)
			.slice(0, 2)
		// return
		let thisGeneration = genome.generations[genome.generations.length - 1]
		thisGeneration.forwardGeneration(bestFitness[0], bestFitness[1])
		for (let gene of thisGeneration.genes) {
			let car = new Car(scene)
			let brain = new Brain()

			let entity = new Entity(car, gene, brain)
			car.entity = entity

			cars.push(car)
		}
	}
}
