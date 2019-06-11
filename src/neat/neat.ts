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
		cars.push(car)
	}
}
