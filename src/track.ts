import { cursorTo } from 'readline'

export default class Track {
	public leftLines: Phaser.Geom.Line[] = []
	public rightLines: Phaser.Geom.Line[] = []
	public checkpoints: Phaser.Geom.Line[] = []
	public curve: Phaser.Curves.Spline
	public graphics: Phaser.GameObjects.Graphics

	public leftPrevious
	public rightPrevious
	public lastPosition = new Phaser.Math.Vector2()
	public showHelper: boolean

	get trackLines() {
		return [...this.leftLines, ...this.rightLines]
	}

	constructor(scene: Phaser.Scene) {
		this.graphics = scene.add.graphics()

		scene.input.on('pointerdown', this.onPointerDown, this)
		scene.input.on('pointermove', this.onPointerMove, this)
		scene.input.on('pointerup', () => {
			this.showHelper = false
			let leftLast = this.leftLines[this.leftLines.length - 1]
			let rightLast = this.rightLines[this.rightLines.length - 1]
			let leftFirst = this.leftLines[0]
			let rightFirst = this.rightLines[0]
			this.leftLines.push(new Phaser.Geom.Line(leftLast.x2, leftLast.y2, leftFirst.x1, leftFirst.y1))
			this.rightLines.push(new Phaser.Geom.Line(rightLast.x2, rightLast.y2, rightFirst.x1, rightFirst.y1))
		})
	}

	public update() {
		this.graphics.clear()

		this.graphics.lineStyle(2, 0xffffff)
		for (let line of this.trackLines) {
			this.graphics.strokeLineShape(line)
		}

		this.graphics.lineStyle(1, 0xff0000)
		for (let line of this.checkpoints) {
			this.graphics.strokeLineShape(line)
		}

		this.graphics.lineStyle(1, 0xffffff)
		if (this.curve && this.showHelper) {
			this.curve.draw(this.graphics, 99)
		}
	}

	private onPointerDown(this: Track, pointer: Phaser.Input.Pointer) {
		this.showHelper = true
		this.lastPosition.x = pointer.x
		this.lastPosition.y = pointer.y

		if (!this.curve) {
			this.curve = new Phaser.Curves.Spline([new Phaser.Math.Vector2(pointer.x, pointer.y)])
		} else {
			this.curve.addPoint(pointer.x, pointer.y)
		}
	}

	private onPointerMove(this: Track, pointer: Phaser.Input.Pointer) {
		if (pointer.isDown) {
			let x = pointer.x
			let y = pointer.y

			if (Phaser.Math.Distance.Between(x, y, this.lastPosition.x, this.lastPosition.y) > 64) {
				this.lastPosition.x = x
				this.lastPosition.y = y

				this.curve.addPoint(x, y)
				let t = this.curve.getUtoTmapping(0.7, undefined)
				let p = this.curve.getPoint(t)

				let left = this.curve
					.getTangent(t)
					.scale(50)
					.normalizeRightHand()
					.add(p)

				let right = this.curve
					.getTangent(t)
					.scale(-50)
					.normalizeRightHand()
					.add(p)

				if (this.leftPrevious) {
					this.leftLines.push(new Phaser.Geom.Line(this.leftPrevious.x, this.leftPrevious.y, left.x, left.y))
					this.rightLines.push(new Phaser.Geom.Line(this.rightPrevious.x, this.rightPrevious.y, right.x, right.y))
				}
				if (this.leftLines.length % 10 == 0) {
					this.checkpoints.push(new Phaser.Geom.Line(left.x, left.y, right.x, right.y))
				}

				this.leftPrevious = left
				this.rightPrevious = right

				this.graphics.clear()
				this.graphics.lineStyle(1, 0xbbbbbb)
				this.graphics.fillStyle(0xffff00)
				this.curve.draw(this.graphics, 64)
			}
		}
	}
}
