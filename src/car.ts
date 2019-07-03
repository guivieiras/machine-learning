import Entity, {remap} from './neat/entity'

export default class Car {

	public visions: Phaser.Geom.Line[] = []
	public visionsLenght: number = 15
	public static forward: boolean = true

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
		let backSide = new Phaser.Geom.Line(
			this.matterImage.getTopLeft().x,
			this.matterImage.getTopLeft().y,
			this.matterImage.getBottomLeft().x,
			this.matterImage.getBottomLeft().y
		)

		return [leftSide, frontSide, downSide, backSide]
	}
	public matterImage: Phaser.Physics.Matter.Image
	public graphics: Phaser.GameObjects.Graphics

	public alive: boolean = true
	public leftKey: boolean = false
	public rightKey: boolean = false
	public upKey: boolean = false
	public downKey: boolean = false
	public steerRatio: number
	public entity: Entity

	public fitness: number = 0
	public aliveTicks: number = 0
	public ticksToDie: number = 75
	public defaultTicksToDie: number = 75

	private lastCheckpoint: Phaser.Geom.Line

	constructor(scene: Phaser.Scene) {
		this.matterImage = scene.matter.add.image(400, 1420, 'car')
		this.matterImage.setScale(0.3)
		this.matterImage.setFrictionAir(0.07)
		this.matterImage.setMass(10)
		this.matterImage.setCollisionGroup(-1)
		this.matterImage.setRotation(!Car.forward ? 0 : Math.PI)

		this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffffff } })

		for (let i = 0; i< this.visionsLenght; i++){
			this.visions.push(new Phaser.Geom.Line(0, 0, 0, 0))
		}
	}

	public getInputs(): number[] {
		return [
			...this.visions.map(x=> Phaser.Geom.Line.Length(x)),
			this.matterImage.body.speed
		]
	}

	public modifyVisionLines(){
		let point1 = this.matterImage.getTopRight()
		let point2 = this.matterImage.getBottomRight()

		this.graphics.clear()

		let visionSize = 500
		let middleX = Math.cos(angle(this.matterImage.angle, 90)) * (this.matterImage.displayHeight / 2) + point1.x
		let middleY = Math.sin(angle(this.matterImage.angle, 90)) * (this.matterImage.displayHeight / 2) + point1.y


		for (let i = 0; i< this.visionsLenght;i++){
			let anglex = remap(i, 0, this.visionsLenght - 1, -90, 90)
			let h = remap(i, 0, this.visionsLenght -1, 0, this.matterImage.displayHeight)

			let x = Math.cos(angle(this.matterImage.angle, 90)) * h + point1.x
			let y = Math.sin(angle(this.matterImage.angle, 90)) * h + point1.y

			this.visions[i].setTo(
				x, 
				y,
				Math.cos(angle(this.matterImage.angle, anglex)) * visionSize + x,
				Math.sin(angle(this.matterImage.angle, anglex)) * visionSize + y 
			)
		}
	}

	public update(trackLines: Phaser.Geom.Line[], checkpoints: Phaser.Geom.Line[]) {
		if (this.entity) {
			this.entity.update(this)
		}

		let point1 = this.matterImage.getTopRight()
		let point2 = this.matterImage.getBottomRight()

		this.graphics.clear()

		this.modifyVisionLines()
		let visionSize = 500
		let middleX = Math.cos(angle(this.matterImage.angle, 90)) * (this.matterImage.displayHeight / 2) + point1.x
		let middleY = Math.sin(angle(this.matterImage.angle, 90)) * (this.matterImage.displayHeight / 2) + point1.y

		// this.visionLine1.setTo(
		// 	point1.x,
		// 	point1.y,
		// 	Math.cos(angle(this.matterImage.angle, -90)) * visionSize + point1.x,
		// 	Math.sin(angle(this.matterImage.angle, -90)) * visionSize + point1.y
		// )
		// this.visionLine2.setTo(
		// 	point1.x,
		// 	point1.y,
		// 	Math.cos(angle(this.matterImage.angle, -60)) * visionSize + point1.x,
		// 	Math.sin(angle(this.matterImage.angle, -60)) * visionSize + point1.y
		// )
		// this.visionLine3.setTo(
		// 	point1.x,
		// 	point1.y,
		// 	Math.cos(angle(this.matterImage.angle, -30)) * visionSize + point1.x,
		// 	Math.sin(angle(this.matterImage.angle, -30)) * visionSize + point1.y
		// )
		// this.visionLine4.setTo(
		// 	middleX,
		// 	middleY,
		// 	Math.cos(this.matterImage.body.angle) * visionSize + middleX,
		// 	Math.sin(this.matterImage.body.angle) * visionSize + middleY
		// )
		// this.visionLine5.setTo(
		// 	point2.x,
		// 	point2.y,
		// 	Math.cos(angle(this.matterImage.angle, 30)) * visionSize + point2.x,
		// 	Math.sin(angle(this.matterImage.angle, 30)) * visionSize + point2.y
		// )
		// this.visionLine6.setTo(
		// 	point2.x,
		// 	point2.y,
		// 	Math.cos(angle(this.matterImage.angle, 60)) * visionSize + point2.x,
		// 	Math.sin(angle(this.matterImage.angle, 60)) * visionSize + point2.y
		// )
		// this.visionLine7.setTo(
		// 	point2.x,
		// 	point2.y,
		// 	Math.cos(angle(this.matterImage.angle, 90)) * visionSize + point2.x,
		// 	Math.sin(angle(this.matterImage.angle, 90)) * visionSize + point2.y
		// )
		let bounds = this.matterImage.getBounds()
		for (let checkpoint of checkpoints) {
			if (Phaser.Geom.Intersects.LineToRectangle(checkpoint, bounds)) {
				for (let carSide of this.sides) {
					if (Phaser.Geom.Intersects.LineToLine(checkpoint, carSide) && this.lastCheckpoint !== checkpoint) {
						this.fitness++
						this.lastCheckpoint = checkpoint
						this.ticksToDie = this.defaultTicksToDie
						this.defaultTicksToDie -= 0.1
					}
				}
			}
		}
		this.aliveTicks++
		this.ticksToDie--
		if (this.ticksToDie <= 0) {
			return this.kill()
		}
		for (let line of trackLines) {
			if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
				for (let carSide of this.sides) {
					if (Phaser.Geom.Intersects.LineToLine(carSide, line)) {
						return this.kill()
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

		if (this.steerRatio !== undefined) {
			this.matterImage.angle += angleTurn * this.steerRatio
		} else if (this.leftKey) {
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

	public kill() {
		this.alive = false
		this.matterImage.setActive(false)
		this.matterImage.destroy()
		this.graphics.clear()
	}
}

function angle(degrees, changeAngle) {
	return ((degrees + changeAngle) * Math.PI) / 180
}
