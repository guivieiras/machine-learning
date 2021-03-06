import { Scene } from 'phaser'
import vis from 'vis'
import Car from '../car'
import Entity from './entity'
import Gene from './gene'
import Generation from './generation'
import Genome from './genome'

export default class Neat {
	public static populationSize: number = 200
	public static initialMutation: number = 0.2
	public static mutationIncrease: number = 0.1

	public genome = new Genome()

	public dsEdges = new vis.DataSet()
	public dsNodes = new vis.DataSet()

	public shoudUpdate = true

	public lastTopFitness = 0
	public actualMutation = 0.2
	public paused = false

	constructor() {
		document.addEventListener('DOMContentLoaded', event => {
			let modY = 60
			let modX = 180

			let container = document.getElementById('info')
			let data = {
				nodes: this.dsNodes,
				edges: this.dsEdges
			}
			let width = 900
			let height = 620
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
						roundness: .33
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
	}

	public startLearning(scene: Phaser.Scene, cars: Car[]) {
		let generation: Generation = this.genome.createGeneration()
		let genes: Gene[] = generation.createGenes(Neat.populationSize, Car.visionsLenght + 1)

		for (let gene of genes) {
			let car = new Car(scene)

			let entity = new Entity(car, gene)
			car.entity = entity
			cars.push(car)
		}
	}
	public async updateGraph(cars: Car[]) {
		if (cars[0] && this.shoudUpdate) {
			this.shoudUpdate = false

			let bestFitness = cars.sort((a, b) => b.fitness - a.fitness)[0]

			let g = bestFitness.entity.gene // cars[0].entity.gene
			let modY = 60
			let modX = 300

			for (const { item, index } of g.inputLayer.map((itm, indx) => ({
				item: itm,
				index: indx
			}))) {
				this.dsNodes.update({
					id: 'input' + index,
					label: item.value.toFixed(2),
					x: 0,
					y: index * modY
				})

				for (const { item2, index2 } of item.connections.map((itm, indx) => ({ item2: itm, index2: indx }))) {
					this.dsEdges.update({
						id: 'input' + index + index2,
						from: 'input' + index,
						to: 'hidden' + index2,
						color: { color: item2.weight > 0 ? '#ff0000' : '#00ff00' },
						width: Math.abs(item2.weight)
					})
				}
			}
			for (const { item, index } of g.hiddenLayer.map((itm, indx) => ({
				item: itm,
				index: indx
			}))) {
				this.dsNodes.update({
					id: 'hidden' + index,
					label: item.value.toFixed(2),
					x: 1 * modX,
					y: index * modY
				})

				for (const { item2, index2 } of item.connections.map((itm, indx) => ({ item2: itm, index2: indx }))) {
					this.dsEdges.update({
						id: 'hidden' + index + index2,
						from: 'hidden' + index,
						to: 'output' + index2,
						color: { color: item2.weight > 0 ? '#ff0000' : '#00ff00' },
						width: Math.abs(item2.weight)
					})
				}
			}
			for (const { item, index } of g.outputLayer.map((itm, indx) => ({
				item: itm,
				index: indx
			}))) {
				this.dsNodes.update({
					id: 'output' + index,
					label: item.value.toFixed(2),
					x: 2 * modX,
					y: index * modY
				})
			}

			setTimeout(() => (this.shoudUpdate = true), 10000)
		}
	}
	public pauseUnpause(b) {
		this.paused = b
	}
	public updateLearning(scene: Scene, cars: Car[]) {
		this.updateGraph(cars)

		if (cars.length > 0 && cars.every(x => !x.alive) && !this.paused) {
			let bestFitness = cars
				.sort((a, b) => {
					return b.fitness - a.fitness
				})
				.slice()

			// return
			cars.length = 0
			let thisGeneration = this.genome.generations[this.genome.generations.length - 1]
			if (this.lastTopFitness >= bestFitness[0].fitness) {
				this.actualMutation += Neat.mutationIncrease
			} else {
				this.actualMutation = Neat.initialMutation
			}
			this.lastTopFitness = Math.max(bestFitness[0].fitness, this.lastTopFitness)
			thisGeneration.forwardGeneration(bestFitness.map(x => x.entity.gene), this.actualMutation)
			for (let gene of thisGeneration.genes) {
				let car = new Car(scene)

				let entity = new Entity(car, gene)
				car.entity = entity

				cars.push(car)
			}
		}
	}
}
