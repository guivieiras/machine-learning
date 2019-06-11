export default class Car {
	get visions(): Phaser.Geom.Line[] {
		return [this.visionLine1, this.visionLine2, this.visionLine3, this.visionLine4, this.visionLine5]
	}

	get sides(): Phaser.Geom.Line[] {
		let leftSide = new Phaser.Geom.Line(
			this.matterImage.getTopLeft().x,
			this.matterImage.getTopLeft().y,
			this.matterImage.getTopRight().x,
			this.matterImage.getTopRight().y
		)
		let frontSide = new Phaser.Geom.Line(
			this.matterImage.getTopRight().x,
			this.matterImage.getTopRight().y,
			this.matterImage.getBottomRight().x,
			this.matterImage.getBottomRight().y
		)
		let downSide = new Phaser.Geom.Line(
			this.matterImage.getBottomLeft().x,
			this.matterImage.getBottomLeft().y,
			this.matterImage.getBottomRight().x,
			this.matterImage.getBottomRight().y
		)
		let backSide = new Phaser.Geom.Line(this.matterImage.getTopLeft().x, this.matterImage.getTopLeft().y, this.matterImage.getBottomLeft().x, this.matterImage.getBottomLeft().y)

		return [leftSide, frontSide, downSide, backSide]
	}
	public matterImage: Phaser.Physics.Matter.Image
	public graphics: Phaser.GameObjects.Graphics

	public visionLine1 = new Phaser.Geom.Line(0, 0, 0, 0)
	public visionLine2 = new Phaser.Geom.Line(0, 0, 0, 0)
	public visionLine3 = new Phaser.Geom.Line(0, 0, 0, 0)
	public visionLine4 = new Phaser.Geom.Line(0, 0, 0, 0)
	public visionLine5 = new Phaser.Geom.Line(0, 0, 0, 0)
	public alive: boolean = true
	public leftKey: boolean = false
	public rightKey: boolean = false
	public upKey: boolean = false
	public downKey: boolean = false

	public fitness: number = 0

	public onUpdate: (car: Car) => void

	private lastCheckpoint: Phaser.Geom.Line

	constructor(scene: Phaser.Scene) {
		this.matterImage = scene.matter.add.image(400, 615, 'car')
		this.matterImage.setScale(0.3)
		this.matterImage.setFrictionAir(0.07)
		this.matterImage.setMass(10)
		this.matterImage.setCollisionGroup(-1)

		this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffffff } })
	}

	public getInputs(): any {
		// return {
		// 	line1: Phaser.Geom.Line.Length(this.visionLine1),
		// 	line2: Phaser.Geom.Line.Length(this.visionLine2),
		// 	line3: Phaser.Geom.Line.Length(this.visionLine3),
		// 	line4: Phaser.Geom.Line.Length(this.visionLine4),
		// 	line5: Phaser.Geom.Line.Length(this.visionLine5),
		// 	speed: this.matterImage.body.speed
		// }
		return [
			Phaser.Geom.Line.Length(this.visionLine1),
			Phaser.Geom.Line.Length(this.visionLine2),
			Phaser.Geom.Line.Length(this.visionLine3),
			Phaser.Geom.Line.Length(this.visionLine4),
			Phaser.Geom.Line.Length(this.visionLine5),
			this.matterImage.body.speed
		]
	}

	public update(trackLines: Phaser.Geom.Line[], checkpoints: Phaser.Geom.Line[]) {
		if (this.onUpdate) {
			this.onUpdate(this)
		}

		let point1 = this.matterImage.getTopRight()
		let point2 = this.matterImage.getBottomRight()

		this.graphics.clear()

		let visionSize = 500
		let middleX = Math.cos(angle(this.matterImage.angle, 90)) * (this.matterImage.displayHeight / 2) + point1.x
		let middleY = Math.sin(angle(this.matterImage.angle, 90)) * (this.matterImage.displayHeight / 2) + point1.y

		this.visionLine1.setTo(
			point1.x,
			point1.y,
			Math.cos(angle(this.matterImage.angle, -90)) * visionSize + point1.x,
			Math.sin(angle(this.matterImage.angle, -90)) * visionSize + point1.y
		)
		this.visionLine2.setTo(
			point1.x,
			point1.y,
			Math.cos(angle(this.matterImage.angle, -45)) * visionSize + point1.x,
			Math.sin(angle(this.matterImage.angle, -45)) * visionSize + point1.y
		)
		this.visionLine3.setTo(middleX, middleY, Math.cos(this.matterImage.body.angle) * visionSize + middleX, Math.sin(this.matterImage.body.angle) * visionSize + middleY)
		this.visionLine4.setTo(
			point2.x,
			point2.y,
			Math.cos(angle(this.matterImage.angle, 45)) * visionSize + point2.x,
			Math.sin(angle(this.matterImage.angle, 45)) * visionSize + point2.y
		)
		this.visionLine5.setTo(
			point2.x,
			point2.y,
			Math.cos(angle(this.matterImage.angle, 90)) * visionSize + point2.x,
			Math.sin(angle(this.matterImage.angle, 90)) * visionSize + point2.y
		)
		let bounds = this.matterImage.getBounds()
		for (let checkpoint of checkpoints) {
			if (Phaser.Geom.Intersects.LineToRectangle(checkpoint, bounds)) {
				for (let carSide of this.sides) {
					if (Phaser.Geom.Intersects.LineToLine(checkpoint, carSide) && this.lastCheckpoint !== checkpoint) {
						this.fitness++
						this.lastCheckpoint = checkpoint
					}
				}
			}
		}

		for (let line of trackLines) {
			if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
				for (let carSide of this.sides) {
					if (Phaser.Geom.Intersects.LineToLine(carSide, line)) {
						this.alive = false
						this.matterImage.setActive(false)
						this.matterImage.destroy()
						return
					}
				}
			}

			for (let vision of this.visions) {
				let out = new Phaser.Geom.Point()
				if (Phaser.Geom.Intersects.LineToLine(line, vision, out)) {
					let point = vision.getPointA()
					vision.setTo(point.x, point.y, out.x, out.y)
					this.graphics.lineStyle(2, 0xff0000)
				}
			}
		}
		for (let line of this.visions) {
			this.graphics.strokeLineShape(line)
		}

		// let angle = { x: speed * Math.cos(car.angle), y: speed * Math.sin(car.body.angle) }

		let angleTurn = this.matterImage.body.speed > 0.1 ? this.matterImage.body.speed * 0.55 : 0

		if (this.leftKey) {
			this.matterImage.angle -= angleTurn
		} else if (this.rightKey) {
			this.matterImage.angle += angleTurn
		}

		if (this.upKey) {
			this.matterImage.thrust(0.015)
		} else if (this.downKey) {
			this.matterImage.thrustBack(0.01)
		}
	}
}

function angle(degrees, changeAngle) {
	return ((degrees + changeAngle) * Math.PI) / 180
}
