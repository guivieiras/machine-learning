import Phaser, { Curves } from 'phaser'
import util from 'util'

let config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	parent: 'phaser-example',
	physics: {
		default: 'matter',
		matter: {
			debug: true,
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
}

let car: Phaser.Physics.Matter.Image
let tracker1: Phaser.GameObjects.Rectangle
let tracker2: Phaser.GameObjects.Rectangle
let cursors: Phaser.Types.Input.Keyboard.CursorKeys

let game = new Phaser.Game(config)

function preload(this: Phaser.Scene) {
	this.load.image('soil', 'https://labs.phaser.io/assets/textures/soil.png')
	this.load.image('car', 'https://labs.phaser.io/assets/sprites/car-yellow.png')
}

let trackPoints = []
let trackLines: Phaser.Geom.Line[] = []

let tPrevious
let pointPrevious
let leftPrevious
let rightPrevious

function createTrack(this: Phaser.Scene) {
	let startPoint = new Phaser.Math.Vector2(0, 300)
	let controlPoint1 = new Phaser.Math.Vector2(100, 100)
	let controlPoint2 = new Phaser.Math.Vector2(200, 100)
	let endPoint = new Phaser.Math.Vector2(300, 300)

	let curvex = new Phaser.Curves.Spline([
		new Phaser.Math.Vector2(100, 500),
		new Phaser.Math.Vector2(260, 450),
		new Phaser.Math.Vector2(300, 250),
		new Phaser.Math.Vector2(550, 145),
		new Phaser.Math.Vector2(745, 256)
	])

	let r = this.add.curve(400, 300, curvex)

	// r.setStrokeStyle(2, 0xff0000)

	let lineCategory = this.matter.world.nextCategory()
	let ballsCategory = this.matter.world.nextCategory()

	let sides = 4
	let size = 14
	let distance = size
	let lastPosition = new Phaser.Math.Vector2()

	let graphics = this.add.graphics()

	this.input.on(
		'pointerdown',
		function(pointer: Phaser.Input.Pointer) {
			lastPosition.x = pointer.x
			lastPosition.y = pointer.y

			if (!curve) {
				curve = new Phaser.Curves.Spline([new Phaser.Math.Vector2(pointer.x, pointer.y)])
			} else {
				curve.addPoint(pointer.x, pointer.y)
			}
		},
		this
	)

	this.input.on(
		'pointermove',
		function(pointer: Phaser.Input.Pointer) {
			if (pointer.isDown) {
				let x = pointer.x
				let y = pointer.y

				if (Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y) > distance) {
					lastPosition.x = x
					lastPosition.y = y

					curve.addPoint(x, y)

					graphics.clear()
					graphics.lineStyle(1, 0xbbbbbb)
					graphics.fillStyle(0xffff00)
					for (let point of curve.getPoints(64)) {
						// graphics.fillPointShape(point, 5)
					}

					let t = curve.getUtoTmapping(0.7, undefined)
					let p = curve.getPoint(t)
					console.log(t, p)

					// let a = curve
					// 	.getTangent(t)
					// 	.scale(50)
					// 	.add(p)

					// graphics.lineBetween(p.x, p.y, a.x, a.y)

					let left = curve
						.getTangent(t)
						.scale(50)
						.normalizeRightHand()
						.add(p)

					// graphics.lineBetween(p.x, p.y, left.x, left.y)

					let right = curve
						.getTangent(t)
						.scale(-50)
						.normalizeRightHand()
						.add(p)

					// graphics.lineBetween(p.x, p.y, right.x, right.y)

					if (leftPrevious) {
						trackLines.push(new Phaser.Geom.Line(leftPrevious.x, leftPrevious.y, left.x, left.y))
						trackLines.push(new Phaser.Geom.Line(rightPrevious.x, rightPrevious.y, right.x, right.y))
					}

					leftPrevious = left
					rightPrevious = right
					// pointPrevious = point

					let tempVec = new Phaser.Math.Vector2()

					// console.log(curve.getPoints().length)

					// graphics.lineStyle(50, 0xbbbbbb)
					curve.draw(graphics, 64)
				}
			}
		},
		this
	)
}

function create(this: Phaser.Scene) {
	// this.add.tileSprite(640, 360, 1280, 720, 'soil')
	createTrack.call(this)

	car = this.matter.add.image(400, 300, 'car')
	car.setScale(0.3)
	// car.setAngle(-90)
	car.setFrictionAir(0.1)
	car.setMass(10)

	tracker1 = this.add.rectangle(30, 30, 4, 4, 0x00ff00)
	tracker2 = this.add.rectangle(0, 0, 4, 4, 0xff0000)
	this.add.rectangle(100, 100, 4, 4, 0x0000ff)

	// visionLine = this.add.rectangle(30, 30, 20, 20, 0xff0000)
	// visionLine.setPosition(1, 1)
	// visionLine = new Phaser.Geom.Line(100, 500, 700, 100)
	visionLine1 = new Phaser.Geom.Line(0, 0, 0, 0)
	visionLine2 = new Phaser.Geom.Line(0, 0, 0, 0)
	visionLine3 = new Phaser.Geom.Line(0, 0, 0, 0)
	visionLine4 = new Phaser.Geom.Line(0, 0, 0, 0)
	visionLine5 = new Phaser.Geom.Line(0, 0, 0, 0)

	visionLineGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } })

	cursors = this.input.keyboard.createCursorKeys()

	this.matter.world.setBounds(0, 0, 1280, 720)
	console.log(car)
}
let curve: Phaser.Curves.Spline
let visionLineGraphics: Phaser.GameObjects.Graphics

function angle(degrees, changeAngle) {
	return ((degrees + changeAngle) * Math.PI) / 180
}

function update(this: Phaser.Scene) {
	let point1 = car.getTopRight()
	let point2 = car.getBottomRight()
	let point3 = car.getCenter()

	tracker1.setPosition(point1.x, point1.y)
	tracker2.setPosition(point3.x, point3.y)

	visionLineGraphics.clear()

	let middleX = Math.cos(angle(car.angle, 90)) * (car.displayHeight / 2) + point1.x
	let middleY = Math.sin(angle(car.angle, 90)) * (car.displayHeight / 2) + point1.y

	visionLine1.setTo(point1.x, point1.y, Math.cos(angle(car.angle, -90)) * 300 + point1.x, Math.sin(angle(car.angle, -90)) * 300 + point1.y)
	visionLine2.setTo(point1.x, point1.y, Math.cos(angle(car.angle, -45)) * 300 + point1.x, Math.sin(angle(car.angle, -45)) * 300 + point1.y)
	visionLine3.setTo(middleX, middleY, Math.cos(car.body.angle) * 300 + middleX, Math.sin(car.body.angle) * 300 + middleY)
	visionLine4.setTo(point2.x, point2.y, Math.cos(angle(car.angle, 45)) * 300 + point2.x, Math.sin(angle(car.angle, 45)) * 300 + point2.y)
	visionLine5.setTo(point2.x, point2.y, Math.cos(angle(car.angle, 90)) * 300 + point2.x, Math.sin(angle(car.angle, 90)) * 300 + point2.y)

	let intersects: boolean = false
	if (curve) {
		for (let point of curve.getPoints()) {
			if (Phaser.Geom.Intersects.PointToLine(point, visionLine3, 64)) {
				visionLineGraphics.lineStyle(5, 0xff0000)
				break
			}
		}
	}
	for (let line of [visionLine1, visionLine2, visionLine3, visionLine4, visionLine5]) {
		visionLineGraphics.strokeLineShape(line)
	}

	let speed = 0.25
	// let angle = { x: speed * Math.cos(car.angle), y: speed * Math.sin(car.body.angle) }
	let stuff = {
		car: {
			angle: car.angle,
			rotation: car.rotation,
			sin: Math.sin(car.angle),
			cos: Math.cos(car.angle)
		},
		body: {
			angle: car.body.angle,
			rotation: car.body.rotation,
			sin: Math.sin(car.body.angle),
			cos: Math.cos(car.body.angle)
		},
		speed: car.body.speed,
		angleTurn: car.body.speed > 0.1 ? car.body.speed * 0.55 : 0
	}
	// document.getElementById('info').innerHTML = JSON.stringify(car.body, null, 2)
	document.getElementById('info').innerHTML = util.inspect(stuff)
	// let angle = { x: 0, y: 0 }

	if (cursors.left.isDown) {
		// car.applyForceFrom({ x: point1.x, y: point1.y }, { x: -0.01 * (car.body.speed / 10), y: 0 })

		// Phaser.Physics.Matter.Matter.Body.setAngularVelocity(car.body, -0.05)
		car.angle -= stuff.angleTurn
		// Phaser.Physics.Matter.Matter.Body.setAngularVelocity(car.body, -10 * (car.body.speed / 1000))
	} else if (cursors.right.isDown) {
		//car.applyForceFrom({ x: point2.x, y: point2.y }, { x: speed * Math.cos(car.body.angle), y: 0 });
		// car.applyForceFrom();
		// Phaser.Physics.Matter.Matter.Body.setAngularVelocity(car.body, 0.05)
		//
		// Phaser.Physics.Matter.Matter.Body.setAngularVelocity(car.body, 10 * (car.body.speed / 1000))
		car.angle += stuff.angleTurn
	}

	if (cursors.up.isDown) {
		car.thrust(0.015)
	} else if (cursors.down.isDown) {
		car.thrustBack(0.01)
	}

	renderTrack()
}

let visionLine1: Phaser.Geom.Line
let visionLine2: Phaser.Geom.Line
let visionLine3: Phaser.Geom.Line
let visionLine4: Phaser.Geom.Line
let visionLine5: Phaser.Geom.Line
function renderTrack() {
	for (let line of trackLines) {
		visionLineGraphics.strokeLineShape(line)
	}
}
