import Phaser, { Curves } from 'phaser'
import Car from './car'
import Neat from './neat/neat'
import Track from './track'

let trackSize = {
	width: window.innerWidth,
	height: window.innerHeight
}

let config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: trackSize.width,
	height: trackSize.height,
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
let neat: Neat = new Neat()

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
			neat.startLearning(this, cars)
		}
		if (key.code === 'KeyA') {
			isUserPlaying = true
			cars.push(new Car(this))
		}
		if (key.code === 'KeyR') {
			Car.forward = !Car.forward
			neat.weight = 0.2
			neat.lastTopFitness = 0
		}
		if (key.code === 'KeyP') {
			cars.forEach(x => x.kill())
			neat.pauseUnpause(true)
		}
		if (key.code === 'KeyU') {
			neat.pauseUnpause(false)
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
	this.matter.world.setBounds(0, 0, trackSize.width, trackSize.height)
}
let isUserPlaying
let g: Phaser.GameObjects.Graphics
function update(this: Phaser.Scene) {
	if (!g) { g = this.add.graphics() }

	g.fillStyle(0xff0000)
	g.fillPoint(Car.carSpawn.x, Car.carSpawn.y, 10)

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
		neat.updateLearning(this, cars)
	}
}
