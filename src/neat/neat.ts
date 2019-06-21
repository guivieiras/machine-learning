import { Scene } from 'phaser'
import vis from 'vis'
import Car from '../car'
import Entity from './entity'
import Gene from './gene'
import Generation from './generation'
import Genome from './genome'

let populationSize: number = 100

let genome = new Genome()

let dsEdges = new vis.DataSet()
let dsNodes = new vis.DataSet()

document.addEventListener('DOMContentLoaded', event => {
	let modY = 60
	let modX = 180

	let container = document.getElementById('info')
	let data = {
		nodes: dsNodes,
		edges: dsEdges
	}
	let width = 900
	let height = 400
	let options = {
		width: width + 'px',
		height: height + 'px',
		nodes: {
			shape: 'circle'
		},
		// configure: {
		// 	enabled: true,
		// 	showButton: true
		// },
		edges: {
			color: {
				inherit: false
			},
			smooth: {
				type: 'cubicBezier',
				forceDirection: 'none',
				roundness: 0.6
			}
		},
		physics: false,
		interaction: {
			hover: true,
			dragNodes: false, // do not allow dragging nodes
			zoomView: false, // do not allow zooming
			dragView: false // do not allow dragging
		}
	}
	let network = new vis.Network(container, data, options)
	network.moveTo({
		position: { x: -40, y: -40 },
		offset: { x: -width / 2, y: -height / 2 },
		scale: 1
	})
})

export function startLearning(scene: Phaser.Scene, cars: Car[]) {
	let generation: Generation = genome.createGeneration()
	let genes: Gene[] = generation.createGenes(populationSize)

	for (let gene of genes) {
		let car = new Car(scene)

		let entity = new Entity(car, gene)
		car.entity = entity
		cars.push(car)
	}
}

let shoudUpdate = true
async function updateGraph(cars: Car[]) {
	if (cars[0] && shoudUpdate) {
		shoudUpdate = false

		let bestFitness = cars.sort((a, b) => b.fitness - a.fitness)[0]

		let g = bestFitness.entity.gene // cars[0].entity.gene
		let modY = 60
		let modX = 300

		for (const { item, index } of g.inputLayer.map((itm, indx) => ({ item: itm, index: indx }))) {
			dsNodes.update({ id: 'input' + index, label: item.value.toFixed(2), x: 0, y: index * modY })

			for (const { item2, index2 } of item.connections.map((itm, indx) => ({ item2: itm, index2: indx }))) {
				dsEdges.update({
					id: 'input' + index + index2,
					from: 'input' + index,
					to: 'hidden' + index2,
					color: { color: item2.weight > 0 ? '#ff0000' : '#00ff00' },
					width: Math.abs(item2.weight)
				})
			}
		}
		for (const { item, index } of g.hiddenLayer.map((itm, indx) => ({ item: itm, index: indx }))) {
			dsNodes.update({ id: 'hidden' + index, label: item.value.toFixed(2), x: 1 * modX, y: index * modY })

			for (const { item2, index2 } of item.connections.map((itm, indx) => ({ item2: itm, index2: indx }))) {
				dsEdges.update({
					id: 'hidden' + index + index2,
					from: 'hidden' + index,
					to: 'output' + index2,
					color: { color: item2.weight > 0 ? '#ff0000' : '#00ff00' },
					width: Math.abs(item2.weight)
				})
			}
		}
		for (const { item, index } of g.outputLayer.map((itm, indx) => ({ item: itm, index: indx }))) {
			dsNodes.update({ id: 'output' + index, label: item.value.toFixed(2), x: 2 * modX, y: index * modY })
		}

		setTimeout(() => (shoudUpdate = true), 1000)
	}
}

let lastTopFitness = 0
let weight = 0.2
export function updateLearning(scene: Scene, cars: Car[]) {
	updateGraph(cars)

	if (cars.length > 0 && cars.every(x => !x.alive)) {
		let bestFitness = cars
			.sort((a, b) => {
				return b.fitness - a.fitness
			})
			.slice(0, 2)

		// return
		cars.length = 0
		let thisGeneration = genome.generations[genome.generations.length - 1]
		if (lastTopFitness <= bestFitness[0].fitness) {
			weight += 0.1
		} else {
			weight = 0.2
		}
		lastTopFitness = Math.max(bestFitness[0].fitness, lastTopFitness)
		thisGeneration.forwardGeneration(bestFitness[0].entity.gene, bestFitness[1].entity.gene, weight)
		for (let gene of thisGeneration.genes) {
			let car = new Car(scene)

			let entity = new Entity(car, gene)
			car.entity = entity

			cars.push(car)
		}
	}
}
