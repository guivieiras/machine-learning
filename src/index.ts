import Phaser, { Curves } from 'phaser'
import Car from './car'
import { startLearning, updateLearning } from './neat/neat'
import Track from './track'

let config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1500,
	height: 1500,
	parent: 'phaser-example',
	physics: {
		default: 'matter',
		matter: {
			debug: false,
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: {
		preload,
		create,
		update
	}
}

new Phaser.Game(config)

function preload(this: Phaser.Scene) {
	this.load.image('soil', 'https://labs.phaser.io/assets/textures/soil.png')
	this.load.image('car', 'https://labs.phaser.io/assets/sprites/car-yellow.png')
}

let cars: Car[] = []
let track: Track
let cursors: Phaser.Types.Input.Keyboard.CursorKeys

function create(this: Phaser.Scene) {
	// this.add.tileSprite(640, 360, 1280, 720, 'soil')

	track = new Track(this)

	if (localStorage.checkpoints) {
		for (let line of JSON.parse(localStorage.leftLines)) {
			track.leftLines.push(new Phaser.Geom.Line(line.x1, line.y1, line.x2, line.y2))
		}
		for (let line of JSON.parse(localStorage.rightLines)) {
			track.rightLines.push(new Phaser.Geom.Line(line.x1, line.y1, line.x2, line.y2))
		}
		for (let line of JSON.parse(localStorage.checkpoints)) {
			track.checkpoints.push(new Phaser.Geom.Line(line.x1, line.y1, line.x2, line.y2))
		}
	}

	document.addEventListener('keyup', key => {
		console.log(key.code)
		if (key.code === 'Semicolon') {
			startLearning(this, cars)
		}
		if (key.code === 'KeyA') {
			isUserPlaying = true
			cars.push(new Car(this))
		}
		if (key.code === 'KeyR') {
			Car.forward = !Car.forward
		}
		if (key.code === 'KeyS') {
			localStorage.leftLines = JSON.stringify(track.leftLines)
			localStorage.rightLines = JSON.stringify(track.rightLines)
			localStorage.checkpoints = JSON.stringify(track.checkpoints)
		}
		if (key.code === 'KeyC') {
			track.curve = undefined
			track.leftLines = []
			track.rightLines = []
			track.checkpoints = []
			track.leftPrevious = undefined
			track.rightPrevious = undefined
			track.lastPosition = new Phaser.Math.Vector2()
		}
	})

	cursors = this.input.keyboard.createCursorKeys()
	this.matter.world.setBounds(0, 0, 1500, 1500)
}
let isUserPlaying
function update(this: Phaser.Scene) {
	track.update()
	for (let car of cars.filter(x => x.alive)) {
		if (isUserPlaying) {
			car.downKey = cursors.down.isDown
			car.leftKey = cursors.left.isDown
			car.rightKey = cursors.right.isDown
			car.upKey = cursors.up.isDown
		}
		car.update(track.trackLines, track.checkpoints)
	}
	if (!isUserPlaying) {
		updateLearning(this, cars)
	}
}
