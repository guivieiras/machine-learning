import Car from '../car'

export default class Brain {
	public car: Car
	constructor(car: Car) {
		this.car = car
	}
	public onUpdate() {}
}
